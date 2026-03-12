"""
Shared password strength validation utilities.
"""
import re

# Special characters allowed per product requirements
SPECIAL_CHARS = r'!@#$%^&*()_+'
SPECIAL_RE = re.compile(r'[!@#$%^&*()_+]')


def validate_password_strength(password: str) -> str | None:
    """
    Validate password against strength rules.

    Rules:
    - At least 8 characters
    - At least one uppercase letter (A-Z)
    - At least one lowercase letter (a-z)
    - At least one digit (0-9)
    - At least one special character: !@#$%^&*()_+

    Returns an error message string if validation fails, or None if the
    password passes all rules.
    """
    if not password or len(password) < 8:
        return "Password must be at least 8 characters long."

    if not re.search(r'[A-Z]', password):
        return "Password must contain at least one uppercase letter (A-Z)."

    if not re.search(r'[a-z]', password):
        return "Password must contain at least one lowercase letter (a-z)."

    if not re.search(r'[0-9]', password):
        return "Password must contain at least one number (0-9)."

    if not SPECIAL_RE.search(password):
        return f"Password must contain at least one special character ({SPECIAL_CHARS})."

    return None


def validate_password_min_length(password: str, min_length: int = 8) -> str | None:
    """
    Relaxed validation — only enforces a minimum character length.
    Used for the superadmin account-creation path where complexity rules
    are intentionally not required.

    Returns an error message string if validation fails, or None on success.
    """
    if not password or len(password) < min_length:
        return f"Password must be at least {min_length} characters long."
    return None
