from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AppointmentViewSet, DashboardStatsView, MedicalRecordViewSet, PatientViewSet

router = DefaultRouter()
router.register(r'patients', PatientViewSet, basename='patient')
router.register(r'appointments', AppointmentViewSet, basename='appointment')
router.register(r'records', MedicalRecordViewSet, basename='record')

urlpatterns = [
	path('', include(router.urls)),
	path('dashboard/', DashboardStatsView.as_view(), name='dashboard-stats'),
]