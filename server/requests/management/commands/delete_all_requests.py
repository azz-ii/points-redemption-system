"""
Management command to delete all redemption request data from the database.

This command:
1. Uncommits all committed stock across all products
2. Refunds all deducted points to original entities (Users, Distributors)
3. Deletes all request-related records (requests, items, fulfillment logs, photos)
4. Deletes all audit logs (PointsAuditLog, StockAuditLog)

Safety features:
- Requires --force flag to execute (prevents accidental deletion)
- Includes --dry-run mode to preview deletions without persisting
- Transactional: all-or-nothing execution
- Batch processing for large datasets
- Comprehensive logging and verification
"""

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.db.models import Prefetch
from django.contrib.auth.models import User

from requests.models import RedemptionRequest, RedemptionRequestItem, ItemFulfillmentLog, ProcessingPhoto
from items_catalogue.models import Product, StockAuditLog
from points_audit.models import PointsAuditLog
from points_audit.utils import bulk_log_points_changes, generate_batch_id


class Command(BaseCommand):
    help = (
        "Delete all redemption request data from the database. "
        "Uncommits stock, refunds points, and deletes audit logs. "
        "Use --dry-run to preview. Requires --force to execute."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Required flag to execute deletion (prevents accidental runs)',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Preview deletion without persisting changes',
        )
        parser.add_argument(
            '--batch-size',
            type=int,
            default=100,
            help='Number of records to process per batch (default: 100)',
        )

    def handle(self, *args, **options):
        """Main command handler"""
        force = options.get('force', False)
        dry_run = options.get('dry_run', False)
        batch_size = options.get('batch_size', 100)

        # If not forcing and not explicitly dry-running, default to dry-run
        if not force and not dry_run:
            dry_run = True

        if not force and dry_run:
            self.stdout.write(
                self.style.WARNING(
                    '\n⚠️  DRY-RUN MODE: Previewing deletions without persisting changes.\n'
                    '   Use --force to actually delete.\n'
                )
            )

        try:
            # Phase 1: Gather and display statistics
            self.stdout.write(self.style.SUCCESS('\n📊 Phase 1: Gathering Statistics...\n'))
            stats = self._gather_statistics()
            self._print_statistics(stats)

            if not force:
                # In dry-run only mode, stop after stats
                self.stdout.write(
                    self.style.SUCCESS(
                        '✅ Dry-run complete. Run with --force to execute deletion.\n'
                    )
                )
                return

            # Phase 2: Confirm with user
            self.stdout.write(
                self.style.WARNING(
                    f'\n⚠️  WARNING: About to delete {stats["total_requests"]} requests and refund points.\n'
                    '   This action CANNOT be undone. Type "DELETE ALL" to confirm.\n'
                )
            )
            confirm = input('>>> ')
            if confirm != 'DELETE ALL':
                self.stdout.write(self.style.ERROR('❌ Deletion cancelled.\n'))
                return

            # Phase 3-6: Execute deletion in transaction
            self.stdout.write(self.style.SUCCESS('\n🔄 Executing deletion (within transaction)...\n'))
            with transaction.atomic():
                refund_summary = self._execute_deletion(batch_size)

            # Final verification
            self.stdout.write(self.style.SUCCESS('\n✅ Deletion Complete!\n'))
            self._verify_deletion()
            self._print_refund_summary(refund_summary)

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'\n❌ Error: {str(e)}\n'))
            raise CommandError(str(e))

    def _gather_statistics(self):
        """Gather statistics about data to be deleted"""
        requests_qs = RedemptionRequest.objects.all()
        items_qs = RedemptionRequestItem.objects.all()
        fulfillment_logs_qs = ItemFulfillmentLog.objects.all()
        photos_qs = ProcessingPhoto.objects.all()
        points_logs_qs = PointsAuditLog.objects.all()
        stock_logs_qs = StockAuditLog.objects.all()

        # Calculate total stock to uncommit per product
        stock_to_uncommit = {}
        for request in requests_qs.prefetch_related(
            Prefetch(
                'items',
                queryset=RedemptionRequestItem.objects.select_related('product')
            )
        ):
            for item in request.items.all():
                if item.product.has_stock:
                    is_fixed = item.pricing_formula in ('NONE', None)
                    if is_fixed:
                        remaining = max(0, item.quantity - item.fulfilled_quantity)
                    else:
                        remaining = 0 if item.item_processed_by else item.quantity
                    
                    if remaining > 0:
                        product_id = item.product_id
                        stock_to_uncommit[product_id] = stock_to_uncommit.get(product_id, 0) + remaining

        # Calculate total points to refund
        total_points_to_refund = 0
        refunds_by_entity = {'USER': 0, 'DISTRIBUTOR': 0}
        
        for request in requests_qs:
            refund_points = 0
            for item in request.items.all():
                is_fixed = item.pricing_formula in ('NONE', None)
                if is_fixed:
                    remaining = max(0, item.quantity - item.fulfilled_quantity)
                    refund_points += remaining * (item.points_per_item or 0)
                else:
                    if not item.item_processed_by:
                        refund_points += item.total_points
            
            if refund_points > 0:
                total_points_to_refund += refund_points
                if request.points_deducted_from == 'SELF':
                    refunds_by_entity['USER'] += refund_points
                else:
                    refunds_by_entity['DISTRIBUTOR'] += refund_points

        return {
            'total_requests': requests_qs.count(),
            'total_items': items_qs.count(),
            'total_fulfillment_logs': fulfillment_logs_qs.count(),
            'total_photos': photos_qs.count(),
            'total_points_logs': points_logs_qs.count(),
            'total_stock_logs': stock_logs_qs.count(),
            'stock_to_uncommit': stock_to_uncommit,
            'total_points_to_refund': total_points_to_refund,
            'refunds_by_entity': refunds_by_entity,
        }

    def _print_statistics(self, stats):
        """Print deletion statistics"""
        self.stdout.write('='*70)
        self.stdout.write(self.style.WARNING('DELETION IMPACT PREVIEW'))
        self.stdout.write('='*70)
        
        self.stdout.write(f"\n📋 Records to Delete:")
        self.stdout.write(f"  • Requests:           {stats['total_requests']:,}")
        self.stdout.write(f"  • Request Items:      {stats['total_items']:,}")
        self.stdout.write(f"  • Fulfillment Logs:   {stats['total_fulfillment_logs']:,}")
        self.stdout.write(f"  • Processing Photos:  {stats['total_photos']:,}")
        self.stdout.write(f"  • Points Audit Logs:  {stats['total_points_logs']:,}")
        self.stdout.write(f"  • Stock Audit Logs:   {stats['total_stock_logs']:,}")
        
        self.stdout.write(f"\n📦 Stock to Uncommit:")
        if stats['stock_to_uncommit']:
            product_ids = list(stats['stock_to_uncommit'].keys())
            products = Product.objects.filter(id__in=product_ids).values('id', 'item_name', 'item_code')
            for product in products:
                qty = stats['stock_to_uncommit'][product['id']]
                self.stdout.write(f"  • {product['item_code']}: {qty:,} units")
        else:
            self.stdout.write("  (none)")
        
        self.stdout.write(f"\n💰 Points to Refund:")
        self.stdout.write(f"  • Total:              {stats['total_points_to_refund']:,}")
        self.stdout.write(f"  • To Users:           {stats['refunds_by_entity']['USER']:,}")
        self.stdout.write(f"  • To Distributors:    {stats['refunds_by_entity']['DISTRIBUTOR']:,}")
        self.stdout.write('\n' + '='*70 + '\n')

    def _execute_deletion(self, batch_size):
        """Execute the actual deletion with all cleanup"""
        refund_summary = {
            'user_refunds': [],
            'distributor_refunds': [],
            'total_stock_uncommitted': {},
        }

        # Get superuser or first user for changed_by field in audit logs
        system_user = User.objects.filter(is_superuser=True).first()
        if not system_user:
            system_user = User.objects.first()
        if not system_user:
            raise CommandError("No users found in database to use as changed_by")

        # Phase 1: Process stock and points in batches
        self.stdout.write('📦 Phase 2: Processing Stock & Points...')
        
        total_requests = RedemptionRequest.objects.count()
        request_batch = []
        batch_num = 0
        
        for idx, request in enumerate(
            RedemptionRequest.objects.prefetch_related(
                Prefetch(
                    'items',
                    queryset=RedemptionRequestItem.objects.select_related('product')
                )
            ),
            start=1
        ):
            request_batch.append(request)
            
            if idx % batch_size == 0 or idx == total_requests:
                batch_num += 1
                # Process this batch of requests
                for req in request_batch:
                    # Uncommit stock
                    for item in req.items.all():
                        if item.product.has_stock:
                            is_fixed = item.pricing_formula in ('NONE', None)
                            if is_fixed:
                                remaining = max(0, item.quantity - item.fulfilled_quantity)
                            else:
                                remaining = 0 if item.item_processed_by else item.quantity
                            
                            if remaining > 0:
                                item.product.uncommit_stock(remaining)
                                product_id = item.product_id
                                refund_summary['total_stock_uncommitted'][product_id] = (
                                    refund_summary['total_stock_uncommitted'].get(product_id, 0) + remaining
                                )
                    
                    # Calculate points to refund
                    refund_points = 0
                    for item in req.items.all():
                        is_fixed = item.pricing_formula in ('NONE', None)
                        if is_fixed:
                            remaining = max(0, item.quantity - item.fulfilled_quantity)
                            refund_points += remaining * (item.points_per_item or 0)
                        else:
                            if not item.item_processed_by:
                                refund_points += item.total_points
                    
                    # Refund points to appropriate entity
                    if refund_points > 0:
                        if req.points_deducted_from == 'SELF':
                            profile = req.requested_by.profile
                            profile.points += refund_points
                            profile.save(update_fields=['points'])
                            refund_summary['user_refunds'].append((req.requested_by_id, refund_points))
                            
                            # Determine entity name
                            entity_name = profile.full_name or req.requested_by.username
                            
                            # Log refund
                            bulk_log_points_changes(
                                [
                                    {
                                        'entity_type': 'USER',
                                        'entity_id': req.requested_by_id,
                                        'entity_name': entity_name,
                                        'action_type': 'REDEMPTION_REFUND',
                                        'previous_points': profile.points - refund_points,
                                        'new_points': profile.points,
                                        'reason': f'Deletion of request #{req.id}',
                                        'changed_by': system_user,
                                        'batch_id': generate_batch_id(),
                                    }
                                ]
                            )
                        elif req.points_deducted_from == 'DISTRIBUTOR':
                            distributor = req.requested_for
                            distributor.points += refund_points
                            distributor.save(update_fields=['points'])
                            refund_summary['distributor_refunds'].append((req.requested_for_id, refund_points))
                            
                            # Log refund
                            bulk_log_points_changes(
                                [
                                    {
                                        'entity_type': 'DISTRIBUTOR',
                                        'entity_id': req.requested_for_id,
                                        'entity_name': distributor.name,
                                        'action_type': 'REDEMPTION_REFUND',
                                        'previous_points': distributor.points - refund_points,
                                        'new_points': distributor.points,
                                        'reason': f'Deletion of request #{req.id}',
                                        'changed_by': system_user,
                                        'batch_id': generate_batch_id(),
                                    }
                                ]
                            )
                
                request_batch = []
                self.stdout.write(f"  ✓ Batch {batch_num}: Processed {min(idx, total_requests)} requests")

        # Phase 2: Delete audit logs
        self.stdout.write('\n📋 Phase 3: Deleting Audit Logs...')
        points_deleted, _ = PointsAuditLog.objects.all().delete()
        stock_deleted, _ = StockAuditLog.objects.all().delete()
        self.stdout.write(f"  ✓ Deleted {points_deleted:,} PointsAuditLog entries")
        self.stdout.write(f"  ✓ Deleted {stock_deleted:,} StockAuditLog entries")

        # Phase 3: Delete request data (cascades handle related objects)
        self.stdout.write('\n🗑️  Phase 4: Deleting Request Data...')
        requests_deleted, cascade_dict = RedemptionRequest.objects.all().delete()
        self.stdout.write(f"  ✓ Deleted {requests_deleted:,} total records (including cascades):")
        for model_name, count in cascade_dict.items():
            self.stdout.write(f"    - {model_name}: {count}")

        return refund_summary

    def _verify_deletion(self):
        """Verify that deletion was successful"""
        self.stdout.write('\n✔️  Phase 5: Verifying Deletion...')
        
        requests_count = RedemptionRequest.objects.count()
        items_count = RedemptionRequestItem.objects.count()
        fulfillment_logs_count = ItemFulfillmentLog.objects.count()
        photos_count = ProcessingPhoto.objects.count()
        points_logs_count = PointsAuditLog.objects.count()
        stock_logs_count = StockAuditLog.objects.count()
        
        all_zero = all([
            requests_count == 0,
            items_count == 0,
            fulfillment_logs_count == 0,
            photos_count == 0,
            points_logs_count == 0,
            stock_logs_count == 0,
        ])
        
        self.stdout.write(f"  • Requests:           {requests_count} (expected: 0) {'✓' if requests_count == 0 else '✗'}")
        self.stdout.write(f"  • Request Items:      {items_count} (expected: 0) {'✓' if items_count == 0 else '✗'}")
        self.stdout.write(f"  • Fulfillment Logs:   {fulfillment_logs_count} (expected: 0) {'✓' if fulfillment_logs_count == 0 else '✗'}")
        self.stdout.write(f"  • Processing Photos:  {photos_count} (expected: 0) {'✓' if photos_count == 0 else '✗'}")
        self.stdout.write(f"  • Points Audit Logs:  {points_logs_count} (expected: 0) {'✓' if points_logs_count == 0 else '✗'}")
        self.stdout.write(f"  • Stock Audit Logs:   {stock_logs_count} (expected: 0) {'✓' if stock_logs_count == 0 else '✗'}")
        
        # Verify committed stock is zero
        products_with_committed = Product.objects.filter(committed_stock__gt=0).count()
        self.stdout.write(f"  • Products with committed_stock > 0: {products_with_committed} (expected: 0) {'✓' if products_with_committed == 0 else '✗'}")
        
        if all_zero and products_with_committed == 0:
            self.stdout.write(self.style.SUCCESS('  ✓ All verifications passed!'))
        else:
            self.stdout.write(self.style.ERROR('  ✗ Some verifications failed!'))

    def _print_refund_summary(self, refund_summary):
        """Print summary of points refunded"""
        self.stdout.write('\n' + '='*70)
        self.stdout.write(self.style.SUCCESS('REFUND SUMMARY'))
        self.stdout.write('='*70)
        
        user_refunds = refund_summary.get('user_refunds', [])
        distributor_refunds = refund_summary.get('distributor_refunds', [])
        stock_uncommitted = refund_summary.get('total_stock_uncommitted', {})
        
        if user_refunds:
            self.stdout.write(f"\n👤 User Refunds ({len(user_refunds)} users):")
            total_user_points = sum(pts for _, pts in user_refunds)
            self.stdout.write(f"  • Total: {total_user_points:,} points")
        
        if distributor_refunds:
            self.stdout.write(f"\n🏢 Distributor Refunds ({len(distributor_refunds)} distributors):")
            total_dist_points = sum(pts for _, pts in distributor_refunds)
            self.stdout.write(f"  • Total: {total_dist_points:,} points")
        
        if stock_uncommitted:
            self.stdout.write(f"\n📦 Stock Uncommitted ({len(stock_uncommitted)} products):")
            total_stock = sum(stock_uncommitted.values())
            self.stdout.write(f"  • Total: {total_stock:,} units")
        
        self.stdout.write('\n' + '='*70 + '\n')
