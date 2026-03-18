"""
Storage service — handles uploading/downloading images to/from Supabase Storage
and generating signed URLs.
"""

from __future__ import annotations

import mimetypes
from uuid import UUID

from app.config import settings
from app.utils.logging import get_logger
from app.utils.supabase import supabase_client

logger = get_logger(__name__)


async def upload_image_to_storage(
    user_id: str | UUID,
    analysis_id: str | UUID,
    image_bytes: bytes,
    content_type: str,
) -> str:
    """
    Upload an image to Supabase Storage in the configured bucket.
    Path format: {user_id}/originals/{analysis_id}.{ext}
    Returns the storage path (NOT public URL).
    """
    ext = mimetypes.guess_extension(content_type) or ".bin"
    if content_type == "image/jpeg":
        ext = ".jpg"
    elif content_type == "image/png":
        ext = ".png"
    elif content_type == "image/webp":
        ext = ".webp"
    elif content_type == "image/gif":
        ext = ".gif"
    elif content_type == "image/svg+xml":
        ext = ".svg"

    file_path = f"{user_id}/originals/{analysis_id}{ext}"

    logger.info(f"Uploading image to storage: {file_path}", extra={"size_bytes": len(image_bytes)})

    supabase_client.storage.from_(settings.storage_bucket).upload(
        path=file_path,
        file=image_bytes,
        file_options={"content-type": content_type},
    )

    return file_path


async def upload_degraded_image(
    user_id: str | UUID,
    analysis_id: str | UUID,
    image_bytes: bytes,
) -> str:
    """
    Upload the degraded/simulated image to Supabase Storage.
    Path format: {user_id}/degraded/{analysis_id}.png
    Returns the storage path.
    """
    file_path = f"{user_id}/degraded/{analysis_id}.png"

    logger.info(f"Uploading degraded image to storage: {file_path}")

    supabase_client.storage.from_(settings.storage_bucket).upload(
        path=file_path,
        file=image_bytes,
        file_options={"content-type": "image/png"},
    )

    return file_path


def download_image_from_storage(storage_path: str) -> bytes:
    """
    Download an image from Supabase Storage by its storage path.
    Returns the raw bytes.
    """
    logger.info(f"Downloading image from storage: {storage_path}")
    res = supabase_client.storage.from_(settings.storage_bucket).download(storage_path)
    return res


def get_signed_url(storage_path: str, expires_in: int = 3600) -> str:
    """
    Generate a signed URL for a storage path.
    Default expiry is 1 hour (3600 seconds).
    """
    if not storage_path:
        return ""
    try:
        result = supabase_client.storage.from_(settings.storage_bucket).create_signed_url(
            storage_path,
            expires_in=expires_in,
        )
        return result.get("signedURL", "")
    except Exception as e:
        logger.warning(f"Failed to create signed URL for {storage_path}: {e}")
        return ""


async def delete_image_from_storage(
    user_id: str | UUID,
    analysis_id: str | UUID,
) -> None:
    """
    Delete all images related to an analysis from Supabase Storage.
    Deletes originals, degraded, and report files.
    """
    bucket = supabase_client.storage.from_(settings.storage_bucket)
    files_to_remove = []

    # Find original files
    try:
        files = bucket.list(f"{user_id}/originals")
        for f in files:
            if f.get("name", "").startswith(str(analysis_id)):
                files_to_remove.append(f"{user_id}/originals/{f['name']}")
    except Exception:
        pass

    # Find degraded files
    try:
        files = bucket.list(f"{user_id}/degraded")
        for f in files:
            if f.get("name", "").startswith(str(analysis_id)):
                files_to_remove.append(f"{user_id}/degraded/{f['name']}")
    except Exception:
        pass

    # Find report files
    try:
        files = bucket.list(f"{user_id}/reports")
        for f in files:
            if f.get("name", "").startswith(str(analysis_id)):
                files_to_remove.append(f"{user_id}/reports/{f['name']}")
    except Exception:
        pass

    if files_to_remove:
        logger.info(f"Deleting storage files: {files_to_remove}")
        bucket.remove(files_to_remove)


async def delete_all_user_files(user_id: str | UUID) -> None:
    """
    Delete all files belonging to a specific user from all storage buckets.
    """
    uid_str = str(user_id)
    
    # 1. Clean up squint-images bucket (structured by user_id prefix)
    images_bucket = supabase_client.storage.from_(settings.storage_bucket)
    folders = ["originals", "degraded", "reports"]
    
    for folder in folders:
        try:
            files = images_bucket.list(f"{uid_str}/{folder}")
            if files:
                paths = [f"{uid_str}/{folder}/{f['name']}" for f in files if f.get("name")]
                if paths:
                    logger.info(f"Deleting user images in {folder}: {paths}")
                    images_bucket.remove(paths)
        except Exception:
            pass

    # 2. Clean up avatars bucket
    try:
        avatars_bucket = supabase_client.storage.from_("avatars")
        # Avatars are often stored as {user_id}.{ext} at root or in folder
        files = avatars_bucket.list()
        avatar_files = [f["name"] for f in files if f.get("name", "").startswith(uid_str)]
        if avatar_files:
            logger.info(f"Deleting user avatars: {avatar_files}")
            avatars_bucket.remove(avatar_files)
    except Exception:
        pass
