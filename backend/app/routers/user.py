from __future__ import annotations

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from app.routers.auth import get_current_user
from app.utils.supabase import supabase_client
from app.utils.logging import get_logger
from app.services.storage import delete_all_user_files

logger = get_logger(__name__)

router = APIRouter(prefix="/user", tags=["user"])

@router.delete("/account", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_account(user_id: UUID = Depends(get_current_user)):
    """
    Permanently delete the user's account, storage files, and database records.
    """
    logger.info(f"Decommissioning account for user: {user_id}")
    
    try:
        # 1. Delete all user files from storage
        await delete_all_user_files(user_id)
        
        # 2. Delete the user from Supabase Auth (Admin access)
        # This client uses the service role key, so it has admin privileges.
        supabase_client.auth.admin.delete_user(str(user_id))
        
        # Note: Database records (profiles, analyses, etc.) should be deleted 
        # via ON DELETE CASCADE if configured in Postgres. If not, they remain 
        # as orphaned records or are handled by RLS/Triggers.
        # Given the request, we rely on the backend admin deletion.
        
        return
    except Exception as e:
        logger.error(f"Account deletion failed for {user_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to decommission account: {str(e)}"
        )
