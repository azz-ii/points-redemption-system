"""
Management command to clean up orphaned AR (Acknowledgement Receipt) records.

An orphaned AR record occurs when:
- The database points to an AR file that doesn't exist on disk
- The AR was marked as UPLOADED but the file was deleted or never saved properly
- Upload process failed but database record was created

This command can:
1. List all orphaned records
2. Delete database records for missing files (with --delete option)
3. Restore AR status from UPLOADED to PENDING for missing files
"""

import os
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from requests.models import RedemptionRequest, AcknowledgementReceiptStatus


class Command(BaseCommand):
    help = 'Clean up orphaned AR (Acknowledgement Receipt) records where files are missing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--delete',
            action='store_true',
            help='Delete database records for missing AR files (default: just list)',
        )
        parser.add_argument(
            '--restore',
            action='store_true',
            help='Restore AR status from UPLOADED to PENDING instead of deleting',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Skip confirmation prompt (non-interactive mode)',
        )
        parser.add_argument(
            '--request-id',
            type=int,
            help='Only check specific request ID',
        )

    def handle(self, *args, **options):
        delete_records = options['delete']
        restore_status = options['restore']
        force = options['force']
        request_id = options.get('request_id')

        # Find all requests with AR status UPLOADED
        query = RedemptionRequest.objects.filter(
            ar_status=AcknowledgementReceiptStatus.UPLOADED,
            acknowledgement_receipt__isnull=False
        ).exclude(acknowledgement_receipt='')

        if request_id:
            query = query.filter(id=request_id)

        orphaned_records = []

        self.stdout.write(self.style.WARNING(f"\n🔍 Scanning {query.count()} requests with uploaded AR files...\n"))

        for req in query:
            # Check if file exists
            if req.acknowledgement_receipt:
                file_path = req.acknowledgement_receipt.path
                if not os.path.exists(file_path):
                    orphaned_records.append({
                        'request': req,
                        'path': req.acknowledgement_receipt.name,
                        'full_path': file_path,
                    })

        if not orphaned_records:
            self.stdout.write(
                self.style.SUCCESS("✓ No orphaned AR records found!")
            )
            return

        self.stdout.write(
            self.style.WARNING(
                f"⚠️  Found {len(orphaned_records)} orphaned AR record(s):\n"
            )
        )

        for idx, record in enumerate(orphaned_records, 1):
            req = record['request']
            self.stdout.write(
                f"  {idx}. Request #{req.id} (AR #{req.ar_number})"
            )
            self.stdout.write(
                f"     Requested by: {req.requested_by.username if req.requested_by else 'Unknown'}"
            )
            self.stdout.write(
                f"     For: {req.get_requested_for_name()}"
            )
            self.stdout.write(
                f"     Missing file: {record['path']}"
            )
            self.stdout.write(
                f"     Uploaded by: {req.ar_uploaded_by.username if req.ar_uploaded_by else 'Unknown'}"
            )
            self.stdout.write(
                f"     Uploaded at: {req.ar_uploaded_at.isoformat() if req.ar_uploaded_at else 'Unknown'}"
            )
            self.stdout.write("")

        if delete_records and restore_status:
            raise CommandError("Cannot use --delete and --restore together. Choose one.")

        if delete_records:
            if not force and not self._confirm_action(f"Delete {len(orphaned_records)} orphaned record(s)?"):
                self.stdout.write(self.style.WARNING("Cancelled."))
                return

            deleted_count = 0
            for record in orphaned_records:
                req = record['request']
                self.stdout.write(
                    f"  Deleting: Request #{req.id} → {record['path']}"
                )
                req.acknowledgement_receipt.name = ''  # Clear file reference
                req.ar_status = AcknowledgementReceiptStatus.PENDING
                req.ar_uploaded_by = None
                req.ar_uploaded_at = None
                req.save(update_fields=[
                    'acknowledgement_receipt',
                    'ar_status',
                    'ar_uploaded_by',
                    'ar_uploaded_at'
                ])
                deleted_count += 1

            self.stdout.write(
                self.style.SUCCESS(
                    f"\n✓ Reset {deleted_count} orphaned record(s) to PENDING status"
                )
            )

        elif restore_status:
            if not force and not self._confirm_action(
                f"Restore {len(orphaned_records)} record(s) to PENDING status?"
            ):
                self.stdout.write(self.style.WARNING("Cancelled."))
                return

            restored_count = 0
            for record in orphaned_records:
                req = record['request']
                self.stdout.write(
                    f"  Restoring: Request #{req.id} (was {req.ar_status})"
                )
                req.acknowledgement_receipt.name = ''
                req.ar_status = AcknowledgementReceiptStatus.PENDING
                req.ar_uploaded_by = None
                req.ar_uploaded_at = None
                req.save(update_fields=[
                    'acknowledgement_receipt',
                    'ar_status',
                    'ar_uploaded_by',
                    'ar_uploaded_at'
                ])
                restored_count += 1

            self.stdout.write(
                self.style.SUCCESS(
                    f"\n✓ Restored {restored_count} record(s) to PENDING status"
                )
            )

        else:
            self.stdout.write(
                self.style.WARNING(
                    "\n💡 To fix these records, run with either:"
                )
            )
            self.stdout.write(
                "    --delete    (reset to PENDING and clear file reference)"
            )
            self.stdout.write(
                "    --restore   (same as --delete, restore to PENDING status)"
            )
            self.stdout.write(
                "\n    Add --force to skip confirmation prompt"
            )
            self.stdout.write(
                f"\nExample: python manage.py cleanup_orphaned_ars --delete --force"
            )

    def _confirm_action(self, prompt):
        """Ask user for confirmation."""
        self.stdout.write(self.style.WARNING(f"\n{prompt}"))
        response = input("Type 'yes' to confirm: ").strip().lower()
        return response == 'yes'
