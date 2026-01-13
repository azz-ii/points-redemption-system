from rest_framework import serializers
from .models import RedemptionRequest, RedemptionRequestItem
from items_catalogue.models import Variant
from distributers.models import Distributor


class RedemptionRequestItemSerializer(serializers.ModelSerializer):
    variant_name = serializers.SerializerMethodField()
    variant_code = serializers.SerializerMethodField()
    variant_option = serializers.SerializerMethodField()
    catalogue_item_name = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = RedemptionRequestItem
        fields = [
            'id', 'variant', 'variant_name', 'variant_code', 'variant_option',
            'catalogue_item_name', 'quantity', 'points_per_item', 
            'total_points', 'image_url'
        ]
        read_only_fields = ['id']

    def get_variant_name(self, obj):
        return obj.variant.catalogue_item.item_name if obj.variant else None

    def get_variant_code(self, obj):
        return obj.variant.item_code if obj.variant else None

    def get_variant_option(self, obj):
        return obj.variant.option_description if obj.variant else None

    def get_catalogue_item_name(self, obj):
        return obj.variant.catalogue_item.item_name if obj.variant else None

    def get_image_url(self, obj):
        return obj.variant.image_url if obj.variant else None


class RedemptionRequestSerializer(serializers.ModelSerializer):
    items = RedemptionRequestItemSerializer(many=True, read_only=True)
    requested_by_name = serializers.SerializerMethodField()
    requested_for_name = serializers.SerializerMethodField()
    reviewed_by_name = serializers.SerializerMethodField()
    processed_by_name = serializers.SerializerMethodField()
    cancelled_by_name = serializers.SerializerMethodField()
    team_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    processing_status_display = serializers.CharField(source='get_processing_status_display', read_only=True)
    points_deducted_from_display = serializers.CharField(source='get_points_deducted_from_display', read_only=True)

    class Meta:
        model = RedemptionRequest
        fields = [
            'id', 'requested_by', 'requested_by_name', 'requested_for', 
            'requested_for_name', 'team', 'team_name', 'points_deducted_from', 
            'points_deducted_from_display', 'total_points', 'status', 'status_display',
            'processing_status', 'processing_status_display', 'date_requested', 
            'reviewed_by', 'reviewed_by_name', 'date_reviewed', 
            'processed_by', 'processed_by_name', 'date_processed',
            'cancelled_by', 'cancelled_by_name', 'date_cancelled',
            'remarks', 'rejection_reason', 
            'svc_date', 'svc_time', 'svc_driver',
            'items'
        ]
        read_only_fields = ['id', 'date_requested', 'reviewed_by', 'date_reviewed', 
                            'processed_by', 'date_processed', 'cancelled_by', 'date_cancelled', 'team']

    def get_requested_by_name(self, obj):
        if obj.requested_by:
            profile = getattr(obj.requested_by, 'profile', None)
            if profile:
                return profile.full_name or obj.requested_by.username
            return obj.requested_by.username
        return None

    def get_requested_for_name(self, obj):
        return obj.requested_for.name if obj.requested_for else None

    def get_team_name(self, obj):
        return obj.team.name if obj.team else None

    def get_reviewed_by_name(self, obj):
        if obj.reviewed_by:
            profile = getattr(obj.reviewed_by, 'profile', None)
            if profile:
                return profile.full_name or obj.reviewed_by.username
            return obj.reviewed_by.username
        return None

    def get_processed_by_name(self, obj):
        if obj.processed_by:
            profile = getattr(obj.processed_by, 'profile', None)
            if profile:
                return profile.full_name or obj.processed_by.username
            return obj.processed_by.username
        return None

    def get_cancelled_by_name(self, obj):
        if obj.cancelled_by:
            profile = getattr(obj.cancelled_by, 'profile', None)
            if profile:
                return profile.full_name or obj.cancelled_by.username
            return obj.cancelled_by.username
        return None


class CreateRedemptionRequestSerializer(serializers.Serializer):
    requested_for = serializers.PrimaryKeyRelatedField(queryset=Distributor.objects.all())
    points_deducted_from = serializers.ChoiceField(choices=['SELF', 'DISTRIBUTOR'])
    remarks = serializers.CharField(required=False, allow_blank=True)
    items = serializers.ListField(
        child=serializers.DictField(),
        min_length=1
    )
    # Service Vehicle Use fields (optional)
    svc_date = serializers.DateField(required=False, allow_null=True)
    svc_time = serializers.TimeField(required=False, allow_null=True)
    svc_driver = serializers.ChoiceField(
        choices=['WITH_DRIVER', 'WITHOUT_DRIVER'],
        required=False,
        allow_null=True
    )

    def validate_items(self, value):
        """Validate that each item has required fields"""
        for item in value:
            if 'variant_id' not in item:
                raise serializers.ValidationError("Each item must have a variant_id")
            if 'quantity' not in item:
                raise serializers.ValidationError("Each item must have a quantity")
            if item['quantity'] <= 0:
                raise serializers.ValidationError("Quantity must be greater than 0")
            
            # Validate variant exists
            try:
                Variant.objects.get(id=item['variant_id'])
            except Variant.DoesNotExist:
                raise serializers.ValidationError(f"Variant with id {item['variant_id']} does not exist")
        
        return value

    def create(self, validated_data):
        from teams.models import TeamMembership
        
        items_data = validated_data.pop('items')
        requested_by = self.context['request'].user
        
        # Get the user's team membership
        membership = TeamMembership.objects.filter(user=requested_by).first()
        
        # Create the main request with team assignment
        redemption_request = RedemptionRequest.objects.create(
            requested_by=requested_by,
            team=membership.team if membership else None,
            **validated_data
        )
        
        # Create the request items and calculate total points
        total_points = 0
        for item_data in items_data:
            variant = Variant.objects.get(id=item_data['variant_id'])
            quantity = item_data['quantity']
            
            # Parse points (handle numeric strings)
            try:
                points_per_item = int(float(variant.points))
            except (ValueError, TypeError):
                points_per_item = 0
            
            item_total = quantity * points_per_item
            total_points += item_total
            
            RedemptionRequestItem.objects.create(
                request=redemption_request,
                variant=variant,
                quantity=quantity,
                points_per_item=points_per_item,
                total_points=item_total
            )
        
        # Update total points on the request
        redemption_request.total_points = total_points
        redemption_request.save()
        
        return redemption_request
