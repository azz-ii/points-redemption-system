import os
from django.core.management.base import BaseCommand
from requests.models import RedemptionRequest, AcknowledgementReceiptStatus
from django.conf import settings

class Command(BaseCommand):
    help = 'Clear all existing Acknowledgement Receipts and reset AR number'

    def handle(self, *args, **kwargs):
        requests_with_ar = RedemptionRequest.objects.exclude(acknowledgement_receipt='') | RedemptionRequest.objects.exclude(received_by_signature='')
        
        count = 0
        for request in requests_with_ar:
            # Delete AR file
            if request.acknowledgement_receipt:
                try:
                    if os.path.isfile(request.acknowledgement_receipt.path):
                        os.remove(request.acknowledgement_receipt.path)
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f"Could not delete AR file for request {request.id}: {e}"))
                request.acknowledgement_receipt.delete(save=False)
            
            # Delete Signature file
            if request.received_by_signature:
                try:
                    if os.path.isfile(request.received_by_signature.path):
                        os.remove(request.received_by_signature.path)
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f"Could not delete signature file for request {request.id}: {e}"))
                request.received_by_signature.delete(save=False)
                
            request.ar_uploaded_by = None
            request.ar_uploaded_at = None
            request.ar_number = None
            
            if request.requested_for_type == 'CUSTOMER':
                request.ar_status = AcknowledgementReceiptStatus.PENDING
            else:
                request.ar_status = AcknowledgementReceiptStatus.NOT_REQUIRED
                
            request.save()
            count += 1
            
        # Reset any other requests that might have had numbers or wrong status
        other_requests = RedemptionRequest.objects.exclude(id__in=[r.id for r in requests_with_ar])
        for request in other_requests:
            changed = False
            if request.ar_number is not None:
                request.ar_number = None
                changed = True
            
            if request.requested_for_type == 'CUSTOMER' and request.ar_status == AcknowledgementReceiptStatus.UPLOADED:
                request.ar_status = AcknowledgementReceiptStatus.PENDING
                changed = True
                
            if request.requested_for_type != 'CUSTOMER' and request.ar_status != AcknowledgementReceiptStatus.NOT_REQUIRED:
                request.ar_status = AcknowledgementReceiptStatus.NOT_REQUIRED
                changed = True
                
            if changed:
                request.save()
                count += 1

        self.stdout.write(self.style.SUCCESS(f'Successfully reset ARs and wiped old files for {count} requests.'))
