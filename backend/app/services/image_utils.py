"""
Utility functions for interacting with image bytes, encoding, decoding, and extracting dimensions.
"""

from __future__ import annotations

import cv2
import numpy as np


def load_image_from_bytes(data: bytes) -> np.ndarray:
    """
    Load an image from raw bytes into an OpenCV numpy array (BGR).
    """
    # Convert bytes to a 1D numpy array of uint8
    nparr = np.frombuffer(data, np.uint8)
    
    # Decode the image with OpenCV in color mode (BGR)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        raise ValueError("Failed to decode image data using OpenCV. The bytes may be corrupted or in an unsupported format.")
        
    return img


def image_to_bytes(image: np.ndarray, format: str = 'PNG') -> bytes:
    """
    Convert an OpenCV BGR numpy array to raw image bytes in the specified format (e.g., 'PNG', 'JPEG').
    """
    ext = '.' + format.lower().lstrip('.')
    
    # Encode image into memory buffer
    success, buffer = cv2.imencode(ext, image)
    
    if not success:
        raise ValueError(f"Failed to encode image to format: {format}")
        
    return buffer.tobytes()


def get_image_dimensions(image: np.ndarray) -> tuple[int, int]:
    """
    Get the (width, height) tuple from an OpenCV image array.
    """
    # shape is (height, width, channels)
    h, w = image.shape[:2]
    return w, h
