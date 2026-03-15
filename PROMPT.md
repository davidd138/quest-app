# QuestMaster - Interactive Adventure Platform

## WHAT TO BUILD

Build **QuestMaster**, a production-grade interactive adventure platform where admins create immersive quests with AI-powered characters, professional maps, and real-time voice conversations. Users explore locations, talk to AI characters via voice, solve challenges, and compete on leaderboards.

## ARCHITECTURE

Follow the **exact same serverless pattern** as `../sales-training-app/`:

```
Client (Next.js 15 / React Native Expo)
  → AppSync GraphQL API (Cognito auth)
    → Lambda resolvers (Python 3.11)
      → DynamoDB tables
  → OpenAI Realtime API (voice with AI characters)
  → Bedrock (challenge verification & analysis)
```

**Infrastructure**: AWS CDK (Python) with CDK Pipelines. Region: eu-west-1. Account: 890742600627.
**GitHub**: `davidd138/quest-app`, branch: `main`, CodeStar connection ARN: `arn:aws:codestar-connections:eu-west-1:890742600627:connection/e879a2a6-c2f1-4128-9bfb-996a0a5b3c7d`

## DIRECTORY STRUCTURE

```
quest-app/
├── PROMPT.md
├── CLAUDE.md
├── infrastructure/
│   ├── app.py
│   ├── cdk.json
│   ├── requirements.txt
│   ├── stacks/
│   │   ├── __init__.py
│   │   ├── pipeline_stack.py
│   │   ├── backend_stack.py
│   │   └── frontend_stack.py
│   └── stages/
│       ├── __init__.py
│       └── app_stage.py
├── backend/
│   ├── schema/
│   │   └── schema.graphql
│   ├── lambdas/
│   │   ├── resolvers/
│   │   │   ├── sync_user.py
│   │   │   ├── auth_helpers.py
│   │   │   ├── validation.py
│   │   │   ├── list_quests.py
│   │   │   ├── get_quest.py
│   │   │   ├── create_quest.py
│   │   │   ├── update_quest.py
│   │   │   ├── delete_quest.py
│   │   │   ├── start_quest.py
│   │   │   ├── update_progress.py
│   │   │   ├── complete_stage.py
│   │   │   ├── get_progress.py
│   │   │   ├── create_conversation.py
│   │   │   ├── update_conversation.py
│   │   │   ├── analyze_conversation.py
│   │   │   ├── get_conversation.py
│   │   │   ├── list_conversations.py
│   │   │   ├── get_realtime_token.py
│   │   │   ├── get_leaderboard.py
│   │   │   ├── get_analytics.py
│   │   │   ├── get_achievements.py
│   │   │   ├── list_all_users.py
│   │   │   └── update_user_status.py
│   │   └── triggers/
│   │       └── pre_signup.py
│   ├── scripts/
│   │   ├── seed_quests.py
│   │   └── setup_admin.py
│   └── tests/
│       ├── conftest.py
│       ├── test_validation.py
│       ├── test_auth_helpers.py
│       ├── test_quests.py
│       ├── test_progress.py
│       ├── test_conversations.py
│       ├── test_analyze.py
│       └── test_e2e.py
├── frontend/
│   ├── package.json
│   ├── next.config.ts
│   ├── tsconfig.json
│   ├── postcss.config.mjs
│   ├── vitest.config.ts
│   ├── public/
│   └── src/
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   ├── globals.css
│       │   ├── (auth)/
│       │   │   ├── layout.tsx
│       │   │   ├── login/page.tsx
│       │   │   └── register/page.tsx
│       │   └── (app)/
│       │       ├── layout.tsx
│       │       ├── dashboard/page.tsx
│       │       ├── quests/page.tsx
│       │       ├── quests/[id]/page.tsx
│       │       ├── quest-play/[id]/page.tsx
│       │       ├── quest-play/[id]/stage/[stageId]/page.tsx
│       │       ├── voice-chat/[conversationId]/page.tsx
│       │       ├── history/page.tsx
│       │       ├── achievements/page.tsx
│       │       ├── leaderboard/page.tsx
│       │       ├── analytics/page.tsx
│       │       ├── admin/
│       │       │   ├── quests/page.tsx
│       │       │   ├── quests/new/page.tsx
│       │       │   ├── quests/[id]/edit/page.tsx
│       │       │   ├── analytics/page.tsx
│       │       │   └── users/page.tsx
│       │       └── profile/page.tsx
│       ├── components/
│       │   ├── layout/
│       │   │   ├── AuthProvider.tsx
│       │   │   ├── AuthGuard.tsx
│       │   │   ├── AdminGuard.tsx
│       │   │   ├── Sidebar.tsx
│       │   │   ├── Topbar.tsx
│       │   │   └── ErrorBoundary.tsx
│       │   ├── ui/
│       │   │   ├── Button.tsx
│       │   │   ├── Card.tsx
│       │   │   ├── Modal.tsx
│       │   │   ├── Badge.tsx
│       │   │   ├── ProgressBar.tsx
│       │   │   ├── Skeleton.tsx
│       │   │   ├── Toast.tsx
│       │   │   └── Input.tsx
│       │   ├── maps/
│       │   │   ├── QuestMap.tsx
│       │   │   ├── StageMarker.tsx
│       │   │   └── RouteLayer.tsx
│       │   ├── quest/
│       │   │   ├── QuestCard.tsx
│       │   │   ├── StageCard.tsx
│       │   │   ├── QuestProgress.tsx
│       │   │   ├── DifficultyBadge.tsx
│       │   │   └── CharacterAvatar.tsx
│       │   ├── voice/
│       │   │   ├── VoiceInterface.tsx
│       │   │   ├── AudioVisualizer.tsx
│       │   │   ├── TranscriptPanel.tsx
│       │   │   └── CharacterPanel.tsx
│       │   └── admin/
│       │       ├── QuestEditor.tsx
│       │       ├── StageEditor.tsx
│       │       ├── MapPicker.tsx
│       │       └── CharacterBuilder.tsx
│       ├── hooks/
│       │   ├── useAuth.ts
│       │   ├── useGraphQL.ts
│       │   ├── useRealtimeVoice.ts
│       │   └── useMap.ts
│       ├── lib/
│       │   ├── amplify-config.ts
│       │   ├── graphql/
│       │   │   ├── queries.ts
│       │   │   └── mutations.ts
│       │   └── constants.ts
│       ├── types/
│       │   └── index.ts
│       └── __tests__/
│           ├── setup.ts
│           ├── components/
│           │   ├── QuestCard.test.tsx
│           │   ├── VoiceInterface.test.tsx
│           │   └── QuestMap.test.tsx
│           ├── hooks/
│           │   ├── useAuth.test.ts
│           │   └── useGraphQL.test.ts
│           └── pages/
│               ├── dashboard.test.tsx
│               └── quests.test.tsx
└── mobile/
    ├── App.tsx
    ├── app.json
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── config/aws.ts
        ├── hooks/
        │   ├── useAuth.ts
        │   ├── useGraphQL.ts
        │   └── useRealtimeVoice.ts
        ├── screens/
        │   ├── AuthScreen.tsx
        │   ├── DashboardScreen.tsx
        │   ├── QuestsScreen.tsx
        │   ├── QuestDetailScreen.tsx
        │   ├── QuestPlayScreen.tsx
        │   ├── VoiceChatScreen.tsx
        │   ├── HistoryScreen.tsx
        │   ├── AchievementsScreen.tsx
        │   ├── LeaderboardScreen.tsx
        │   └── ProfileScreen.tsx
        ├── components/
        │   ├── QuestCard.tsx
        │   ├── MapView.tsx
        │   ├── AudioVisualizer.tsx
        │   └── ProgressBar.tsx
        └── navigation/
            └── AppNavigator.tsx
```

