from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from .models import User, UserRole
from .permissions import IsAdmin
from .serializers import UserSerializer


class UserViewSet(ModelViewSet):
	queryset = User.objects.all().order_by('id')
	serializer_class = UserSerializer
	permission_classes = [IsAuthenticated, IsAdmin]

	@action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
	def me(self, request):
		"""
		Returns the profile of the currently authenticated user.
		Available to any authenticated user regardless of role.
		"""
		serializer = self.get_serializer(request.user)
		return Response(serializer.data)

	@action(
		detail=False,
		methods=['get'],
		permission_classes=[IsAuthenticated],
		url_path='doctors',
	)
	def doctors(self, request):
		"""
		Returns the list of all users with the DOCTOR role.
		Used by the appointment booking form to populate the doctor selector.
		"""
		doctors = User.objects.filter(role=UserRole.DOCTOR, is_active=True).order_by(
			'first_name', 'last_name'
		)
		serializer = self.get_serializer(doctors, many=True)
		return Response(serializer.data)