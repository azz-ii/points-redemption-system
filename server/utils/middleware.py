from django.http import JsonResponse
from django.contrib.sessions.exceptions import SessionInterrupted


class SessionInterruptedMiddleware:
    """Convert SessionInterrupted (raised by SessionMiddleware when a session
    is deleted mid-request, e.g. by a concurrent new login) into a clean
    HTTP 401 JSON response so the frontend can detect and handle it.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        try:
            response = self.get_response(request)
        except SessionInterrupted:
            return JsonResponse(
                {'detail': 'Session expired. Please log in again.'},
                status=401,
            )
        return response
