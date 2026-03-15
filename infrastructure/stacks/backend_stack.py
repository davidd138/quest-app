import os
import aws_cdk as cdk
from constructs import Construct
from aws_cdk import (
    aws_cognito as cognito,
    aws_dynamodb as dynamodb,
    aws_appsync as appsync,
    aws_lambda as _lambda,
    aws_iam as iam,
    aws_secretsmanager as secretsmanager,
    aws_wafv2 as wafv2,
)


class BackendStack(cdk.Stack):
    def __init__(self, scope: Construct, construct_id: str, env_name: str, **kwargs):
        super().__init__(scope, construct_id, **kwargs)

        # ---- Pre-signup Lambda (auto-confirm for dev) ----
        pre_signup_fn = _lambda.Function(
            self, "PreSignupFn",
            runtime=_lambda.Runtime.PYTHON_3_11,
            handler="pre_signup.handler",
            code=_lambda.Code.from_asset(
                os.path.join(os.path.dirname(__file__), "..", "..", "backend", "lambdas", "triggers")
            ),
            function_name=f"{env_name}-qm-pre-signup",
        )

        # ---- Cognito ----
        user_pool = cognito.UserPool(
            self, "UserPool",
            user_pool_name=f"{env_name}-qm-users",
            self_sign_up_enabled=True,
            sign_in_aliases=cognito.SignInAliases(email=True),
            auto_verify=cognito.AutoVerifiedAttrs(email=True),
            password_policy=cognito.PasswordPolicy(
                min_length=12,
                require_lowercase=True,
                require_uppercase=True,
                require_digits=True,
                require_symbols=True,
            ),
            standard_attributes=cognito.StandardAttributes(
                email=cognito.StandardAttribute(required=True, mutable=True),
            ),
            account_recovery=cognito.AccountRecovery.EMAIL_ONLY,
            lambda_triggers=cognito.UserPoolTriggers(
                pre_sign_up=pre_signup_fn,
            ),
        )

        user_pool_client = user_pool.add_client(
            "AppClient",
            user_pool_client_name=f"{env_name}-qm-app-client",
            auth_flows=cognito.AuthFlow(
                user_password=True,
                user_srp=True,
            ),
        )

        # ---- DynamoDB Tables ----
        users_table = dynamodb.Table(
            self, "UsersTable",
            table_name=f"{env_name}-qm-users",
            partition_key=dynamodb.Attribute(name="userId", type=dynamodb.AttributeType.STRING),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=cdk.RemovalPolicy.DESTROY,
        )
        users_table.add_global_secondary_index(
            index_name="email-index",
            partition_key=dynamodb.Attribute(name="email", type=dynamodb.AttributeType.STRING),
        )

        quests_table = dynamodb.Table(
            self, "QuestsTable",
            table_name=f"{env_name}-qm-quests",
            partition_key=dynamodb.Attribute(name="id", type=dynamodb.AttributeType.STRING),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=cdk.RemovalPolicy.DESTROY,
        )

        progress_table = dynamodb.Table(
            self, "ProgressTable",
            table_name=f"{env_name}-qm-progress",
            partition_key=dynamodb.Attribute(name="id", type=dynamodb.AttributeType.STRING),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=cdk.RemovalPolicy.DESTROY,
        )
        progress_table.add_global_secondary_index(
            index_name="userId-questId-index",
            partition_key=dynamodb.Attribute(name="userId", type=dynamodb.AttributeType.STRING),
            sort_key=dynamodb.Attribute(name="questId", type=dynamodb.AttributeType.STRING),
        )

        conversations_table = dynamodb.Table(
            self, "ConversationsTable",
            table_name=f"{env_name}-qm-conversations",
            partition_key=dynamodb.Attribute(name="id", type=dynamodb.AttributeType.STRING),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=cdk.RemovalPolicy.DESTROY,
        )
        conversations_table.add_global_secondary_index(
            index_name="userId-startedAt-index",
            partition_key=dynamodb.Attribute(name="userId", type=dynamodb.AttributeType.STRING),
            sort_key=dynamodb.Attribute(name="startedAt", type=dynamodb.AttributeType.STRING),
        )

        scores_table = dynamodb.Table(
            self, "ScoresTable",
            table_name=f"{env_name}-qm-scores",
            partition_key=dynamodb.Attribute(name="id", type=dynamodb.AttributeType.STRING),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=cdk.RemovalPolicy.DESTROY,
        )
        scores_table.add_global_secondary_index(
            index_name="userId-completedAt-index",
            partition_key=dynamodb.Attribute(name="userId", type=dynamodb.AttributeType.STRING),
            sort_key=dynamodb.Attribute(name="completedAt", type=dynamodb.AttributeType.STRING),
        )

        achievements_table = dynamodb.Table(
            self, "AchievementsTable",
            table_name=f"{env_name}-qm-achievements",
            partition_key=dynamodb.Attribute(name="id", type=dynamodb.AttributeType.STRING),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=cdk.RemovalPolicy.DESTROY,
        )
        achievements_table.add_global_secondary_index(
            index_name="userId-earnedAt-index",
            partition_key=dynamodb.Attribute(name="userId", type=dynamodb.AttributeType.STRING),
            sort_key=dynamodb.Attribute(name="earnedAt", type=dynamodb.AttributeType.STRING),
        )

        # ---- Secrets Manager (reuse existing OpenAI secret) ----
        openai_secret = secretsmanager.Secret.from_secret_name_v2(
            self, "OpenAISecret",
            secret_name=f"{env_name}/openai-api-key",
        )

        # ---- AppSync (Cognito-only auth) ----
        api = appsync.GraphqlApi(
            self, "Api",
            name=f"{env_name}-qm-api",
            definition=appsync.Definition.from_file(
                os.path.join(os.path.dirname(__file__), "..", "..", "backend", "schema", "schema.graphql")
            ),
            authorization_config=appsync.AuthorizationConfig(
                default_authorization=appsync.AuthorizationMode(
                    authorization_type=appsync.AuthorizationType.USER_POOL,
                    user_pool_config=appsync.UserPoolConfig(user_pool=user_pool),
                ),
            ),
        )

        # ---- WAF for AppSync ----
        waf_acl = wafv2.CfnWebACL(
            self, "ApiWaf",
            scope="REGIONAL",
            default_action=wafv2.CfnWebACL.DefaultActionProperty(allow={}),
            visibility_config=wafv2.CfnWebACL.VisibilityConfigProperty(
                sampled_requests_enabled=True,
                cloud_watch_metrics_enabled=True,
                metric_name=f"{env_name}-qm-api-waf",
            ),
            rules=[
                wafv2.CfnWebACL.RuleProperty(
                    name="RateLimit",
                    priority=1,
                    action=wafv2.CfnWebACL.RuleActionProperty(block={}),
                    statement=wafv2.CfnWebACL.StatementProperty(
                        rate_based_statement=wafv2.CfnWebACL.RateBasedStatementProperty(
                            limit=1000,
                            aggregate_key_type="IP",
                        ),
                    ),
                    visibility_config=wafv2.CfnWebACL.VisibilityConfigProperty(
                        sampled_requests_enabled=True,
                        cloud_watch_metrics_enabled=True,
                        metric_name=f"{env_name}-qm-rate-limit",
                    ),
                ),
                wafv2.CfnWebACL.RuleProperty(
                    name="AWSCommonRules",
                    priority=2,
                    override_action=wafv2.CfnWebACL.OverrideActionProperty(none={}),
                    statement=wafv2.CfnWebACL.StatementProperty(
                        managed_rule_group_statement=wafv2.CfnWebACL.ManagedRuleGroupStatementProperty(
                            vendor_name="AWS",
                            name="AWSManagedRulesCommonRuleSet",
                        ),
                    ),
                    visibility_config=wafv2.CfnWebACL.VisibilityConfigProperty(
                        sampled_requests_enabled=True,
                        cloud_watch_metrics_enabled=True,
                        metric_name=f"{env_name}-qm-common-rules",
                    ),
                ),
            ],
        )

        wafv2.CfnWebACLAssociation(
            self, "ApiWafAssociation",
            resource_arn=api.arn,
            web_acl_arn=waf_acl.attr_arn,
        )

        # ---- Common Lambda environment ----
        common_env = {
            "USERS_TABLE": users_table.table_name,
            "QUESTS_TABLE": quests_table.table_name,
            "PROGRESS_TABLE": progress_table.table_name,
            "CONVERSATIONS_TABLE": conversations_table.table_name,
            "SCORES_TABLE": scores_table.table_name,
            "ACHIEVEMENTS_TABLE": achievements_table.table_name,
            "ENV_NAME": env_name,
        }

        tables = {
            "users": users_table,
            "quests": quests_table,
            "progress": progress_table,
            "conversations": conversations_table,
            "scores": scores_table,
            "achievements": achievements_table,
        }

        # ---- Helper to create Lambda + AppSync resolver ----
        def create_resolver(
            name: str, type_name: str, field_name: str,
            read_tables: list[str] | None = None,
            write_tables: list[str] | None = None,
            extra_env=None, timeout=30, memory=256,
        ):
            env = {**common_env, **(extra_env or {})}
            fn = _lambda.Function(
                self, f"{name}Fn",
                runtime=_lambda.Runtime.PYTHON_3_11,
                handler=f"{name}.handler",
                code=_lambda.Code.from_asset(
                    os.path.join(os.path.dirname(__file__), "..", "..", "backend", "lambdas", "resolvers")
                ),
                function_name=f"{env_name}-qm-{name.replace('_', '-')}",
                environment=env,
                timeout=cdk.Duration.seconds(timeout),
                memory_size=memory,
            )

            for t_name in (read_tables or []):
                tables[t_name].grant_read_data(fn)
            for t_name in (write_tables or []):
                tables[t_name].grant_read_write_data(fn)

            ds = api.add_lambda_data_source(f"{name}DS", fn)
            ds.create_resolver(
                id=f"{name}Resolver",
                type_name=type_name,
                field_name=field_name,
            )
            return fn

        # ---- Cognito IAM policy ----
        cognito_policy = iam.PolicyStatement(
            actions=[
                "cognito-idp:AdminGetUser",
                "cognito-idp:AdminListGroupsForUser",
            ],
            resources=[user_pool.user_pool_arn],
        )

        # ---- User resolvers ----
        sync_user_fn = create_resolver(
            "sync_user", "Mutation", "syncUser",
            write_tables=["users"],
            extra_env={"USER_POOL_ID": user_pool.user_pool_id},
        )
        sync_user_fn.add_to_role_policy(cognito_policy)

        create_resolver(
            "list_quests", "Query", "listQuests",
            read_tables=["quests", "users"],
        )

        create_resolver(
            "get_quest", "Query", "getQuest",
            read_tables=["quests", "users", "progress"],
        )

        create_resolver(
            "start_quest", "Mutation", "startQuest",
            read_tables=["quests", "users"],
            write_tables=["progress"],
        )

        create_resolver(
            "update_progress", "Mutation", "updateProgress",
            read_tables=["users"],
            write_tables=["progress"],
        )

        create_resolver(
            "complete_stage", "Mutation", "completeStage",
            read_tables=["quests", "users", "conversations"],
            write_tables=["progress", "scores", "achievements"],
        )

        create_resolver(
            "get_progress", "Query", "getProgress",
            read_tables=["progress", "users"],
        )

        create_resolver(
            "create_conversation", "Mutation", "createConversation",
            read_tables=["quests", "users", "progress"],
            write_tables=["conversations"],
        )

        create_resolver(
            "update_conversation", "Mutation", "updateConversation",
            read_tables=["users"],
            write_tables=["conversations"],
        )

        create_resolver(
            "get_conversation", "Query", "getConversation",
            read_tables=["conversations", "users"],
        )

        create_resolver(
            "list_conversations", "Query", "listConversations",
            read_tables=["conversations", "users"],
        )

        # Realtime token
        token_fn = create_resolver(
            "get_realtime_token", "Query", "getRealtimeToken",
            read_tables=["quests", "users"],
            extra_env={"OPENAI_SECRET_NAME": openai_secret.secret_name},
            timeout=10,
        )
        openai_secret.grant_read(token_fn)

        # Analyze conversation (Bedrock)
        analyze_fn = create_resolver(
            "analyze_conversation", "Mutation", "analyzeConversation",
            read_tables=["conversations", "quests", "users"],
            write_tables=["scores"],
            extra_env={"BEDROCK_MODEL_ID": "amazon.nova-pro-v1:0"},
            timeout=60,
            memory=512,
        )
        analyze_fn.add_to_role_policy(
            iam.PolicyStatement(
                actions=["bedrock:InvokeModel", "bedrock:Converse"],
                resources=[
                    "arn:aws:bedrock:*::foundation-model/anthropic.claude-*",
                    "arn:aws:bedrock:*::foundation-model/amazon.nova-*",
                    f"arn:aws:bedrock:*:{self.account}:inference-profile/us.anthropic.*",
                    f"arn:aws:bedrock:*:{self.account}:inference-profile/eu.anthropic.*",
                ],
            )
        )

        # Leaderboard & analytics
        create_resolver(
            "get_leaderboard", "Query", "getLeaderboard",
            read_tables=["scores", "users"],
        )

        create_resolver(
            "get_analytics", "Query", "getAnalytics",
            read_tables=["scores", "progress", "conversations", "users", "achievements"],
        )

        create_resolver(
            "get_achievements", "Query", "getAchievements",
            read_tables=["achievements", "users"],
        )

        # ---- GDPR / Data rights resolvers ----
        create_resolver(
            "export_user_data", "Query", "exportMyData",
            read_tables=["users", "progress", "conversations", "scores", "achievements"],
            write_tables=["users"],  # writes lastDataExportAt audit field
        )

        delete_user_data_fn = create_resolver(
            "delete_user_data", "Mutation", "deleteMyAccount",
            write_tables=["users", "progress", "conversations", "scores", "achievements"],
            extra_env={"USER_POOL_ID": user_pool.user_pool_id},
        )
        delete_user_data_fn.add_to_role_policy(
            iam.PolicyStatement(
                actions=["cognito-idp:AdminDeleteUser"],
                resources=[user_pool.user_pool_arn],
            )
        )

        # ---- Quest rating resolvers ----
        create_resolver(
            "rate_quest", "Mutation", "rateQuest",
            read_tables=["users", "quests"],
            write_tables=["scores"],
        )

        create_resolver(
            "get_quest_ratings", "Query", "getQuestRatings",
            read_tables=["scores", "users"],
        )

        # ---- Community quest resolver ----
        create_resolver(
            "create_community_quest", "Mutation", "createCommunityQuest",
            read_tables=["users"], write_tables=["quests"],
        )

        # ---- Moderation resolvers ----
        create_resolver(
            "report_content", "Mutation", "reportContent",
            read_tables=["users"], write_tables=["users"],
        )

        approve_quest_fn = create_resolver(
            "approve_quest", "Mutation", "approveQuest",
            read_tables=["users"], write_tables=["quests", "users"],
        )
        approve_quest_fn.add_to_role_policy(cognito_policy)

        list_pending_quests_fn = create_resolver(
            "list_pending_quests", "Query", "listPendingQuests",
            read_tables=["quests", "users"],
        )
        list_pending_quests_fn.add_to_role_policy(cognito_policy)

        list_content_reports_fn = create_resolver(
            "list_content_reports", "Query", "listContentReports",
            read_tables=["users"],
        )
        list_content_reports_fn.add_to_role_policy(cognito_policy)

        # ---- Public profile & search resolvers ----
        create_resolver(
            "get_user_profile", "Query", "getUserProfile",
            read_tables=["users"],
        )

        create_resolver(
            "search_quests", "Query", "searchQuests",
            read_tables=["quests", "users"],
        )

        # ---- Admin resolvers ----
        create_quest_fn = create_resolver(
            "create_quest", "Mutation", "createQuest",
            read_tables=["users"], write_tables=["quests"],
        )
        create_quest_fn.add_to_role_policy(cognito_policy)

        update_quest_fn = create_resolver(
            "update_quest", "Mutation", "updateQuest",
            read_tables=["users"], write_tables=["quests"],
        )
        update_quest_fn.add_to_role_policy(cognito_policy)

        delete_quest_fn = create_resolver(
            "delete_quest", "Mutation", "deleteQuest",
            read_tables=["users"], write_tables=["quests"],
        )
        delete_quest_fn.add_to_role_policy(cognito_policy)

        get_admin_analytics_fn = create_resolver(
            "get_admin_analytics", "Query", "getAdminAnalytics",
            read_tables=["users", "quests", "progress", "scores"],
        )
        get_admin_analytics_fn.add_to_role_policy(cognito_policy)

        list_all_users_fn = create_resolver(
            "list_all_users", "Query", "listAllUsers",
            read_tables=["users"],
        )
        list_all_users_fn.add_to_role_policy(cognito_policy)

        update_user_status_fn = create_resolver(
            "update_user_status", "Mutation", "updateUserStatus",
            read_tables=["users"], write_tables=["users"],
        )
        update_user_status_fn.add_to_role_policy(cognito_policy)

        # ---- AI Quest Generator ----
        generate_quest_ai_fn = create_resolver(
            "generate_quest_ai", "Mutation", "generateQuestAI",
            read_tables=["users"], write_tables=[],
            timeout=90,
            memory=512,
        )
        generate_quest_ai_fn.add_to_role_policy(cognito_policy)
        generate_quest_ai_fn.add_to_role_policy(
            iam.PolicyStatement(
                actions=["bedrock:InvokeModel", "bedrock:Converse"],
                resources=[
                    "arn:aws:bedrock:*::foundation-model/anthropic.claude-*",
                    "arn:aws:bedrock:*::foundation-model/amazon.nova-*",
                    f"arn:aws:bedrock:*:{self.account}:inference-profile/us.anthropic.*",
                    f"arn:aws:bedrock:*:{self.account}:inference-profile/eu.anthropic.*",
                ],
            )
        )

        # ---- Exports ----
        self.graphql_url = api.graphql_url
        self.user_pool_id = user_pool.user_pool_id
        self.user_pool_client_id = user_pool_client.user_pool_client_id

        cdk.CfnOutput(self, "GraphQLUrl", value=api.graphql_url, export_name=f"{env_name}-qm-graphql-url")
        cdk.CfnOutput(self, "UserPoolId", value=user_pool.user_pool_id, export_name=f"{env_name}-qm-user-pool-id")
        cdk.CfnOutput(self, "UserPoolClientId", value=user_pool_client.user_pool_client_id, export_name=f"{env_name}-qm-user-pool-client-id")
        cdk.CfnOutput(self, "Region", value=self.region, export_name=f"{env_name}-qm-region")
