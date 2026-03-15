import os
import boto3
from auth_helpers import check_user_access

dynamodb = boto3.resource("dynamodb")
users_table = dynamodb.Table(os.environ["USERS_TABLE"])


def handler(event, context):
    identity = event.get("identity", {})
    user_id = identity.get("sub", "")

    # Validate caller has access
    user = check_user_access(user_id)

    prefs = user.get("notificationPreferences", {})

    return {
        "emailNotifications": prefs.get("emailNotifications", True),
        "pushNotifications": prefs.get("pushNotifications", True),
        "inAppNotifications": prefs.get("inAppNotifications", True),
        "marketingEmails": prefs.get("marketingEmails", True),
    }
