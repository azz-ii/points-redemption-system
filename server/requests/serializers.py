from rest_framework import serializers
from .models import RedemptionRequest, RedemptionRequestItem, RequestedForType
from items_catalogue.models import Variant
from distributers.models import Distributor
from customers.models import Customer


class RedemptionRequestItemSerializer(serializers.ModelSerializer):
    variant_name = serializers.SerializerMethodField()
    variant_code = serializers.SerializerMethodField()
    variant_option = serializers.SerializerMethodField()
    catalogue_item_name = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    pricing_type_display = serializers.SerializerMethodField()
    item_processed_by_name = serializers.SerializerMethodField()
    mktg_admin_id = serializers.SerializerMethodField()
    mktg_admin_name = serializers.SerializerMethodField()
    item_legend = serializers.SerializerMethodField()

    class Meta:
        model = RedemptionRequestItem
        fields = [
            'id', 'variant', 'variant_name', 'variant_code', 'variant_option',
            'catalogue_item_name', 'quantity', 'points_per_item', 
            'total_points', 'image_url',
            # Dynamic pricing fields
            'pricing_type', 'pricing_type_display', 'dynamic_quantity', 'points_multiplier',
            # Item-level processing fields
            'item_processed_by', 'item_processed_by_name', 'item_processed_at',
            'mktg_admin_id', 'mktg_admin_name', 'item_legend'
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

    def get_pricing_type_display(self, obj):
        """Human-readable pricing type"""
        pricing_labels = {
            'FIXED': 'Fixed',
            'PER_SQFT': 'Per Sq Ft',
            'PER_INVOICE': 'Per Invoice Amount',
            'PER_DAY': 'Per Day',
            'PER_EU_SRP': 'Per EU SRP',
        }
        return pricing_labels.get(obj.pricing_type, obj.pricing_type) if obj.pricing_type else 'Fixed'

    def get_item_processed_by_name(self, obj):
        if obj.item_processed_by:
            profile = getattr(obj.item_processed_by, 'profile', None)
            if profile:
                return profile.full_name or obj.item_processed_by.username
            return obj.item_processed_by.username
        return None

    def get_mktg_admin_id(self, obj):
        """Get the mktg_admin user ID from the catalogue item"""
        if obj.variant and obj.variant.catalogue_item.mktg_admin:
            return obj.variant.catalogue_item.mktg_admin.id
        return None

    def get_mktg_admin_name(self, obj):
        """Get the mktg_admin name from the catalogue item"""
        if obj.variant and obj.variant.catalogue_item.mktg_admin:
            mktg_admin = obj.variant.catalogue_item.mktg_admin
            profile = getattr(mktg_admin, 'profile', None)
            if profile:
                return profile.full_name or mktg_admin.username
            return mktg_admin.username
        return None

    def get_item_legend(self, obj):
        """Get the legend of the catalogue item"""
        if obj.variant and obj.variant.catalogue_item:
            return obj.variant.catalogue_item.legend
        return None


class RedemptionRequestSerializer(serializers.ModelSerializer):
    items = RedemptionRequestItemSerializer(many=True, read_only=True)
    requested_by_name = serializers.SerializerMethodField()
    requested_for_name = serializers.SerializerMethodField()
    requested_for_customer_name = serializers.SerializerMethodField()
    reviewed_by_name = serializers.SerializerMethodField()
    processed_by_name = serializers.SerializerMethodField()
    cancelled_by_name = serializers.SerializerMethodField()
    team_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    processing_status_display = serializers.CharField(source='get_processing_status_display', read_only=True)
    points_deducted_from_display = serializers.CharField(source='get_points_deducted_from_display', read_only=True)
    
    # Dual approval fields
    sales_approved_by_name = serializers.SerializerMethodField()
    marketing_approved_by_name = serializers.SerializerMethodField()
    pending_approvals = serializers.SerializerMethodField()
    
    # Marketing processing status
    marketing_processing_status = serializers.SerializerMethodField()

    class Meta:
        model = RedemptionRequest
        fields = [
            'id', 'requested_by', 'requested_by_name', 'requested_for', 
            'requested_for_name', 'requested_for_customer', 'requested_for_customer_name',
            'requested_for_type', 'team', 'team_name', 'points_deducted_from', 
            'points_deducted_from_display', 'total_points', 'status', 'status_display',
            'processing_status', 'processing_status_display', 'date_requested', 
            'reviewed_by', 'reviewed_by_name', 'date_reviewed', 
            'processed_by', 'processed_by_name', 'date_processed',
            'cancelled_by', 'cancelled_by_name', 'date_cancelled',
            'remarks', 'rejection_reason', 'withdrawal_reason',
            # Dual approval fields
            'requires_sales_approval', 'requires_marketing_approval',
            'sales_approval_status', 'sales_approved_by', 'sales_approved_by_name',
            'sales_approval_date', 'sales_rejection_reason',
            'marketing_approval_status', 'marketing_approved_by', 'marketing_approved_by_name',
            'marketing_approval_date', 'marketing_rejection_reason',
            'pending_approvals', 'marketing_processing_status',
            # SVC fields
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
        # Returns name based on the entity type
        return obj.get_requested_for_name()

    def get_requested_for_customer_name(self, obj):
        return obj.requested_for_customer.name if obj.requested_for_customer else None

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

    def get_sales_approved_by_name(self, obj):
        if obj.sales_approved_by:
            profile = getattr(obj.sales_approved_by, 'profile', None)
            if profile:
                return profile.full_name or obj.sales_approved_by.username
            return obj.sales_approved_by.username
        return None

    def get_marketing_approved_by_name(self, obj):
        if obj.marketing_approved_by:
            profile = getattr(obj.marketing_approved_by, 'profile', None)
            if profile:
                return profile.full_name or obj.marketing_approved_by.username
            return obj.marketing_approved_by.username
        return None

    def get_pending_approvals(self, obj):
        return obj.get_pending_approvals()

    def get_marketing_processing_status(self, obj):
        """Get the marketing processing status for this request"""
        return obj.get_marketing_processing_status()


class CreateRedemptionRequestSerializer(serializers.Serializer):
    requested_for = serializers.PrimaryKeyRelatedField(
        queryset=Distributor.objects.all(),
        required=False,
        allow_null=True
    )
    requested_for_customer = serializers.PrimaryKeyRelatedField(
        queryset=Customer.objects.all(),
        required=False,
        allow_null=True
    )
    requested_for_type = serializers.ChoiceField(
        choices=['DISTRIBUTOR', 'CUSTOMER'],
        default='DISTRIBUTOR'
    )
    points_deducted_from = serializers.ChoiceField(choices=['SELF', 'DISTRIBUTOR', 'CUSTOMER'])
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
    plate_number = serializers.CharField(max_length=20, required=False, allow_blank=True, allow_null=True)
    driver_name = serializers.CharField(max_length=100, required=False, allow_blank=True, allow_null=True)

    def validate(self, data):
        """Validate that exactly one of requested_for or requested_for_customer is provided based on type."""
        requested_for_type = data.get('requested_for_type', 'DISTRIBUTOR')
        requested_for = data.get('requested_for')
        requested_for_customer = data.get('requested_for_customer')
        points_deducted_from = data.get('points_deducted_from')
        
        if requested_for_type == 'DISTRIBUTOR':
            if not requested_for:
                raise serializers.ValidationError({
                    'requested_for': 'Distributor is required when requested_for_type is DISTRIBUTOR'
                })
            # Clear customer field if type is DISTRIBUTOR
            data['requested_for_customer'] = None
        elif requested_for_type == 'CUSTOMER':
            if not requested_for_customer:
                raise serializers.ValidationError({
                    'requested_for_customer': 'Customer is required when requested_for_type is CUSTOMER'
                })
            # Clear distributor field if type is CUSTOMER
            data['requested_for'] = None
        
        # Validate points_deducted_from matches the entity type
        if points_deducted_from == 'DISTRIBUTOR' and requested_for_type != 'DISTRIBUTOR':
            raise serializers.ValidationError({
                'points_deducted_from': 'Cannot deduct from distributor when request is for a customer'
            })
        if points_deducted_from == 'CUSTOMER' and requested_for_type != 'CUSTOMER':
            raise serializers.ValidationError({
                'points_deducted_from': 'Cannot deduct from customer when request is for a distributor'
            })
        
        return data

    def validate_items(self, value):
        """Validate that each item has required fields based on pricing type and available stock"""
        # Aggregate quantities per variant to check total requested
        variant_quantities = {}
        
        for item in value:
            if 'variant_id' not in item:
                raise serializers.ValidationError("Each item must have a variant_id")
            
            # Validate variant exists and get pricing type
            try:
                variant = Variant.objects.get(id=item['variant_id'])
            except Variant.DoesNotExist:
                raise serializers.ValidationError(f"Variant with id {item['variant_id']} does not exist")
            
            # Check requirements based on pricing type
            pricing_type = variant.pricing_type or 'FIXED'
            
            if pricing_type == 'FIXED':
                # Fixed pricing requires quantity
                if 'quantity' not in item:
                    raise serializers.ValidationError("Each FIXED pricing item must have a quantity")
                if item['quantity'] <= 0:
                    raise serializers.ValidationError("Quantity must be greater than 0")
                
                # Track quantity for stock validation
                qty = item['quantity']
            else:
                # Dynamic pricing requires dynamic_quantity
                if 'dynamic_quantity' not in item:
                    raise serializers.ValidationError(
                        f"Item '{variant.catalogue_item.item_name}' uses {pricing_type} pricing and requires a dynamic_quantity value"
                    )
                try:
                    dq = float(item['dynamic_quantity'])
                    if dq <= 0:
                        raise serializers.ValidationError(
                            f"dynamic_quantity must be greater than 0 for '{variant.catalogue_item.item_name}'"
                        )
                except (ValueError, TypeError):
                    raise serializers.ValidationError(
                        f"dynamic_quantity must be a valid number for '{variant.catalogue_item.item_name}'"
                    )
                
                # Validate that variant has points_multiplier set
                if not variant.points_multiplier:
                    raise serializers.ValidationError(
                        f"Item '{variant.catalogue_item.item_name}' has dynamic pricing but no points_multiplier configured"
                    )
                
                # Dynamic pricing items use quantity=1 for stock purposes
                qty = 1
            
            # Aggregate quantities per variant
            variant_id = item['variant_id']
            if variant_id in variant_quantities:
                variant_quantities[variant_id]['quantity'] += qty
            else:
                variant_quantities[variant_id] = {
                    'variant': variant,
                    'quantity': qty
                }
        
        # Validate available stock for all variants
        insufficient_stock_items = []
        for variant_id, data in variant_quantities.items():
            variant = data['variant']
            requested_qty = data['quantity']
            available = variant.available_stock  # stock - committed_stock
            
            if available < requested_qty:
                insufficient_stock_items.append({
                    'item_code': variant.item_code,
                    'item_name': variant.catalogue_item.item_name,
                    'option': variant.option_description or 'N/A',
                    'available': available,
                    'requested': requested_qty
                })
        
        if insufficient_stock_items:
            raise serializers.ValidationError({
                'insufficient_stock': insufficient_stock_items,
                'message': 'Not enough available stock for the following items'
            })
        
        return value

    def create(self, validated_data):
        from teams.models import TeamMembership
        from items_catalogue.models import ApprovalType
        from .models import ApprovalStatusChoice
        from django.db import transaction
        
        items_data = validated_data.pop('items')
        requested_by = self.context['request'].user
        
        # Get the user's team membership
        membership = TeamMembership.objects.filter(user=requested_by).first()
        
        # Pre-compute approval requirements from items
        requires_sales = False
        requires_marketing = False
        
        for item_data in items_data:
            variant = Variant.objects.select_related('catalogue_item').get(id=item_data['variant_id'])
            approval_type = variant.catalogue_item.approval_type
            if approval_type == ApprovalType.SALES_ONLY:
                requires_sales = True
            elif approval_type == ApprovalType.MARKETING_ONLY:
                requires_marketing = True
            elif approval_type == ApprovalType.BOTH:
                requires_sales = True
                requires_marketing = True
        
        # Use transaction to ensure atomicity for stock commitment
        with transaction.atomic():
            # Create the main request with team assignment and approval requirements
            redemption_request = RedemptionRequest.objects.create(
                requested_by=requested_by,
                team=membership.team if membership else None,
                requires_sales_approval=requires_sales,
                requires_marketing_approval=requires_marketing,
                sales_approval_status=ApprovalStatusChoice.PENDING if requires_sales else ApprovalStatusChoice.NOT_REQUIRED,
                marketing_approval_status=ApprovalStatusChoice.PENDING if requires_marketing else ApprovalStatusChoice.NOT_REQUIRED,
                requested_for=validated_data.get('requested_for'),
                requested_for_customer=validated_data.get('requested_for_customer'),
                requested_for_type=validated_data.get('requested_for_type', 'DISTRIBUTOR'),
                points_deducted_from=validated_data.get('points_deducted_from'),
                remarks=validated_data.get('remarks', ''),
                svc_date=validated_data.get('svc_date'),
                svc_time=validated_data.get('svc_time'),
                svc_driver=validated_data.get('svc_driver'),
                plate_number=validated_data.get('plate_number'),
                driver_name=validated_data.get('driver_name'),
            )
            
            # Create the request items, calculate total points, and commit stock
            total_points = 0
            for item_data in items_data:
                variant = Variant.objects.select_for_update().get(id=item_data['variant_id'])
                pricing_type = variant.pricing_type or 'FIXED'
                
                if pricing_type == 'FIXED':
                    # Fixed pricing: quantity * points_per_item
                    quantity = item_data['quantity']
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
                        total_points=item_total,
                        pricing_type=pricing_type,
                        dynamic_quantity=None,
                        points_multiplier=None
                    )
                    
                    # Commit stock for this item
                    variant.commit_stock(quantity)
                else:
                    # Dynamic pricing: dynamic_quantity * points_multiplier
                    from decimal import Decimal
                    dynamic_qty = Decimal(str(item_data['dynamic_quantity']))
                    points_multiplier = variant.points_multiplier or Decimal('0')
                    
                    item_total = int(dynamic_qty * points_multiplier)
                    total_points += item_total
                    
                    RedemptionRequestItem.objects.create(
                        request=redemption_request,
                        variant=variant,
                        quantity=1,  # Default to 1 for dynamic pricing items
                        points_per_item=None,
                        total_points=item_total,
                        pricing_type=pricing_type,
                        dynamic_quantity=dynamic_qty,
                        points_multiplier=points_multiplier
                    )
                    
                    # Commit stock for dynamic pricing items (quantity=1)
                    variant.commit_stock(1)
            
            # Update total points on the request
            redemption_request.total_points = total_points
            redemption_request.save()
        
        return redemption_request
