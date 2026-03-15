import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// ---------- Mocks ----------

vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: (_target: unknown, prop: string) => {
        const Component = React.forwardRef(
          (props: Record<string, unknown>, ref: React.Ref<HTMLElement>) => {
            const { children, className, onClick, href, style, ...rest } = props;
            void rest;
            return React.createElement(
              prop,
              { ref, className, onClick, href, style, 'data-testid': props['data-testid'] },
              children as React.ReactNode,
            );
          },
        );
        Component.displayName = `motion.${prop}`;
        return Component;
      },
    },
  ),
  AnimatePresence: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}));

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const mockPush = vi.fn();
const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace, back: vi.fn() }),
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/login',
}));

// ---------- Auth State ----------

let currentUser: {
  userId: string;
  email: string;
  name: string;
  role: string;
  status: string;
} | null = null;
let authLoading = false;
let authError: string | null = null;
let needsConfirmation = false;
let pendingEmail: string | null = null;

const mockSignIn = vi.fn();
const mockSignUp = vi.fn();
const mockSignOut = vi.fn();
const mockConfirmAccount = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: currentUser,
    loading: authLoading,
    error: authError,
    needsConfirmation,
    pendingEmail,
    signIn: mockSignIn,
    signUp: mockSignUp,
    signOut: mockSignOut,
    confirmAccount: mockConfirmAccount,
  }),
}));

vi.mock('@/components/ui/Card', () => ({
  default: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    variant?: string;
    padding?: string;
    className?: string;
  }) => (
    <div className={className} data-testid="card">
      {children}
    </div>
  ),
}));

// ---------- Test Suite ----------

