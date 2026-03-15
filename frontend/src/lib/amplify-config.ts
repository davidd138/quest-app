import { Amplify } from 'aws-amplify';

export function configureAmplify() {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID || '',
        userPoolClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID || '',
      },
    },
    API: {
      GraphQL: {
        endpoint: process.env.NEXT_PUBLIC_GRAPHQL_URL || '',
        defaultAuthMode: 'userPool' as const,
      },
    },
  });
}
