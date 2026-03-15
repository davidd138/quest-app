import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Amplify
vi.mock('aws-amplify', () => ({
  Amplify: { configure: vi.fn() },
}));

vi.mock('aws-amplify/auth', () => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  confirmSignUp: vi.fn(),
  getCurrentUser: vi.fn(),
  fetchAuthSession: vi.fn(),
}));

vi.mock('aws-amplify/api', () => ({
  generateClient: vi.fn(() => ({ graphql: vi.fn() })),
}));

// Mock mapbox-gl
vi.mock('mapbox-gl', () => ({
  default: {
    Map: vi.fn(),
    Marker: vi.fn(),
    accessToken: '',
  },
}));

// Mock MediaDevices
Object.defineProperty(navigator, 'mediaDevices', {
  value: { getUserMedia: vi.fn() },
});
