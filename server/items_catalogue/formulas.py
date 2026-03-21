from decimal import Decimal

def driver_multiplier(base_points, extra_data, product):
    """Service Vehicle: 2x points if 'driver_type' == 'WITH_DRIVER'."""
    if extra_data.get('driver_type') == 'WITH_DRIVER':
        return int(base_points * 2)
    return int(base_points)

def area_rate(base_points, extra_data, product):
    """L x W x H x points_multiplier."""
    try:
        length = Decimal(str(extra_data.get('length', 0) or 0))
        width = Decimal(str(extra_data.get('width', 0) or 0))
        height = Decimal(str(extra_data.get('height', 0) or 0))
    except (ValueError, TypeError, Decimal.InvalidOperation):
        length = Decimal('0')
        width = Decimal('0')
        height = Decimal('0')
        
    rate = product.points_multiplier or Decimal('0')
    return int(length * width * height * rate)

def per_sqft(base_points, extra_data, product):
    """Calculates points by squaring inputs."""
    try:
        sqft = Decimal(str(extra_data.get('sqft', 0) or 0))
    except (ValueError, TypeError, Decimal.InvalidOperation):
        sqft = Decimal('0')
    rate = product.points_multiplier or Decimal('0')
    return int(sqft * rate)

def per_invoice(base_points, extra_data, product):
    """Calculates points based on invoice amount."""
    try:
        amount = Decimal(str(extra_data.get('invoice_amount', 0) or 0))
    except (ValueError, TypeError, Decimal.InvalidOperation):
        amount = Decimal('0')
    rate = product.points_multiplier or Decimal('0')
    return int(amount * rate)

def per_day(base_points, extra_data, product):
    """Calculates points based on number of days."""
    try:
        days = Decimal(str(extra_data.get('days', 0) or 0))
    except (ValueError, TypeError, Decimal.InvalidOperation):
        days = Decimal('0')
    rate = product.points_multiplier or Decimal('0')
    return int(days * rate)

FORMULA_REGISTRY = {
    'DRIVER_MULTIPLIER': driver_multiplier,
    'AREA_RATE': area_rate,
    'PER_SQFT': per_sqft,
    'PER_INVOICE': per_invoice,
    'PER_DAY': per_day,
}
