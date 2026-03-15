export const SYNC_USER = /* GraphQL */ `
  mutation SyncUser {
    syncUser {
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
  }
`;

export const START_QUEST = /* GraphQL */ `
  mutation StartQuest($questId: ID!) {
    startQuest(questId: $questId) {
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

export const UPDATE_PROGRESS = /* GraphQL */ `
  mutation UpdateProgress($input: UpdateProgressInput!) {
    updateProgress(input: $input) {
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

export const COMPLETE_STAGE = /* GraphQL */ `
  mutation CompleteStage($input: CompleteStageInput!) {
    completeStage(input: $input) {
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

export const CREATE_CONVERSATION = /* GraphQL */ `
  mutation CreateConversation($input: CreateConversationInput!) {
    createConversation(input: $input) {
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

export const UPDATE_CONVERSATION = /* GraphQL */ `
  mutation UpdateConversation($input: UpdateConversationInput!) {
    updateConversation(input: $input) {
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

export const ANALYZE_CONVERSATION = /* GraphQL */ `
  mutation AnalyzeConversation($conversationId: ID!) {
    analyzeConversation(conversationId: $conversationId) {
      passed
      score
      feedback
      strengths
      improvements
    }
  }
`;

export const CREATE_QUEST = /* GraphQL */ `
  mutation CreateQuest($input: CreateQuestInput!) {
    createQuest(input: $input) {
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

export const UPDATE_QUEST = /* GraphQL */ `
  mutation UpdateQuest($input: UpdateQuestInput!) {
    updateQuest(input: $input) {
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

export const DELETE_QUEST = /* GraphQL */ `
  mutation DeleteQuest($id: ID!) {
    deleteQuest(id: $id)
  }
`;

export const RATE_QUEST = /* GraphQL */ `
  mutation RateQuest($questId: ID!, $rating: Int!, $review: String) {
    rateQuest(questId: $questId, rating: $rating, review: $review) {
      id
      questId
      userId
      rating
      review
      createdAt
    }
  }
`;

export const CREATE_COMMUNITY_QUEST = /* GraphQL */ `
  mutation CreateCommunityQuest($input: CreateCommunityQuestInput!) {
    createCommunityQuest(input: $input) {
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

export const UPDATE_USER_STATUS = /* GraphQL */ `
  mutation UpdateUserStatus($userId: ID!, $status: UserStatus!) {
    updateUserStatus(userId: $userId, status: $status) {
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
  }
`;