## DynamoDB TABLES

1. **users** - PK: `userId` (STRING), GSI: `email-index` (email)
2. **quests** - PK: `id` (STRING) — contains embedded stages array with characters, locations, challenges
3. **progress** - PK: `id` (STRING), GSI: `userId-questId-index` (userId + questId) — tracks user stage-by-stage progress
4. **conversations** - PK: `id` (STRING), GSI: `userId-startedAt-index` (userId + startedAt)
5. **scores** - PK: `id` (STRING), GSI: `userId-completedAt-index` (userId + completedAt)
6. **achievements** - PK: `id` (STRING), GSI: `userId-earnedAt-index` (userId + earnedAt)

## GRAPHQL SCHEMA

```graphql
# User management
type User {
  userId: ID!
  email: String!
  name: String!
  role: String!
  status: UserStatus!
  avatarUrl: String
  totalPoints: Int!
  questsCompleted: Int!
  createdAt: String!
  updatedAt: String!
}

enum UserStatus { pending active suspended expired }

# Quests - the core entity
type Quest {
  id: ID!
  title: String!
  description: String!
  category: QuestCategory!
  difficulty: QuestDifficulty!
  estimatedDuration: Int!        # minutes
  coverImageUrl: String
  stages: [Stage!]!
  totalPoints: Int!
  location: Location!            # center point for the quest area
  radius: Float!                 # km radius
  tags: [String!]!
  isPublished: Boolean!
  createdBy: String!
  createdAt: String!
  updatedAt: String!
}

enum QuestCategory { adventure mystery cultural educational culinary nature urban team_building }
enum QuestDifficulty { easy medium hard legendary }

type Stage {
  id: ID!
  order: Int!
  title: String!
  description: String!
  location: Location!
  character: Character!
  challenge: Challenge!
  points: Int!
  hints: [String!]!
  unlockCondition: String        # null = sequential, or custom condition
}

type Location {
  latitude: Float!
  longitude: Float!
  name: String!
  address: String
  radius: Float               # meters, proximity trigger
}

type Character {
  name: String!
  role: String!                # "wise merchant", "mysterious guide", etc.
  personality: String!         # personality description for AI
  backstory: String!           # character backstory for context
  avatarUrl: String
  voiceStyle: String!          # "warm", "mysterious", "energetic", etc.
  greetingMessage: String!     # first thing they say
}

type Challenge {
  type: ChallengeType!
  description: String!         # what the user needs to accomplish
  successCriteria: String!     # for AI to evaluate
  failureHints: [String!]!     # hints if user is struggling
  maxAttempts: Int             # null = unlimited
}

enum ChallengeType { conversation riddle knowledge negotiation persuasion exploration trivia }

# Progress tracking
type Progress {
  id: ID!
  userId: String!
  questId: String!
  currentStageIndex: Int!
  completedStages: [CompletedStage!]!
  status: ProgressStatus!
  startedAt: String!
  completedAt: String
  totalPoints: Int!
  totalDuration: Int!          # seconds
}

enum ProgressStatus { in_progress completed abandoned }

type CompletedStage {
  stageId: String!
  conversationId: String
  points: Int!
  attempts: Int!
  completedAt: String!
  duration: Int!               # seconds
}

# Conversations with AI characters
type Conversation {
  id: ID!
  userId: String!
  questId: String!
  stageId: String!
  characterName: String!
  transcript: String!          # JSON array
  status: ConversationStatus!
  startedAt: String!
  endedAt: String
  duration: Int                # seconds
  challengeResult: ChallengeResult
}

enum ConversationStatus { in_progress completed analyzed }

type ChallengeResult {
  passed: Boolean!
  score: Int!                  # 0-100
  feedback: String!
  strengths: [String!]!
  improvements: [String!]!
}

# Scores & Leaderboard
type Score {
  id: ID!
  userId: String!
  questId: String!
  questTitle: String!
  totalPoints: Int!
  completionTime: Int!         # seconds
  stagesCompleted: Int!
  totalStages: Int!
  completedAt: String!
}

type LeaderboardEntry {
  rank: Int!
  userId: String!
  userName: String!
  avatarUrl: String
  totalPoints: Int!
  questsCompleted: Int!
  averageScore: Float!
}

# Achievements
type Achievement {
  id: ID!
  userId: String!
  type: String!
  title: String!
  description: String!
  iconUrl: String
  earnedAt: String!
  questId: String
}

# Analytics
type Analytics {
  totalQuests: Int!
  questsCompleted: Int!
  totalPoints: Int!
  averageScore: Float!
  totalPlayTime: Int!          # seconds
  favoriteCategory: String
  completionRate: Float!
  recentActivity: [ActivityEntry!]!
  categoryBreakdown: [CategoryStat!]!
}

type ActivityEntry {
  date: String!
  questTitle: String!
  action: String!
  points: Int!
}

type CategoryStat {
  category: String!
  completed: Int!
  total: Int!
  averageScore: Float!
}

type AdminAnalytics {
  totalUsers: Int!
  activeUsers: Int!
  totalQuests: Int!
  totalCompletions: Int!
  popularQuests: [QuestStat!]!
  userGrowth: [GrowthEntry!]!
}

type QuestStat {
  questId: String!
  questTitle: String!
  completions: Int!
  averageScore: Float!
  averageTime: Int!
}

type GrowthEntry {
  date: String!
  users: Int!
  completions: Int!
}

# Token for OpenAI Realtime
type RealtimeToken {
  token: String!
  expiresAt: Int!
}

# Queries
type Query {
  listQuests(category: String, difficulty: String, limit: Int, nextToken: String): QuestConnection! @aws_cognito_user_pools
  getQuest(id: ID!): Quest @aws_cognito_user_pools
  getProgress(questId: ID!): Progress @aws_cognito_user_pools
  listConversations(questId: String, limit: Int, nextToken: String): ConversationConnection! @aws_cognito_user_pools
  getConversation(id: ID!): Conversation @aws_cognito_user_pools
  getLeaderboard(limit: Int): [LeaderboardEntry!]! @aws_cognito_user_pools
  getAchievements: [Achievement!]! @aws_cognito_user_pools
  getAnalytics: Analytics @aws_cognito_user_pools
  getRealtimeToken(questId: ID!, stageId: ID!): RealtimeToken! @aws_cognito_user_pools
  # Admin
  listAllUsers(limit: Int, nextToken: String): UserConnection! @aws_cognito_user_pools
  getAdminAnalytics: AdminAnalytics @aws_cognito_user_pools
}

# Mutations
type Mutation {
  syncUser: User! @aws_cognito_user_pools
  startQuest(questId: ID!): Progress! @aws_cognito_user_pools
  updateProgress(input: UpdateProgressInput!): Progress! @aws_cognito_user_pools
  completeStage(input: CompleteStageInput!): Progress! @aws_cognito_user_pools
  createConversation(input: CreateConversationInput!): Conversation! @aws_cognito_user_pools
  updateConversation(input: UpdateConversationInput!): Conversation! @aws_cognito_user_pools
  analyzeConversation(conversationId: ID!): ChallengeResult! @aws_cognito_user_pools
  # Admin
  createQuest(input: CreateQuestInput!): Quest! @aws_cognito_user_pools
  updateQuest(input: UpdateQuestInput!): Quest! @aws_cognito_user_pools
  deleteQuest(id: ID!): Boolean! @aws_cognito_user_pools
  updateUserStatus(userId: ID!, status: UserStatus!): User! @aws_cognito_user_pools
}

# Inputs
input CreateQuestInput { ... }
input UpdateQuestInput { ... }
input UpdateProgressInput { ... }
input CompleteStageInput { conversationId: ID!, questId: ID!, stageId: ID! }
input CreateConversationInput { questId: ID!, stageId: ID! }
input UpdateConversationInput { id: ID!, transcript: String, status: String, duration: Int }

# Connections (pagination)
type QuestConnection { items: [Quest!]!, nextToken: String }
type ConversationConnection { items: [Conversation!]!, nextToken: String }
type UserConnection { items: [User!]!, nextToken: String }
```

