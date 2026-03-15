#!/usr/bin/env python3
"""Setup admin user for QuestMaster."""
import boto3, sys

def setup_admin(email, password, env_name="dev"):
    client = boto3.client("cognito-idp", region_name="eu-west-1")
    # Look up user pool by name
    pools = client.list_user_pools(MaxResults=60)["UserPools"]
    pool = next((p for p in pools if p["Name"] == f"{env_name}-qm-users"), None)
    if not pool:
        print(f"User pool '{env_name}-qm-users' not found")
        sys.exit(1)
    pool_id = pool["Id"]

    # Create user
    try:
        client.admin_create_user(UserPoolId=pool_id, Username=email, UserAttributes=[{"Name": "email", "Value": email}, {"Name": "email_verified", "Value": "true"}], TemporaryPassword=password, MessageAction="SUPPRESS")
        client.admin_set_user_password(UserPoolId=pool_id, Username=email, Password=password, Permanent=True)
        print(f"Created user: {email}")
    except client.exceptions.UsernameExistsException:
        print(f"User exists: {email}")

    # Create admins group if not exists
    try:
        client.create_group(GroupName="admins", UserPoolId=pool_id, Description="Admin users")
        print("Created 'admins' group")
    except client.exceptions.GroupExistsException:
        pass

    # Add to admins group
    client.admin_add_user_to_group(UserPoolId=pool_id, Username=email, GroupName="admins")
    print(f"Added {email} to admins group")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python setup_admin.py <email> <password> [env_name]")
        sys.exit(1)
    setup_admin(sys.argv[1], sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else "dev")
