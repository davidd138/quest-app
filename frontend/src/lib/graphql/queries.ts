export const LIST_QUESTS = /* GraphQL */ `
  query ListQuests($category: String, $difficulty: String, $limit: Int, $nextToken: String) {
    listQuests(category: $category, difficulty: $difficulty, limit: $limit, nextToken: $nextToken) {
      items {
        id
        title
        description
        category
        difficulty
        estimatedDuration
        coverImageUrl
        stages {
          id
          order
          title
          description
          location {
            latitude
            longitude
            name
            address
            radius
          }
          character {
            name
            role
            personality
            backstory
            avatarUrl
            voiceStyle
            greetingMessage
          }
          challenge {
            type
            description
            successCriteria
            failureHints
            maxAttempts
          }
          points
          hints
          unlockCondition
        }
        totalPoints
        location {
          latitude
          longitude
          name
          address
          radius
        }
        radius
        tags
        isPublished
        createdBy
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

export const GET_QUEST = /* GraphQL */ `
  query GetQuest($id: ID!) {
    getQuest(id: $id) {
      id
      title
      description
      category
      difficulty
      estimatedDuration
      coverImageUrl
      stages {
        id
        order
        title
        description
        location {
          latitude
          longitude
          name
          address
          radius
        }
        character {
          name
          role
          personality
          backstory
          avatarUrl
          voiceStyle
          greetingMessage
        }
        challenge {
          type
          description
          successCriteria
          failureHints
          maxAttempts
        }
        points
        hints
        unlockCondition
      }
      totalPoints
      location {
        latitude
        longitude
        name
        address
        radius
      }
      radius
      tags
      isPublished
      createdBy
      createdAt
      updatedAt
    }
  }
`;

export const GET_PROGRESS = /* GraphQL */ `
  query GetProgress($questId: ID!) {
    getProgress(questId: $questId) {
      id
      userId
      questId
      currentStageIndex
      completedStages {
        stageId
        conversationId
        points
        attempts
        completedAt
        duration
      }
      status
      startedAt
      completedAt
      totalPoints
      totalDuration
    }
  }
`;

export const LIST_CONVERSATIONS = /* GraphQL */ `
  query ListConversations($questId: String, $limit: Int, $nextToken: String) {
    listConversations(questId: $questId, limit: $limit, nextToken: $nextToken) {
      items {
        id
        userId
        questId
        stageId
        characterName
        transcript
        status
        startedAt
        endedAt
        duration
        challengeResult {
          passed
          score
          feedback
          strengths
          improvements
        }
      }
      nextToken
    }
  }
`;

export const GET_CONVERSATION = /* GraphQL */ `
  query GetConversation($id: ID!) {
    getConversation(id: $id) {
      id
      userId
      questId
      stageId
      characterName
      transcript
      status
      startedAt
      endedAt
      duration
      challengeResult {
        passed
        score
        feedback
        strengths
        improvements
      }
    }
  }
`;

export const GET_LEADERBOARD = /* GraphQL */ `
  query GetLeaderboard($limit: Int) {
    getLeaderboard(limit: $limit) {
      rank
      userId
      userName
      avatarUrl
      totalPoints
      questsCompleted
      averageScore
    }
  }
`;

export const GET_ACHIEVEMENTS = /* GraphQL */ `
  query GetAchievements {
    getAchievements {
      id
      userId
      type
      title
      description
      iconUrl
      earnedAt
      questId
    }
  }
`;

export const GET_ANALYTICS = /* GraphQL */ `
  query GetAnalytics {
    getAnalytics {
      totalQuests
      questsCompleted
      totalPoints
      averageScore
      totalPlayTime
      favoriteCategory
      completionRate
      recentActivity {
        date
        questTitle
        action
        points
      }
      categoryBreakdown {
        category
        completed
        total
        averageScore
      }
    }
  }
`;

export const GET_REALTIME_TOKEN = /* GraphQL */ `
  query GetRealtimeToken($questId: ID!, $stageId: ID!) {
    getRealtimeToken(questId: $questId, stageId: $stageId) {
      token
      expiresAt
    }
  }
`;

export const LIST_ALL_USERS = /* GraphQL */ `
  query ListAllUsers($limit: Int, $nextToken: String) {
    listAllUsers(limit: $limit, nextToken: $nextToken) {
      items {
        userId
        email
        name
        role
        status
        avatarUrl
        totalPoints
        questsCompleted
        groups
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

export const GET_ADMIN_ANALYTICS = /* GraphQL */ `
  query GetAdminAnalytics {
    getAdminAnalytics {
      totalUsers
      activeUsers
      totalQuests
      totalCompletions
      popularQuests {
        questId
        questTitle
        completions
        averageScore
        averageTime
      }
      userGrowth {
        date
        users
        completions
      }
    }
  }
`;