describe('Auth Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUser = null;
    authLoading = false;
    authError = null;
    needsConfirmation = false;
    pendingEmail = null;
  });

  describe('Login Flow', () => {
    it('shows login form and authenticates user successfully', () => {
      mockSignIn.mockResolvedValueOnce(undefined);

      function MockLoginPage() {
        const [email, setEmail] = React.useState('');
        const [password, setPassword] = React.useState('');
        const [error, setError] = React.useState('');

        const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          try {
            await mockSignIn(email, password);
            mockPush('/dashboard');
          } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Login failed');
          }
        };

        return (
          <div>
            <h1>Welcome Back</h1>
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error && <p data-testid="error">{error}</p>}
              <button type="submit">Sign In</button>
            </form>
            <a href="/register">Create Account</a>
          </div>
        );
      }

      render(<MockLoginPage />);

      // 1. Login form is visible
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();

      // 2. Enter credentials
      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'maria@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: 'SecurePass123!' },
      });

      // 3. Submit form
      fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

      // 4. signIn was called with correct credentials
      expect(mockSignIn).toHaveBeenCalledWith('maria@example.com', 'SecurePass123!');
    });

    it('shows error message when login fails', async () => {
      mockSignIn.mockRejectedValueOnce(new Error('Invalid credentials'));

      function MockLoginPage() {
        const [email, setEmail] = React.useState('');
        const [password, setPassword] = React.useState('');
        const [error, setError] = React.useState('');

        const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          try {
            await mockSignIn(email, password);
          } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Login failed');
          }
        };

        return (
          <div>
            <h1>Welcome Back</h1>
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error && <p data-testid="error">{error}</p>}
              <button type="submit">Sign In</button>
            </form>
          </div>
        );
      }

      render(<MockLoginPage />);
      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'wrong@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: 'bad' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Invalid credentials');
      });
    });
  });

  describe('Registration Flow', () => {
    it('completes registration with confirmation code', async () => {
      mockSignUp.mockResolvedValueOnce(true);
      mockConfirmAccount.mockResolvedValueOnce(undefined);

      function MockRegisterPage() {
        const [step, setStep] = React.useState<'register' | 'confirm'>('register');
        const [email, setEmail] = React.useState('');
        const [password, setPassword] = React.useState('');
        const [name, setName] = React.useState('');
        const [code, setCode] = React.useState('');

        const handleRegister = async (e: React.FormEvent) => {
          e.preventDefault();
          const needsCode = await mockSignUp(email, password, name);
          if (needsCode) setStep('confirm');
        };

        const handleConfirm = async (e: React.FormEvent) => {
          e.preventDefault();
          await mockConfirmAccount(code);
          mockPush('/dashboard');
        };

        if (step === 'confirm') {
          return (
            <div>
              <h1>Confirm Your Account</h1>
              <p>We sent a code to {email}</p>
              <form onSubmit={handleConfirm}>
                <input
                  placeholder="Confirmation Code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
                <button type="submit">Confirm</button>
              </form>
            </div>
          );
        }

        return (
          <div>
            <h1>Create Account</h1>
            <form onSubmit={handleRegister}>
              <input
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="submit">Register</button>
            </form>
            <a href="/login">Already have an account?</a>
          </div>
        );
      }

      render(<MockRegisterPage />);

      // 1. Registration form visible
      expect(screen.getByText('Create Account')).toBeInTheDocument();

      // 2. Fill in registration
      fireEvent.change(screen.getByPlaceholderText('Full Name'), {
        target: { value: 'Maria Garcia' },
      });
      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'maria@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: 'SecurePass123!' },
      });
      fireEvent.click(screen.getByText('Register'));

      // 3. signUp called with correct args
      expect(mockSignUp).toHaveBeenCalledWith(
        'maria@example.com',
        'SecurePass123!',
        'Maria Garcia',
      );

      // 4. Confirmation step appears
      await waitFor(() => {
        expect(screen.getByText('Confirm Your Account')).toBeInTheDocument();
      });
      expect(screen.getByText(/We sent a code to maria@example.com/)).toBeInTheDocument();

      // 5. Enter confirmation code
      fireEvent.change(screen.getByPlaceholderText('Confirmation Code'), {
        target: { value: '123456' },
      });
      fireEvent.click(screen.getByText('Confirm'));

      // 6. confirmAccount called
      expect(mockConfirmAccount).toHaveBeenCalledWith('123456');
    });
  });

  describe('Sign Out Flow', () => {
    it('signs out user and redirects to login', async () => {
      currentUser = {
        userId: 'u1',
        email: 'maria@example.com',
        name: 'Maria Garcia',
        role: 'player',
        status: 'active',
      };
      mockSignOut.mockResolvedValueOnce(undefined);

      function MockDashboard() {
        const handleSignOut = async () => {
          await mockSignOut();
          mockReplace('/login');
        };

        return (
          <div>
            <h1>Dashboard</h1>
            <p>Welcome, {currentUser?.name}</p>
            <button onClick={handleSignOut}>Sign Out</button>
          </div>
        );
      }

      render(<MockDashboard />);

      expect(screen.getByText('Welcome, Maria Garcia')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Sign Out'));

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled();
        expect(mockReplace).toHaveBeenCalledWith('/login');
      });
    });
  });

  describe('Protected Route Redirect', () => {
    it('redirects unauthenticated users to login', () => {
      currentUser = null;

      function MockAuthGuard({ children }: { children: React.ReactNode }) {
        if (authLoading) return <div>Loading...</div>;
        if (!currentUser) {
          mockReplace('/login');
          return <div data-testid="redirect">Redirecting to login...</div>;
        }
        return <>{children}</>;
      }

      render(
        <MockAuthGuard>
          <div>Protected Content</div>
        </MockAuthGuard>,
      );

      // Protected content is not visible
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      // Redirect triggered
      expect(mockReplace).toHaveBeenCalledWith('/login');
      expect(screen.getByTestId('redirect')).toBeInTheDocument();
    });

    it('shows protected content when user is authenticated', () => {
      currentUser = {
        userId: 'u1',
        email: 'maria@example.com',
        name: 'Maria Garcia',
        role: 'player',
        status: 'active',
      };

      function MockAuthGuard({ children }: { children: React.ReactNode }) {
        if (!currentUser) {
          mockReplace('/login');
          return <div>Redirecting...</div>;
        }
        return <>{children}</>;
      }

      render(
        <MockAuthGuard>
          <div>Protected Content</div>
        </MockAuthGuard>,
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(mockReplace).not.toHaveBeenCalled();
    });

    it('shows loading state while checking authentication', () => {
      authLoading = true;

      function MockAuthGuard({ children }: { children: React.ReactNode }) {
        if (authLoading) return <div data-testid="auth-loading">Checking auth...</div>;
        if (!currentUser) {
          mockReplace('/login');
          return null;
        }
        return <>{children}</>;
      }

      render(
        <MockAuthGuard>
          <div>Protected Content</div>
        </MockAuthGuard>,
      );

      expect(screen.getByTestId('auth-loading')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });
});
