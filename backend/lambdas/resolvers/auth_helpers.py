import os

import boto3

dynamodb = boto3.resource("dynamodb")
users_table = dynamodb.Table(os.environ["USERS_TABLE"])


def _get_groups_from_event(event):
    """Extracts Cognito groups from the AppSync event claims."""
    try:
        claims = event["identity"]["claims"]
        groups = claims.get("cognito:groups", [])
        if isinstance(groups, str):
            groups = [groups]
        return groups
    except (KeyError, TypeError):
        return []


def check_user_access(user_id):
    """Validates user status and raises an error if access is denied.

    Status mapping:
        - pending  -> raises "pending approval"
        - active   -> returns user record
        - suspended -> raises "suspended"
        - expired  -> raises "expired"
    """
    response = users_table.get_item(Key={"userId": user_id})
    user = response.get("Item")

    if not user:
        raise PermissionError("User not found")

    status = user.get("status", "pending")

    if status == "pending":
        raise PermissionError("Account is pending approval")
    elif status == "suspended":
        raise PermissionError("Account is suspended")
    elif status == "expired":
        raise PermissionError("Account has expired")
    elif status == "active":
        return user
    else:
        raise PermissionError(f"Unknown account status: {status}")


def check_admin_access(event, user_id):
    """Checks that the caller has admin access.

    Admin access is granted if the user belongs to the Cognito 'admins' group
    OR has role='admin' in the users table.

    Raises PermissionError if the user is not an admin.
    """
    groups = _get_groups_from_event(event)
    if "admins" in groups:
        return True

    response = users_table.get_item(Key={"userId": user_id})
    user = response.get("Item")

    if user and user.get("role") == "admin":
        return True

    raise PermissionError("Admin access required")
