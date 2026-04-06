from rest_framework import serializers
from .models import RedemptionRequest, RedemptionRequestItem, ItemFulfillmentLog, ProcessingPhoto, RequestedForType
from items_catalogue.models import Product
from distributers.models import Distributor
from customers.models import Customer


class ProcessingPhotoSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.SerializerMethodField()

    class Meta:
        model = ProcessingPhoto
        fields = ['id', 'photo', 'uploaded_by', 'uploaded_by_name', 'uploaded_at', 'caption']
        read_only_fields = ['id', 'uploaded_at']

    def get_uploaded_by_name(self, obj):
        if obj.uploaded_by:
            profile = getattr(obj.uploaded_by, 'profile', None)
            if profile:
                return profile.full_name or obj.uploaded_by.username
            return obj.uploaded_by.username
        return None


class ItemFulfillmentLogSerializer(serializers.ModelSerializer):
    fulfilled_by_name = serializers.SerializerMethodField()

    class Meta:
        model = ItemFulfillmentLog
        fields = ['id', 'fulfilled_quantity', 'fulfilled_by', 'fulfilled_by_name', 'fulfilled_at', 'notes']
        read_only_fields = ['id', 'fulfilled_at']

    def get_fulfilled_by_name(self, obj):
        if obj.fulfilled_by:
            profile = getattr(obj.fulfilled_by, 'profile', None)
            if profile:
                return profile.full_name or obj.fulfilled_by.username
            return obj.fulfilled_by.username
        return None


class RedemptionRequestItemSerializer(serializers.ModelSerializer):
    product_name = serializers.SerializerMethodField()
    product_code = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    item_processed_by_name = serializers.SerializerMethodField()
    item_legend = serializers.SerializerMethodField()
    remaining_quantity = serializers.SerializerMethodField()
    is_fully_fulfilled = serializers.SerializerMethodField()
    fulfillment_logs = ItemFulfillmentLogSerializer(many=True, read_only=True)

    class Meta:
        model = RedemptionRequestItem
        fields = [
            'id', 'product', 'product_name', 'product_code',
            'quantity', 'points_per_item',
            'total_points', 'image_url',
            # Dynamic pricing fields
            'points_multiplier',
            # Partial fulfillment fields
            'fulfilled_quantity', 'remaining_quantity', 'is_fully_fulfilled',
            # Item-level processing fields
            'item_processed_by', 'item_processed_by_name', 'item_processed_at',
            'item_legend',
            # Fulfillment history
            'fulfillment_logs',
            'extra_data', 'pricing_formula'
        ]
        read_only_fields = ['id']

    def get_product_name(self, obj):
        return obj.product.item_name if obj.product else None

    def get_product_code(self, obj):
        return obj.product.item_code if obj.product else None

    def get_image_url(self, obj):
        """Product images not implemented yet, return None"""
        return None

    def get_item_processed_by_name(self, obj):
        if obj.item_processed_by:
            profile = getattr(obj.item_processed_by, 'profile', None)
            if profile:
                return profile.full_name or obj.item_processed_by.username
            return obj.item_processed_by.username
        return None

    def get_item_legend(self, obj):
        """Get the legend of the product"""
        if obj.product:
            return obj.product.legend
        return None

    def get_remaining_quantity(self, obj):
        return obj.remaining_quantity

    def get_is_fully_fulfilled(self, obj):
        return obj.is_fully_fulfilled


class RedemptionRequestSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()
    processing_photos = ProcessingPhotoSerializer(many=True, read_only=True)
    requested_by_name = serializers.SerializerMethodField()
    requested_by_username = serializers.SerializerMethodField()
    requested_for_name = serializers.SerializerMethodField()
    requested_for_customer_name = serializers.SerializerMethodField()
    requested_for_customer_is_prospect = serializers.SerializerMethodField()
    reviewed_by_name = serializers.SerializerMethodField()
    processed_by_name = serializers.SerializerMethodField()
    cancelled_by_name = serializers.SerializerMethodField()
    team_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    processing_status_display = serializers.CharField(source='get_processing_status_display', read_only=True)
    points_deducted_from_display = serializers.CharField(source='get_points_deducted_from_display', read_only=True)
    
    # Dual approval fields
    sales_approved_by_name = serializers.SerializerMethodField()
    pending_approvals = serializers.SerializerMethodField()
    
    # Handler processing status
    marketing_processing_status = serializers.SerializerMethodField()

    # Acknowledgement Receipt fields
    ar_status_display = serializers.CharField(source='get_ar_status_display', read_only=True)
    ar_number = serializers.CharField(read_only=True)
    ar_uploaded_by_name = serializers.SerializerMethodField()
    received_by_signature_method_display = serializers.SerializerMethodField()

    class Meta:
        model = RedemptionRequest
        fields = [
            'id', 'requested_by', 'requested_by_name', 'requested_by_username', 'requested_for', 
            'requested_for_name', 'requested_for_customer', 'requested_for_customer_name',
            'requested_for_customer_is_prospect',
            'requested_for_type', 'team', 'team_name', 'points_deducted_from', 
            'points_deducted_from_display', 'total_points', 'status', 'status_display',
            'processing_status', 'processing_status_display', 'date_requested', 
            'reviewed_by', 'reviewed_by_name', 'date_reviewed', 
            'processed_by', 'processed_by_name', 'date_processed',
            'cancelled_by', 'cancelled_by_name', 'date_cancelled',
            'remarks', 'rejection_reason', 'withdrawal_reason',
            # Sales approval fields
            'requires_sales_approval',
            'sales_approval_status', 'sales_approved_by', 'sales_approved_by_name',
            'sales_approval_date', 'sales_rejection_reason',
            'pending_approvals', 'marketing_processing_status',
            # Acknowledgement Receipt fields
            'ar_status', 'ar_status_display', 'ar_number', 'acknowledgement_receipt',
            'ar_uploaded_by', 'ar_uploaded_by_name', 'ar_uploaded_at',
            # E-signature fields
            'received_by_signature', 'received_by_signature_method', 
            'received_by_signature_method_display', 'received_by_name', 'received_by_date',
            # SVC fields
            'svc_date', 'svc_time', 'svc_driver',
            'items',
            # Processing photos
            'processing_photos',
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

    def get_requested_by_username(self, obj):
        if obj.requested_by:
            return obj.requested_by.username
        return None

    def get_items(self, obj):
        """
        Return serialized items, filtered by handler assignment.
        Handler users only see items where product.mktg_admin == themselves.
        All other roles see every item in the request.
        Uses Python-level filtering over the prefetch cache to avoid extra queries.
        """
        request = self.context.get('request')
        user = request.user if request else None
        profile = getattr(user, 'profile', None) if user else None

        all_items = obj.items.all()  # hits prefetch cache from _base_queryset

        if profile and profile.position == 'Handler':
            # Filter to only items assigned to this handler
            all_items = [
                item for item in all_items
                if item.product_id and item.product.mktg_admin_id == user.id
            ]

        return RedemptionRequestItemSerializer(all_items, many=True).data

    def get_requested_for_name(self, obj):
        # Returns name based on the entity type
        return obj.get_requested_for_name()

    def get_requested_for_customer_name(self, obj):
        return obj.requested_for_customer.name if obj.requested_for_customer else None

    def get_requested_for_customer_is_prospect(self, obj):
        return obj.requested_for_customer.is_prospect if obj.requested_for_customer else None

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

    def get_pending_approvals(self, obj):
        return obj.get_pending_approvals()

    def get_ar_uploaded_by_name(self, obj):
        if obj.ar_uploaded_by:
            profile = getattr(obj.ar_uploaded_by, 'profile', None)
            if profile:
                return profile.full_name or obj.ar_uploaded_by.username
            return obj.ar_uploaded_by.username
        return None

    def get_received_by_signature_method_display(self, obj):
        """Get human-readable signature method display"""
        method_map = {
            'DRAWN': 'Digital Signature Pad',
            'PHOTO': 'Photo Upload'
        }
        return method_map.get(obj.received_by_signature_method, obj.received_by_signature_method)

    def get_marketing_processing_status(self, obj):
        """Get the handler processing status for this request"""
        return obj.get_handler_processing_status()


class CreateRedemptionRequestSerializer(serializers.Serializer):
    requested_for = serializers.PrimaryKeyRelatedField(
        queryset=Distributor.objects.filter(is_archived=False),
        required=False,
        allow_null=True
    )
    requested_for_customer = serializers.PrimaryKeyRelatedField(
        queryset=Customer.objects.filter(is_archived=False),
        required=False,
        allow_null=True
    )
    requested_for_type = serializers.ChoiceField(
        choices=['DISTRIBUTOR', 'CUSTOMER', 'SELF'],
        default='DISTRIBUTOR'
    )
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
    plate_number = serializers.CharField(max_length=20, required=False, allow_blank=True, allow_null=True)
    driver_name = serializers.CharField(max_length=100, required=False, allow_blank=True, allow_null=True)

    def validate(self, data):
        """Validate that exactly one of requested_for or requested_for_customer is provided based on type."""
        requested_for_type = data.get('requested_for_type', 'DISTRIBUTOR')
        requested_for = data.get('requested_for')
        requested_for_customer = data.get('requested_for_customer')
        points_deducted_from = data.get('points_deducted_from')
        
        user = self.context['request'].user
        profile = getattr(user, 'profile', None)

        if requested_for_type == 'SELF':
            # Validate that the user is an Approver with can_self_request
            if not profile or profile.position != 'Approver':
                raise serializers.ValidationError({
                    'requested_for_type': 'Only Approvers can create self-requests'
                })
            if not profile.can_self_request:
                raise serializers.ValidationError({
                    'requested_for_type': 'You are not authorized to create self-requests. Please contact your administrator.'
                })
            # Clear entity fields for SELF requests
            data['requested_for'] = None
            data['requested_for_customer'] = None
            # Force points_deducted_from to SELF (deducted from approver's own points)
            data['points_deducted_from'] = 'SELF'
        elif requested_for_type == 'DISTRIBUTOR':
            if profile and profile.position == 'Approver':
                # Approvers with self request can request for distributor
                if not profile.can_self_request:
                    raise serializers.ValidationError({
                        'requested_for_type': 'You are not authorized to create distributor requests.'
                    })

            if not requested_for:
                raise serializers.ValidationError({
                    'requested_for': 'Distributor is required when requested_for_type is DISTRIBUTOR'
                })
            # Validate distributor is not archived
            if requested_for.is_archived:
                raise serializers.ValidationError({
                    'requested_for': 'Cannot create request for archived distributor'
                })
            # Clear customer field if type is DISTRIBUTOR
            data['requested_for_customer'] = None
        elif requested_for_type == 'CUSTOMER':
            if profile and profile.position == 'Approver':
                raise serializers.ValidationError({
                    'requested_for_type': 'Approvers cannot create requests for customers.'
                })

            if not requested_for_customer:
                raise serializers.ValidationError({
                    'requested_for_customer': 'Customer is required when requested_for_type is CUSTOMER'
                })
            # Validate customer is not archived
            if requested_for_customer.is_archived:
                raise serializers.ValidationError({
                    'requested_for_customer': 'Cannot create request for archived customer'
                })
            # Clear distributor field if type is CUSTOMER
            data['requested_for'] = None
        
        # Validate points_deducted_from matches the entity type
        if points_deducted_from == 'DISTRIBUTOR' and requested_for_type != 'DISTRIBUTOR':
            raise serializers.ValidationError({
                'points_deducted_from': 'Cannot deduct from distributor when request is for a customer'
            })
        
        return data

    def validate_items(self, value):
        """Validate that each item has required fields based on pricing type and available stock"""
        # Aggregate quantities per product to check total requested
        product_quantities = {}
        
        for item in value:
            if 'product_id' not in item:
                raise serializers.ValidationError("Each item must have a product_id")
            
            # Validate product exists, is not archived, and get pricing type
            try:
                product = Product.objects.get(id=item['product_id'])
            except Product.DoesNotExist:
                raise serializers.ValidationError(f"Product with id {item['product_id']} does not exist")
            
            if product.is_archived:
                raise serializers.ValidationError(f"Product '{product.item_name}' is archived and cannot be redeemed")
            
            # Validate extra data
            extra_data = item.get('extra_data', {})
            extra_fields = product.extra_fields.all()
            for ef in extra_fields:
                if ef.is_required and ef.field_key not in extra_data:
                    raise serializers.ValidationError(
                        f"Missing required extra field '{ef.field_key}' for product '{product.item_name}'"
                    )

            # Every item must have a quantity
            if 'quantity' not in item:
                raise serializers.ValidationError("Each item must have a quantity")
            if item['quantity'] <= 0:
                raise serializers.ValidationError("Quantity must be greater than 0")

            qty = item['quantity']

            # Aggregate quantities per product
            product_id = item['product_id']
            if product_id in product_quantities:
                product_quantities[product_id]['quantity'] += qty
            else:
                product_quantities[product_id] = {
                    'product': product,
                    'quantity': qty
                }
        
        # Validate available stock for all products (skip items with has_stock=False)
        insufficient_stock_items = []
        for product_id, data in product_quantities.items():
            product = data['product']
            requested_qty = data['quantity']
            
            # Skip stock validation for made-to-order items
            if not product.has_stock:
                continue
            
            available = product.available_stock  # stock - committed_stock
            
            if available < requested_qty:
                insufficient_stock_items.append({
                    'item_code': product.item_code,
                    'item_name': product.item_name,
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
        from .models import ApprovalStatusChoice
        from django.db import transaction
        
        items_data = validated_data.pop('items')
        requested_by = self.context['request'].user
        
        # Get the user's team membership
        membership = TeamMembership.objects.filter(user=requested_by).first()
        
        # Use transaction to ensure atomicity for stock commitment
        with transaction.atomic():
            # Create the main request with team assignment
            # Note: requires_sales_approval will be computed after items are added
            redemption_request = RedemptionRequest.objects.create(
                requested_by=requested_by,
                team=membership.team if membership else None,
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
                product = Product.objects.select_for_update().get(id=item_data['product_id'])
                pricing_formula = product.pricing_formula
                extra_data = item_data.get('extra_data', {})
                quantity = item_data.get('quantity', 1)
                
                try:
                    base_points_per_item = int(float(product.points))
                except (ValueError, TypeError):
                    base_points_per_item = 0

                if pricing_formula and pricing_formula != 'NONE':
                    from items_catalogue.formulas import FORMULA_REGISTRY
                    from decimal import Decimal
                    formula_func = FORMULA_REGISTRY.get(pricing_formula)
                    
                    if not formula_func:
                        raise serializers.ValidationError(f"Formula '{pricing_formula}' is not registered.")
                    
                    # Calculate total right from formula, ignoring fixed/dynamic split as formula dictates cost.
                    item_total = formula_func(Decimal(str(base_points_per_item)), extra_data, product)
                else:
                    item_total = quantity * base_points_per_item
                    
                total_points += item_total
                
                RedemptionRequestItem.objects.create(
                    request=redemption_request,
                    product=product,
                    quantity=quantity,
                    points_per_item=base_points_per_item,
                    total_points=item_total,
                    points_multiplier=product.points_multiplier,
                    extra_data=extra_data,
                    pricing_formula=pricing_formula
                )
                product.commit_stock(quantity)
            
            # Update total points on the request
            redemption_request.total_points = total_points
            redemption_request.save()
            
            # Compute approval requirements based on products
            # This will auto-approve if no items require sales approval
            # and deduct points accordingly
            try:
                redemption_request.compute_approval_requirements()
            except ValueError as e:
                # If points deduction fails (insufficient points), rollback transaction
                raise serializers.ValidationError({
                    'error': 'Insufficient points',
                    'detail': str(e)
                })
        
        return redemption_request


class PartialFulfillmentItemSerializer(serializers.Serializer):
    """Validates a single item entry in a partial fulfillment request."""
    item_id = serializers.IntegerField()
    fulfilled_quantity = serializers.IntegerField(min_value=1, required=False, allow_null=True)
    notes = serializers.CharField(required=False, allow_blank=True, allow_null=True, default='')


class PartialFulfillmentSerializer(serializers.Serializer):
    """Validates the body sent to mark_items_processed."""
    items = PartialFulfillmentItemSerializer(many=True, min_length=1)
