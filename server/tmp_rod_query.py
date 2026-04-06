"""
Diagnostic script for Rod (user id=62) - why can't he place a redemption request?
Run with: python manage.py shell -c "exec(open('tmp_rod_query.py', encoding='utf-8').read())"
"""
from django.contrib.auth import get_user_model
from users.models import UserProfile
from teams.models import TeamMembership
import os

User = get_user_model()
SEP = "=" * 60

out_lines = []
def log(msg):
    out_lines.append(str(msg))

# -- 1. User & Profile --
u = User.objects.select_related('profile').get(id=62)
p = u.profile

log(SEP)
log("1. USER ACCOUNT (id=62, Rod)")
log(SEP)
log(f"  username          : {u.username}")
log(f"  is_active         : {u.is_active}")
log(f"  is_staff          : {u.is_staff}")
log(f"  date_joined       : {u.date_joined}")
log(f"  last_login        : {u.last_login}")

log("")
log(SEP)
log("2. PROFILE")
log(SEP)
log(f"  full_name         : {p.full_name}")
log(f"  position          : {p.position}")
log(f"  points            : {p.points}")
log(f"  is_activated      : {p.is_activated}")
log(f"  is_archived       : {p.is_archived}")
log(f"  uses_points       : {p.uses_points}")
log(f"  can_self_request  : {p.can_self_request}")

# -- 2. Team membership (most common blocker) --
log("")
log(SEP)
log("3. TEAM MEMBERSHIP  <-- most common blocker")
log(SEP)
membership = TeamMembership.objects.filter(user=u).first()
if membership:
    team = membership.team
    log(f"  [OK] In team id={team.id}  name={team.name}")
    members = team.members
    log(f"  team members      : {[m.username for m in members]}")
    log(f"  team approver     : {team.approver.username if team.approver else 'NONE -- WARNING'}")
    log(f"  team is_archived  : {team.is_archived}")
else:
    log("  [BLOCK] NO TEAM MEMBERSHIP -- this WILL block request creation!")
    log("         (views.py line 165: raises ValidationError)")

# -- 3. Distributor / Customer scope --
log("")
log(SEP)
log("4. DISTRIBUTORS (global, any agent can request for any)")
log(SEP)
from distributers.models import Distributor
all_dists = Distributor.objects.filter(is_archived=False).count()
log(f"  Total active distributors: {all_dists}")

# -- 4. Customer: BASILIO MOTORSHOP --
log("")
log(SEP)
log("5. CUSTOMER: BASILIO MOTORSHOP")
log(SEP)
from customers.models import Customer
try:
    cust = Customer.objects.get(name__iexact='BASILIO MOTORSHOP')
    log(f"  id                : {cust.id}")
    log(f"  name              : {cust.name}")
    log(f"  is_archived       : {cust.is_archived}")
    log(f"  is_prospect       : {cust.is_prospect}")
    log(f"  brand             : {repr(cust.brand)}")
    log(f"  sales_channel     : {repr(cust.sales_channel)}")
    if cust.is_archived:
        log("  [BLOCK] CUSTOMER IS ARCHIVED -- serializer will reject this!")
    elif cust.is_prospect:
        log("  [WARN]  Customer is a PROSPECT (is_prospect=True)")
    else:
        log("  [OK] Customer is active and not a prospect")
except Customer.DoesNotExist:
    log("  [BLOCK] Customer 'BASILIO MOTORSHOP' NOT FOUND in database!")
    similar = Customer.objects.filter(name__icontains='basilio')
    log(f"  Similar (icontains 'basilio'): {[c.name for c in similar]}")
except Customer.MultipleObjectsReturned:
    matches = Customer.objects.filter(name__iexact='BASILIO MOTORSHOP')
    log(f"  [WARN] Multiple records: {[(c.id, c.is_archived) for c in matches]}")

# -- 5. Product: Personal Vehicle Fuel --
log("")
log(SEP)
log("6. PRODUCT: Personal Vehicle Fuel")
log(SEP)
from items_catalogue.models import Product
try:
    prod = Product.objects.prefetch_related('extra_fields').get(item_name__iexact='Personal Vehicle Fuel')
    log(f"  id                     : {prod.id}")
    log(f"  item_name              : {prod.item_name}")
    log(f"  item_code              : {prod.item_code}")
    log(f"  points                 : {prod.points}")
    log(f"  is_archived            : {prod.is_archived}")
    log(f"  has_stock              : {prod.has_stock}")
    log(f"  requires_sales_approval: {prod.requires_sales_approval}")
    log(f"  pricing_formula        : {prod.pricing_formula}")
    if prod.has_stock:
        log(f"  stock                  : {prod.stock}")
        log(f"  committed_stock        : {prod.committed_stock}")
        avail = prod.available_stock
        log(f"  available_stock        : {avail}")
        if avail <= 0:
            log("  [BLOCK] NO AVAILABLE STOCK -- serializer will reject!")
        else:
            log("  [OK] Stock available")
    extra_fields = prod.extra_fields.all()
    required_extras = [ef.field_key for ef in extra_fields if ef.is_required]
    optional_extras = [ef.field_key for ef in extra_fields if not ef.is_required]
    log(f"  required extra fields  : {required_extras}")
    log(f"  optional extra fields  : {optional_extras}")
    if prod.is_archived:
        log("  [BLOCK] PRODUCT IS ARCHIVED -- cannot be redeemed!")
except Product.DoesNotExist:
    log("  [BLOCK] Product 'Personal Vehicle Fuel' NOT FOUND!")
    similar = Product.objects.filter(item_name__icontains='fuel')
    log(f"  Similar (icontains 'fuel'): {[(p2.item_name, p2.id) for p2 in similar]}")
except Product.MultipleObjectsReturned:
    matches = Product.objects.filter(item_name__iexact='Personal Vehicle Fuel')
    log(f"  [WARN] Multiple: {[(p2.id, p2.item_name, p2.is_archived) for p2 in matches]}")

# -- 6. All requests by Rod --
log("")
log(SEP)
log("7. ALL REDEMPTION REQUESTS BY ROD (last 10)")
log(SEP)
from requests.models import RedemptionRequest
qs = RedemptionRequest.objects.filter(requested_by_id=62).order_by('-date_requested')
log(f"  Total requests ever: {qs.count()}")
for r in qs[:10]:
    cname = r.requested_for_customer.name if r.requested_for_customer else '-'
    dname = r.requested_for.name if r.requested_for else '-'
    log(f"    id={r.id:<4}  status={r.status:<10}  type={r.requested_for_type:<12}  customer={cname}  dist={dname}  date={r.date_requested.strftime('%Y-%m-%d')}")

# -- 7. Summary --
log("")
log(SEP)
log("8. SUMMARY / LIKELY ROOT CAUSE")
log(SEP)
issues = []
if not membership:
    issues.append("[BLOCK] Rod has NO team membership (hard block in views.py:165)")
elif team.is_archived:
    issues.append("[BLOCK] Rod's team is ARCHIVED")
if not u.is_active:
    issues.append("[BLOCK] Rod's Django user is inactive")
if p.is_archived:
    issues.append("[BLOCK] Rod's profile is archived")
if not p.is_activated:
    issues.append("[BLOCK] Rod's profile is_activated=False")

if not issues:
    log("  No obvious account/team issues.")
    log("  Check above sections for: archived customer/product, zero stock, missing extra fields.")
else:
    for issue in issues:
        log(f"  {issue}")

with open('rod_diag_out_v2.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(out_lines))
print('SUCCESS! Wrote rod_diag_out_v2.txt')
