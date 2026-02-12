"""
Utility functions for creating points audit log entries.
"""
import uuid
from .models import PointsAuditLog


def log_points_change(
    entity_type: str,
    entity_id: int,
    entity_name: str,
    previous_points: int,
    new_points: int,
    action_type: str,
    changed_by,
    reason: str = '',
    batch_id=None,
):
    """Create a single audit log entry."""
    return PointsAuditLog.objects.create(
        entity_type=entity_type,
        entity_id=entity_id,
        entity_name=entity_name,
        previous_points=previous_points,
        new_points=new_points,
        points_delta=new_points - previous_points,
        action_type=action_type,
        changed_by=changed_by,
        reason=reason,
        batch_id=batch_id,
    )


def bulk_log_points_changes(entries: list):
    """
    Create multiple audit log entries efficiently using bulk_create.
    
    entries: list of dicts with keys:
        entity_type, entity_id, entity_name, previous_points, new_points,
        action_type, changed_by, reason, batch_id
    """
    logs = [
        PointsAuditLog(
            entity_type=e['entity_type'],
            entity_id=e['entity_id'],
            entity_name=e['entity_name'],
            previous_points=e['previous_points'],
            new_points=e['new_points'],
            points_delta=e['new_points'] - e['previous_points'],
            action_type=e['action_type'],
            changed_by=e['changed_by'],
            reason=e.get('reason', ''),
            batch_id=e.get('batch_id'),
        )
        for e in entries
    ]
    return PointsAuditLog.objects.bulk_create(logs)


def generate_batch_id():
    """Generate a UUID for grouping audit entries from a single API call."""
    return uuid.uuid4()