## QUEST SEED DATA

Create at least 5 incredible, detailed quests:

### 1. "The Lost Recipe of Barcelona" (culinary, medium)
- 4 stages across Barcelona's Gothic Quarter
- Characters: Chef Montserrat (warm, passionate about Catalan cuisine), Market vendor Pedro (energetic, storyteller), Wine sommelier Elena (sophisticated, challenging), Ghost of Auguste Escoffier (mysterious, tests knowledge)
- Challenges: Identify ingredients by description, negotiate a price, pair wines correctly, recreate a recipe from memory

### 2. "Shadows of the Ancient Library" (mystery, hard)
- 5 stages in a fictional ancient library complex
- Characters: Librarian Minerva (stern, riddler), Ghost scholar Ibn Rushd (philosophical, wise), Apprentice Luca (nervous, gives clues accidentally), The Keeper (enigmatic, final boss)
- Challenges: Solve riddles, decode a cipher through conversation, persuade the ghost to reveal secrets, pass a philosophical debate

### 3. "Urban Explorer: City Secrets" (adventure, easy)
- 3 stages around landmark locations
- Characters: Street artist Zara (energetic, creative), Historian Professor Walsh (academic, enthusiastic), Underground guide Koji (cool, mysterious)
- Challenges: Describe a mural's hidden meaning, answer historical trivia, navigate by verbal directions

