from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


@method_decorator(csrf_exempt, name='dispatch')
class TestSessionView(APIView):
    """Test endpoint to check if request.user is authenticated"""
    
    def get(self, request):
        user_info = {
            "has_user": hasattr(request, 'user'),
            "user": str(getattr(request, 'user', None)),
            "user_id": getattr(request.user, 'id', None) if hasattr(request, 'user') else None,
            "is_authenticated": getattr(request.user, 'is_authenticated', False) if hasattr(request, 'user') else False,
            "username": getattr(request.user, 'username', None) if hasattr(request, 'user') else None,
            "session_keys": list(request.session.keys()) if hasattr(request, 'session') else []
        }
        
        print("[TEST SESSION]", user_info)
        
        return Response(user_info, status=status.HTTP_200_OK)
