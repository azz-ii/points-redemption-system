with open('requests/views.py', 'r') as f:
    content = f.read()
    
old = 'from .models import RedemptionRequest, RedemptionRequestItem, ItemFulfillmentLog, ProcessingPhoto, ApprovalStatusChoice, RequestStatus, RequestedForType, AcknowledgementReceiptStatus'
new = 'from .models import RedemptionRequest, RedemptionRequestItem, ItemFulfillmentLog, ProcessingPhoto, ApprovalStatusChoice, RequestStatus, RequestedForType, AcknowledgementReceiptStatus, ProcessingStatus'

content = content.replace(old, new)

with open('requests/views.py', 'w') as f:
    f.write(content)
    
print('Fixed: ProcessingStatus import added')
