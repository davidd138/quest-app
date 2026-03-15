import { useCallback, useState } from 'react';
import { generateClient } from 'aws-amplify/api';

let _client: ReturnType<typeof generateClient> | null = null;
function getClient() {
  if (!_client) _client = generateClient();
  return _client;
}

// ---- Queries ----
export const LIST_QUESTS = /* GraphQL */ `
  query ListQuests {
    listQuests {
      id
      title
      description
      category
      difficulty
      estimatedDuration
      totalStages
      imageUrl
      location
    }
  }
`;

export const GET_QUEST = /* GraphQL */ `
  query GetQuest($id: String!) {
    getQuest(id: $id) {
      id
      title
      description
      category
      difficulty
      estimatedDuration
      totalStages
      imageUrl
      location
      stages {
        id
        order
        title
        description
        characterName
        characterRole
        latitude
        longitude
        locationName
      }
    }
  }
`;

export const LIST_USER_QUESTS = /* GraphQL */ `
  query ListUserQuests($limit: Int, $nextToken: String) {
    listUserQuests(limit: $limit, nextToken: $nextToken) {
      items {
        id
        questId
        questTitle
        currentStage
        totalStages
        status
        score
        startedAt
        completedAt
      }
      nextToken
    }
  }
`;

export const GET_USER_QUEST = /* GraphQL */ `
  query GetUserQuest($id: String!) {
    getUserQuest(id: $id) {
      id
      questId
      questTitle
      currentStage
      totalStages
      status
      score
      startedAt
      completedAt
      stageResults {
        stageId
        score
        duration
        completedAt
      }
    }
  }
`;

export const GET_ANALYTICS = /* GraphQL */ `
  query GetAnalytics {
    getAnalytics {
      totalPoints
      questsCompleted
      totalPlayTime
      averageScore
      achievements {
        id
        title
        description
        icon
        earnedAt
      }
    }
  }
`;

export const GET_LEADERBOARD = /* GraphQL */ `
  query GetLeaderboard {
    getLeaderboard {
      entries {
        userId
        email
        name
        totalPoints
        questsCompleted
      }
    }
  }
`;

export const GET_ACHIEVEMENTS = /* GraphQL */ `
  query GetAchievements {
    getAchievements {
      id
      title
      description
      icon
      earned
      earnedAt
    }
  }
`;

export const GET_REALTIME_TOKEN = /* GraphQL */ `
  query GetRealtimeToken {
    getRealtimeToken {
      token
      expiresAt
    }
  }
`;

// ---- Mutations ----
export const START_QUEST = /* GraphQL */ `
  mutation StartQuest($input: StartQuestInput!) {
    startQuest(input: $input) {
      id
      questId
      questTitle
      currentStage
      totalStages
      status
      startedAt
    }
  }
`;

export const COMPLETE_STAGE = /* GraphQL */ `
  mutation CompleteStage($input: CompleteStageInput!) {
    completeStage(input: $input) {
      id
      currentStage
      totalStages
      status
      score
    }
  }
`;

export const UPDATE_USER_QUEST = /* GraphQL */ `
  mutation UpdateUserQuest($input: UpdateUserQuestInput!) {
    updateUserQuest(input: $input) {
      id
      status
      score
      completedAt
    }
  }
`;

// ---- Hooks ----
export function useQuery<T = any>(query: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (variables?: Record<string, any>) => {
      setLoading(true);
      setError(null);
      try {
        const result = await getClient().graphql({ query, variables });
        const d = (result as any).data;
        const key = Object.keys(d)[0];
        setData(d[key]);
        return d[key] as T;
      } catch (e: any) {
        setError(e.message || 'Error');
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [query]
  );

  return { data, loading, error, execute };
}

export function useMutation<T = any>(mutation: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (variables?: Record<string, any>) => {
      setLoading(true);
      setError(null);
      try {
        const result = await getClient().graphql({ query: mutation, variables });
        const d = (result as any).data;
        const key = Object.keys(d)[0];
        return d[key] as T;
      } catch (e: any) {
        setError(e.message || 'Error');
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [mutation]
  );

  return { loading, error, execute };
}
