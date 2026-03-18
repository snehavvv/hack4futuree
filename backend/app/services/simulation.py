"""
Transformation functions for simulating visual impairments and poor viewing conditions.
Each function is deterministic and independent, taking and returning BGR numpy arrays.
"""

from __future__ import annotations

import cv2
import numpy as np


def apply_gaussian_blur(image: np.ndarray, sigma: float = 3.0) -> np.ndarray:
    """
    Apply Gaussian blur to simulate myopia / viewing from distance.
    Returns a new blurred copy of the image.
    """
    if sigma <= 0:
        return image.copy()
    # OpenCV requires kernel size to be an odd integer, or 0 if computed from sigma.
    # Passing (0, 0) lets it automatically compute the kernel size based on sigma.
    return cv2.GaussianBlur(image, (0, 0), sigmaX=sigma, sigmaY=sigma)


def apply_contrast_reduction(image: np.ndarray, factor: float = 0.5) -> np.ndarray:
    """
    Reduce contrast by blending with gray (midpoint of luminance range).
    factor=1.0 is original, factor=0.0 is fully flat gray at 128.
    """
    if factor >= 1.0:
        return image.copy()
    
    # Create a completely gray image (mid-range luminance)
    gray_image = np.full(image.shape, 128, dtype=np.uint8)
    
    # Blend original and gray based on the factor
    # Result = image * factor + gray * (1 - factor)
    # cv2.addWeighted ensures operations stay within uint8 bounds
    return cv2.addWeighted(image, factor, gray_image, 1.0 - factor, 0.0)


def apply_glare(image: np.ndarray, intensity: float = 0.3) -> np.ndarray:
    """
    Add a bright elliptical highlight to simulate screen glare or sunlight
    positioned at the upper-center of the image.
    """
    if intensity <= 0:
        return image.copy()

    h, w = image.shape[:2]
    
    # Create an empty float32 mask for the glare
    glare_mask = np.zeros((h, w), dtype=np.float32)
    
    # Ellipse parameters
    center = (w // 2, h // 4)  # upper-center
    axes = (w // 2, h // 3)    # oval shape covering central top area
    angle = 0
    start_angle = 0
    end_angle = 360
    
    # Draw a filled ellipse
    cv2.ellipse(glare_mask, center, axes, angle, start_angle, end_angle, 1.0, -1)
    
    # Blur the mask aggressively to create a soft, gradient glare effect
    blur_kernel_size = min(w, h) // 4
    # ensure it's odd
    blur_kernel_size = blur_kernel_size if blur_kernel_size % 2 == 1 else blur_kernel_size + 1
    if blur_kernel_size > 0:
        glare_mask = cv2.GaussianBlur(glare_mask, (blur_kernel_size, blur_kernel_size), 0)
    
    # Normalize mask to [0, 1] range after blur
    max_val = glare_mask.max()
    if max_val > 0:
        glare_mask = glare_mask / max_val
    
    # Add the glare (bright white/pale)
    glare_color = np.array([255, 255, 255], dtype=np.float32)
    
    img_float = image.astype(np.float32)
    
    # Expand mask to 3 channels for broadcasting
    mask_3d = np.expand_dims(glare_mask * intensity, axis=2)
    
    # Output = image * (1 - mask*intensity) + color * (mask*intensity)
    blended = img_float * (1.0 - mask_3d) + glare_color * mask_3d
    
    return np.clip(blended, 0, 255).astype(np.uint8)


def apply_noise(image: np.ndarray, std: float = 15.0) -> np.ndarray:
    """
    Add Gaussian noise to simulate low-quality display, poor lighting, or bad print.
    Uses a fixed random seed for deterministic reproducible results.
    """
    if std <= 0:
        return image.copy()

    # Local random state with fixed seed (42) for deterministic output
    rng = np.random.RandomState(42)  
    
    # Generate Gaussian noise (mu=0, sigma=std)
    noise = rng.normal(0, std, image.shape)
    
    # Add noise to float representation
    noisy_img = image.astype(np.float32) + noise
    
    return np.clip(noisy_img, 0, 255).astype(np.uint8)


def apply_color_deficiency(image: np.ndarray, deficiency_type: str = 'deuteranopia') -> np.ndarray:
    """
    Simulate color vision deficiency using standard LMS matrices.
    Supported types: 'deuteranopia', 'protanopia', 'tritanopia'.
    Returns unchanged image if the type is not recognized.
    """
    # Standard LMS-to-RGB approximation simulation matrices for linear RGB
    # We apply them in the RGB color space.
    m_protanopia = np.array([
        [0.56667, 0.43333, 0.0],
        [0.55833, 0.44167, 0.0],
        [0.0, 0.24167, 0.75833]
    ], dtype=np.float32)
    
    m_deuteranopia = np.array([
        [0.625, 0.375, 0.0],
        [0.7, 0.3, 0.0],
        [0.0, 0.3, 0.7]
    ], dtype=np.float32)
    
    m_tritanopia = np.array([
        [0.95, 0.05, 0.0],
        [0.0, 0.43333, 0.56667],
        [0.0, 0.475, 0.525]
    ], dtype=np.float32)

    modes = {
        'protanopia': m_protanopia,
        'deuteranopia': m_deuteranopia,
        'tritanopia': m_tritanopia
    }
    
    matrix = modes.get(deficiency_type.lower())
    if matrix is None:
        return image.copy()
        
    # Convert OpenCV BGR to RGB
    rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB).astype(np.float32)
    
    # Matrix multiplication: resulting_rgb = initial_rgb * matrix^T
    # This transforms each [R, G, B] pixel effectively.
    transformed_rgb = np.dot(rgb, matrix.T)
    
    transformed_rgb = np.clip(transformed_rgb, 0, 255).astype(np.uint8)
    
    # Convert back to BGR
    return cv2.cvtColor(transformed_rgb, cv2.COLOR_RGB2BGR)


def apply_squint_simulation(image: np.ndarray, params: dict | None = None) -> np.ndarray:
    """
    Master function that applies multiple configured transforms in sequence:
    Blur -> Contrast -> Glare -> Noise
    
    Default parameters if omitted or empty:
    { 'blur_sigma': 3.0, 'contrast_factor': 0.5, 'glare_intensity': 0.2, 'noise_std': 10.0 }
    """
    if params is None:
        params = {}
        
    blur_sigma = params.get('blur_sigma', 3.0)
    contrast_factor = params.get('contrast_factor', 0.5)
    glare_intensity = params.get('glare_intensity', 0.2)
    noise_std = params.get('noise_std', 10.0)
    
    result = image.copy()
    
    if blur_sigma > 0:
        result = apply_gaussian_blur(result, blur_sigma)
        
    if contrast_factor < 1.0:
        result = apply_contrast_reduction(result, contrast_factor)
        
    if glare_intensity > 0:
        result = apply_glare(result, glare_intensity)
        
    if noise_std > 0:
        result = apply_noise(result, noise_std)
        
    return result
