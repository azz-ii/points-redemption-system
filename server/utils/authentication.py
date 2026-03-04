from rest_framework.authentication import SessionAuthentication


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """Session authentication without CSRF checks for API endpoints.

    CSRF protection is provided by SameSite=Lax cookies instead of the
    traditional double-submit token pattern.  This allows cross-origin
    API calls from the frontend without requiring a CSRF token round-trip
    while still preventing cross-site form submissions.
    """

    def enforce_csrf(self, request):
        return  # Skip CSRF check

    def authenticate_header(self, request):
        # Returning a non-None value causes DRF to respond with HTTP 401
        # (instead of 403) for unauthenticated requests, which the frontend
        # uses to detect a killed/expired session.
        return 'Session'
