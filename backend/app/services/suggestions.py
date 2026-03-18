"""
Rule-based suggestions engine.
Analyzes computed vision metrics and generates actionable recommendations for accessibility improvements.
"""

from __future__ import annotations
from typing import Any


def generate_suggestions(metrics: dict[str, Any], wcag_level: str = 'AA') -> list[dict[str, Any]]:
    """
    Evaluate vision metrics against strict heuristics to generate a 
    prioritized list of accessibility improvement suggestions.
    
    Returns a sorted list of dictionaries (ranked by severity then expected lift).
    """
    suggestions = []
    
    contrast = metrics.get('contrast_score', 100.0)
    font_size = metrics.get('font_size_score', 100.0)
    clutter = metrics.get('visual_clutter_score', 100.0)
    color = metrics.get('color_accessibility_score', 100.0)
    
    # Handle both percentage and fraction representing retention rate
    retention = metrics.get('ocr_retention_rate', 1.0)
    if retention > 1.0:
        retention = retention / 100.0

    # ── CONTRAST rules ────────────────────────────────────────────────────────
    if contrast < 40:
        req = "4.5:1" if wcag_level == "AA" else "7:1"
        suggestions.append({
            "dimension": "contrast",
            "severity": "critical",
            "suggestion_text": f"Increase text-to-background contrast ratio to at least {req} for normal text. Consider adjusting CSS color values: ensure foreground and background colors differ by at least 60 luminance units.",
            "expected_score_lift": 15.0
        })
    elif 40 <= contrast < 65:
        suggestions.append({
            "dimension": "contrast",
            "severity": "high",
            "suggestion_text": f"Contrast ratio is below WCAG {wcag_level}. Review text color pairings and avoid placing text over busy image backgrounds.",
            "expected_score_lift": 8.0
        })
    elif 65 <= contrast < 80:
        suggestions.append({
            "dimension": "contrast",
            "severity": "medium",
            "suggestion_text": "Contrast is borderline. Test with users who have low vision or view screens in direct sunlight.",
            "expected_score_lift": 4.0
        })

    # ── FONT SIZE rules ───────────────────────────────────────────────────────
    if font_size < 40:
        suggestions.append({
            "dimension": "font_size",
            "severity": "critical",
            "suggestion_text": "Text appears very small. Increase base font size to a minimum of 16px for body text. Use relative units (rem/em) to respect user browser settings.",
            "expected_score_lift": 12.0
        })
    elif 40 <= font_size < 65:
        suggestions.append({
            "dimension": "font_size",
            "severity": "high",
            "suggestion_text": "Some text elements may be too small for users with mild presbyopia. Audit text below 14px and consider 1.5× line-height.",
            "expected_score_lift": 6.0
        })

    # ── CLUTTER rules ─────────────────────────────────────────────────────────
    if clutter < 40:
        suggestions.append({
            "dimension": "visual_clutter",
            "severity": "high",
            "suggestion_text": "High visual clutter detected. Increase whitespace (padding/margin), reduce the number of distinct visual elements per viewport, and consider a cleaner layout grid.",
            "expected_score_lift": 8.0
        })
    elif 40 <= clutter < 60:
        suggestions.append({
            "dimension": "visual_clutter",
            "severity": "medium",
            "suggestion_text": "Moderate clutter. Consider grouping related elements and adding breathing room between sections.",
            "expected_score_lift": 4.0
        })

    # ── COLOR ACCESSIBILITY rules ─────────────────────────────────────────────
    if color < 50:
        suggestions.append({
            "dimension": "color_accessibility",
            "severity": "high",
            "suggestion_text": "Content may be difficult to distinguish for users with red-green color blindness (affects 8% of males). Avoid using red/green as the only differentiator. Add patterns, labels, or icons.",
            "expected_score_lift": 7.0
        })

    # ── OCR RETENTION rules ───────────────────────────────────────────────────
    if retention < 0.5:
        suggestions.append({
            "dimension": "legibility",
            "severity": "critical",
            "suggestion_text": "Less than 50% of text remains legible under visual stress simulation. This indicates severe readability failure across blur, contrast, and size dimensions.",
            "expected_score_lift": 20.0
        })
    elif 0.5 <= retention < 0.75:
        suggestions.append({
            "dimension": "legibility",
            "severity": "high",
            "suggestion_text": "Significant text loss under simulation. Key information may be unreadable to users with visual impairments or viewing in suboptimal conditions.",
            "expected_score_lift": 10.0
        })

    # ── SORTING & RANKING ─────────────────────────────────────────────────────
    severity_weights = {
        "critical": 4,
        "high": 3,
        "medium": 2,
        "low": 1
    }
    
    # Sort by severity (descending), then expected_lift (descending)
    suggestions.sort(
        key=lambda s: (severity_weights.get(s["severity"], 0), s.get("expected_score_lift", 0.0)),
        reverse=True
    )
    
    # Apply 1-indexed ranks
    for i, s in enumerate(suggestions):
        s["rank"] = i + 1

    return suggestions