### 4. "The Negotiation Games" (team_building, hard)
- 4 stages of increasingly difficult negotiations
- Characters: Corporate shark Victoria (aggressive, time-pressured), Startup founder Raj (passionate but scattered), Union leader Olga (tough but fair), Diplomat Ambassador Chen (subtle, multilayered)
- Challenges: Close a deal, resolve a conflict, build consensus, broker a peace treaty

### 5. "Nature's Whisper Trail" (nature, medium)
- 4 stages through natural landmarks
- Characters: Park ranger Sam (friendly, knowledgeable), Botanist Dr. Flora (enthusiastic, detail-oriented), Wildlife photographer Kenji (patient, observant), Elder storyteller Abuela Rosa (warm, mythological)
- Challenges: Identify plants from descriptions, track wildlife sounds, capture the perfect moment in words, retell an ancient legend

## FRONTEND DESIGN REQUIREMENTS

### Visual Design (CRITICAL - Must be incredible)
- **Color palette**: Deep navy (#0f172a) + electric violet (#7c3aed) + emerald (#10b981) + amber (#f59e0b) + rose (#f43f5e)
- **Typography**: Inter for body, Space Grotesk for headings
- **Theme**: Dark mode primary with light mode toggle. Atmospheric, immersive, game-like feel
- **Animations**: Smooth transitions, parallax effects on quest cards, particle effects on achievements
- **Glass morphism**: Frosted glass panels for overlays and cards
- **Gradients**: Vibrant mesh gradients as backgrounds

### Map Integration (Mapbox GL JS)
- **IMPORTANT**: Use `mapbox-gl` npm package (v3.x) with `react-map-gl` wrapper
- Interactive 3D map with custom markers for quest stages
- Animated route lines between stages
- Cluster markers for quest overview
- Custom map style (dark theme)
- Fly-to animations when selecting stages
- Proximity circles around stage locations
- Terrain/3D buildings for immersion
- **Mapbox token**: Use environment variable `NEXT_PUBLIC_MAPBOX_TOKEN`

### Voice Chat Interface
- Full-screen immersive voice chat with character portrait
- Real-time audio visualizer (waveform/frequency bars)
- Live transcript with speaker labels
- Character emotion indicators
- Challenge progress indicator
- Timer display
- Hint button (limited uses)

### Dashboard
- Quest progress overview with visual cards
- Activity feed (recent actions)
- Achievement showcase (3D medal display)
- Stats summary (points, time played, quests completed)
- Recommended quests based on preferences
- World map showing completed quest locations

### Admin Panel
- Quest builder with drag-and-drop stage ordering
- Map picker for setting locations (click on map to set coordinates)
- Character personality builder with preview
- Challenge creator with success criteria wizard
- Analytics dashboard with charts (use recharts)
- User management table with status controls

### Package Dependencies (frontend)
```json
{
  "dependencies": {
    "next": "^15.3.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "aws-amplify": "^6.14.0",
    "mapbox-gl": "^3.9.0",
    "react-map-gl": "^7.1.0",
    "recharts": "^2.15.0",
    "framer-motion": "^12.6.0",
    "lucide-react": "^0.475.0",
    "@dnd-kit/core": "^6.3.0",
    "@dnd-kit/sortable": "^10.0.0"
  },
  "devDependencies": {
    "typescript": "^5.8.0",
    "@types/react": "^19.1.0",
    "@types/node": "^22.15.0",
    "tailwindcss": "^4.1.0",
    "@tailwindcss/postcss": "^4.1.0",
    "postcss": "^8.5.0",
    "vitest": "^4.1.0",
    "@vitejs/plugin-react": "^6.0.1",
    "@testing-library/react": "^16.3.0",
    "@testing-library/jest-dom": "^6.6.0",
    "jsdom": "^26.1.0"
  }
}
```

## VOICE INTEGRATION (OpenAI Realtime API)

Follow the exact same pattern as `../sales-training-app/frontend/src/hooks/useRealtimeTraining.ts`:

1. **Token acquisition**: GraphQL query `getRealtimeToken(questId, stageId)` → Lambda fetches from Secrets Manager → POST to `https://api.openai.com/v1/realtime/sessions` → returns `client_secret.value`
2. **WebSocket**: Connect to `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17`
3. **System prompt**: Build from character personality, backstory, challenge details, and voice style
4. **Audio**: MediaDevices + ScriptProcessorNode for audio capture
5. **Transcript**: Parse server events for real-time transcript
6. **States**: idle → connecting → connected → listening → speaking → error

**System prompt template for characters:**
```
You are {character.name}, {character.role}.
{character.backstory}

PERSONALITY: {character.personality}
VOICE STYLE: Speak in a {character.voiceStyle} manner.

You are part of a quest called "{quest.title}". The user is at stage "{stage.title}": {stage.description}

CHALLENGE: {challenge.description}

SUCCESS CRITERIA: {challenge.successCriteria}

RULES:
- Stay in character at ALL times
- Guide the conversation naturally toward the challenge
- If the user struggles, subtly provide hints from: {challenge.failureHints}
- NEVER reveal you are an AI
- Respond in the user's language
- Keep responses under 3 sentences for natural flow
- React emotionally to user's responses based on your personality
- Greet the user with: "{character.greetingMessage}"
```

## CHALLENGE ANALYSIS (Bedrock)

Follow the pattern from `../sales-training-app/backend/lambdas/resolvers/analyze_conversation.py`:

1. Fetch conversation transcript, stage challenge details
2. Call Bedrock (Claude → Nova fallback)
3. Prompt asks to evaluate if the user met the `successCriteria`
4. Return JSON: `{ passed, score, feedback, strengths, improvements }`

**Bedrock prompt template:**
```
You are evaluating whether a user successfully completed a challenge in an interactive quest.

CHALLENGE: {challenge.description}
SUCCESS CRITERIA: {challenge.successCriteria}
CHALLENGE TYPE: {challenge.type}

TRANSCRIPT:
{transcript}

Evaluate the user's performance and return a JSON object:
{
  "passed": true/false,
  "score": 0-100,
  "feedback": "2-3 sentence overall feedback",
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"]
}

Be fair but rigorous. The user should genuinely meet the success criteria to pass.
```

## CDK INFRASTRUCTURE

### Pipeline Stack
- Exact same pattern as `../sales-training-app/infrastructure/stacks/pipeline_stack.py`
- Source: `davidd138/quest-app`, branch `main`
- Synth: pip install + cdk synth
- Post-deploy: Build Next.js + sync S3 + CloudFront invalidation
- Bucket name: `dev-qm-frontend-890742600627`

### Backend Stack
- 6 DynamoDB tables (see above)
- Cognito User Pool (same config as sales-training-app)
- AppSync API with Cognito auth
- WAF with rate limiting (1000 req/5min/IP) + AWS Common Rule Set
- Secrets Manager: `dev/openai-api-key` (reuse existing)
- Lambda resolvers with least-privilege IAM
- Default: 256MB, 30s timeout
- analyze_conversation: 512MB, 60s timeout
- get_realtime_token: 256MB, 10s timeout

### Frontend Stack
- S3 + CloudFront (same pattern)
- Security headers (HSTS, CSP with Mapbox domains added)
- CloudFront function for SPA routing
- connect-src must include: `https://api.mapbox.com wss://api.openai.com https://*.tiles.mapbox.com`

## BACKEND PATTERNS

### Lambda Resolver Pattern
Follow `../sales-training-app/backend/lambdas/resolvers/` exactly:
- `auth_helpers.py`: check_user_access(), check_admin_access() with Cognito group check
- `validation.py`: validate_uuid(), validate_string(), validate_enum(), validate_positive_int()
- Every handler: Extract identity, check access, validate inputs, execute, return

### Pre-signup Trigger
Same as sales-training-app: auto-confirm users (no email verification for dev speed)

## TESTING REQUIREMENTS

### Backend Tests (pytest)
- `test_validation.py`: All validation functions
- `test_auth_helpers.py`: Access control logic
- `test_quests.py`: Quest CRUD operations
- `test_progress.py`: Progress tracking
- `test_conversations.py`: Conversation lifecycle
- `test_analyze.py`: Bedrock prompt building, response parsing
- `test_e2e.py`: Full flow (marked with @pytest.mark.e2e)
- `conftest.py`: DynamoDB mocks, common fixtures

### Frontend Tests (Vitest + Testing Library)
- Component tests: QuestCard, VoiceInterface, QuestMap
- Hook tests: useAuth, useGraphQL
- Page tests: Dashboard, Quests
- Setup file with mocks for Amplify, Mapbox, MediaDevices

## MOBILE APP (Expo React Native)

Follow the exact same pattern as `../sales-training-app/mobile/`:
- Bottom tab navigation (Quests, Map, History, Achievements, Profile)
- Same auth hooks and GraphQL hooks
- React Native Maps for quest locations
- Audio handling for voice chat
- Same dependencies pattern as sales-training-app mobile

### Mobile Dependencies
```json
{
  "expo": "~55.0.6",
  "react-native": "0.83.2",
  "react": "19.2.0",
  "aws-amplify": "^6.16.3",
  "@aws-amplify/react-native": "^1.3.3",
  "react-native-maps": "^2.0.0",
  "@react-navigation/bottom-tabs": "^7.15.5",
  "@react-navigation/native": "^7.2.1",
  "@react-navigation/native-stack": "^7.5.3"
}
```

## ITERATION CHECKLIST

Work through these in order. Each iteration should focus on ONE section:

1. **[INFRA]** Create CDK infrastructure (app.py, all stacks, stages, cdk.json, requirements.txt)
2. **[SCHEMA]** Create the full GraphQL schema (backend/schema/schema.graphql)
3. **[AUTH]** Create auth helpers, validation, pre-signup trigger
4. **[RESOLVERS-CORE]** Create sync_user, list_quests, get_quest resolvers
5. **[RESOLVERS-PROGRESS]** Create start_quest, update_progress, complete_stage, get_progress
6. **[RESOLVERS-VOICE]** Create conversation resolvers + get_realtime_token + analyze_conversation
7. **[RESOLVERS-ADMIN]** Create admin resolvers (create/update/delete quest, list_all_users, update_user_status)
8. **[RESOLVERS-ANALYTICS]** Create get_leaderboard, get_analytics, get_achievements, get_admin_analytics
9. **[SEED]** Create seed_quests.py with 5 detailed quests and setup_admin.py
10. **[BACKEND-TESTS]** Create all backend tests
11. **[FRONTEND-SETUP]** Initialize Next.js project, config files, Amplify config, types, hooks
12. **[FRONTEND-AUTH]** Create auth pages (login, register), AuthProvider, AuthGuard, AdminGuard
13. **[FRONTEND-LAYOUT]** Create layout components (Sidebar, Topbar, app layout, error boundary)
14. **[FRONTEND-UI]** Create all UI components (Button, Card, Modal, Badge, ProgressBar, etc.)
15. **[FRONTEND-MAP]** Create map components (QuestMap, StageMarker, RouteLayer)
16. **[FRONTEND-QUEST]** Create quest components and pages (list, detail, play)
17. **[FRONTEND-VOICE]** Create voice chat interface with AudioVisualizer and TranscriptPanel
18. **[FRONTEND-DASHBOARD]** Create dashboard with stats, activity feed, achievement showcase
19. **[FRONTEND-ADMIN]** Create admin pages (quest editor with DnD, map picker, user management)
20. **[FRONTEND-EXTRAS]** Create history, achievements, leaderboard, analytics, profile pages
21. **[FRONTEND-TESTS]** Create all frontend tests
22. **[MOBILE]** Create React Native mobile app
23. **[CLAUDE-MD]** Create CLAUDE.md with all commands and architecture docs
24. **[POLISH]** Final review, fix any issues, ensure consistency

## QUALITY STANDARDS

- **TypeScript strict mode** for frontend
- **No `any` types** — everything properly typed
- **Responsive design** — works on all screen sizes
- **Accessibility** — ARIA labels, keyboard navigation, screen reader support
- **Error handling** — graceful error states with retry options
- **Loading states** — skeleton loaders, not spinners
- **Empty states** — beautiful empty states with CTAs
- **Animations** — framer-motion for page transitions and micro-interactions
- **Security** — input validation on both client and server, CSP headers, WAF rules
- **Performance** — lazy loading, code splitting, optimized images

## COMPLETION SIGNAL

When ALL items in the checklist above are complete and the app is fully functional, output:
<promise>QUEST APP COMPLETE</promise>
