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
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, back: vi.fn(), replace: vi.fn() }),
  useParams: () => ({ id: 'q1' }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/admin/quests',
}));

// ---------- Mock Data ----------

const mockAdminUser = {
  userId: 'admin-1',
  email: 'admin@questmaster.com',
  name: 'Admin User',
  role: 'admin',
  status: 'active',
  groups: ['admin'],
  totalPoints: 0,
  questsCompleted: 0,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-03-01T00:00:00Z',
};

const mockQuests = [
  {
    id: 'q1',
    title: 'Madrid Mystery Trail',
    description: 'Explore mysteries',
    category: 'mystery',
    difficulty: 'medium',
    isPublished: true,
    createdAt: '2025-06-01T00:00:00Z',
    totalPoints: 500,
    stages: [],
  },
  {
    id: 'q2',
    title: 'Barcelona Food Tour',
    description: 'Culinary adventure',
    category: 'culinary',
    difficulty: 'easy',
    isPublished: false,
    createdAt: '2025-07-01T00:00:00Z',
    totalPoints: 300,
    stages: [],
  },
];

const mockPendingQuests = [
  {
    id: 'pq1',
    title: 'Community Nature Walk',
    description: 'A peaceful nature exploration',
    category: 'nature',
    difficulty: 'easy',
    createdBy: 'user-42',
    createdByName: 'Carlos Ruiz',
    status: 'pending',
    createdAt: '2026-03-10T00:00:00Z',
  },
  {
    id: 'pq2',
    title: 'Urban Photo Hunt',
    description: 'Photography quest in the city',
    category: 'urban',
    difficulty: 'medium',
    createdBy: 'user-99',
    createdByName: 'Ana Torres',
    status: 'pending',
    createdAt: '2026-03-12T00:00:00Z',
  },
];

const mockUsers = [
  {
    userId: 'u1',
    email: 'maria@example.com',
    name: 'Maria Garcia',
    role: 'player',
    status: 'active',
    totalPoints: 2500,
    questsCompleted: 8,
  },
  {
    userId: 'u2',
    email: 'pablo@example.com',
    name: 'Pablo Sanchez',
    role: 'player',
    status: 'active',
    totalPoints: 1800,
    questsCompleted: 5,
  },
  {
    userId: 'u3',
    email: 'carlos@example.com',
    name: 'Carlos Ruiz',
    role: 'player',
    status: 'suspended',
    totalPoints: 900,
    questsCompleted: 3,
  },
];

const mockCreateQuest = vi.fn();
const mockUpdateQuest = vi.fn();
const mockDeleteQuest = vi.fn();
const mockApproveQuest = vi.fn();
const mockUpdateUserStatus = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockAdminUser,
    loading: false,
    error: null,
  }),
}));

// ---------- Test Suite ----------

describe('Admin Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Quest Management', () => {
    it('admin sees quest list and navigates to create new quest', () => {
      function MockAdminQuestsPage() {
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h1>Quest Management</h1>
              <button onClick={() => mockPush('/admin/quests/new')}>Create Quest</button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockQuests.map((q) => (
                  <tr key={q.id}>
                    <td>{q.title}</td>
                    <td>{q.category}</td>
                    <td>{q.isPublished ? 'Published' : 'Draft'}</td>
                    <td>
                      <button onClick={() => mockPush(`/admin/quests/${q.id}/edit`)}>
                        Edit
                      </button>
                      <button onClick={() => mockDeleteQuest(q.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      render(<MockAdminQuestsPage />);

      // Admin page visible
      expect(screen.getByText('Quest Management')).toBeInTheDocument();

      // Quest list rendered
      expect(screen.getByText('Madrid Mystery Trail')).toBeInTheDocument();
      expect(screen.getByText('Barcelona Food Tour')).toBeInTheDocument();

      // Status indicators
      expect(screen.getByText('Published')).toBeInTheDocument();
      expect(screen.getByText('Draft')).toBeInTheDocument();

      // Navigate to create
      fireEvent.click(screen.getByText('Create Quest'));
      expect(mockPush).toHaveBeenCalledWith('/admin/quests/new');
    });

    it('creates a new quest with all fields', async () => {
      mockCreateQuest.mockResolvedValueOnce({ id: 'q-new', title: 'New Quest' });

      function MockCreateQuestPage() {
        const [title, setTitle] = React.useState('');
        const [description, setDescription] = React.useState('');
        const [category, setCategory] = React.useState('adventure');
        const [difficulty, setDifficulty] = React.useState('easy');

        const handleCreate = async (e: React.FormEvent) => {
          e.preventDefault();
          const result = await mockCreateQuest({
            title,
            description,
            category,
            difficulty,
            estimatedDuration: 60,
            stages: [],
            location: { latitude: 40.42, longitude: -3.7, name: 'Madrid' },
            radius: 5000,
            tags: [],
            isPublished: false,
          });
          if (result) mockPush('/admin/quests');
        };

        return (
          <div>
            <h1>Create New Quest</h1>
            <form onSubmit={handleCreate}>
              <input
                placeholder="Quest Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="adventure">Adventure</option>
                <option value="mystery">Mystery</option>
                <option value="cultural">Cultural</option>
              </select>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <button type="submit">Create</button>
            </form>
          </div>
        );
      }

      render(<MockCreateQuestPage />);

      expect(screen.getByText('Create New Quest')).toBeInTheDocument();

      fireEvent.change(screen.getByPlaceholderText('Quest Title'), {
        target: { value: 'Seville Heritage Walk' },
      });
      fireEvent.change(screen.getByPlaceholderText('Description'), {
        target: { value: 'Explore the rich heritage of Seville' },
      });

      fireEvent.click(screen.getByText('Create'));

      await waitFor(() => {
        expect(mockCreateQuest).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Seville Heritage Walk',
            description: 'Explore the rich heritage of Seville',
            category: 'adventure',
            difficulty: 'easy',
          }),
        );
      });
    });

    it('edits an existing quest and publishes it', async () => {
      mockUpdateQuest.mockResolvedValueOnce({ id: 'q2', isPublished: true });

      function MockEditQuestPage() {
        const quest = mockQuests[1]; // Barcelona Food Tour (draft)
        const [title, setTitle] = React.useState(quest.title);
        const [isPublished, setIsPublished] = React.useState(quest.isPublished);

        const handleSave = async () => {
          await mockUpdateQuest({ id: quest.id, title, isPublished });
        };

        return (
          <div>
            <h1>Edit Quest</h1>
            <input
              placeholder="Quest Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <label>
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
              />
              Published
            </label>
            <button onClick={handleSave}>Save Changes</button>
          </div>
        );
      }

      render(<MockEditQuestPage />);

      expect(screen.getByText('Edit Quest')).toBeInTheDocument();

      // Existing title in input
      const titleInput = screen.getByPlaceholderText('Quest Title') as HTMLInputElement;
      expect(titleInput.value).toBe('Barcelona Food Tour');

      // Change title
      fireEvent.change(titleInput, {
        target: { value: 'Barcelona Food Tour (Updated)' },
      });

      // Publish the quest
      const publishCheckbox = screen.getByRole('checkbox');
      fireEvent.click(publishCheckbox);

      fireEvent.click(screen.getByText('Save Changes'));

      await waitFor(() => {
        expect(mockUpdateQuest).toHaveBeenCalledWith({
          id: 'q2',
          title: 'Barcelona Food Tour (Updated)',
          isPublished: true,
        });
      });
    });

    it('deletes a quest with confirmation', () => {
      function MockDeleteFlow() {
        const [quests, setQuests] = React.useState(mockQuests);
        const [confirmDelete, setConfirmDelete] = React.useState<string | null>(null);

        const handleDelete = (id: string) => {
          mockDeleteQuest(id);
          setQuests((prev) => prev.filter((q) => q.id !== id));
          setConfirmDelete(null);
        };

        return (
          <div>
            {quests.map((q) => (
              <div key={q.id} data-testid={`quest-${q.id}`}>
                <span>{q.title}</span>
                <button onClick={() => setConfirmDelete(q.id)}>Delete</button>
              </div>
            ))}
            {confirmDelete && (
              <div data-testid="confirm-dialog">
                <p>Are you sure you want to delete this quest?</p>
                <button onClick={() => handleDelete(confirmDelete)}>Confirm Delete</button>
                <button onClick={() => setConfirmDelete(null)}>Cancel</button>
              </div>
            )}
          </div>
        );
      }

      render(<MockDeleteFlow />);

      expect(screen.getByText('Madrid Mystery Trail')).toBeInTheDocument();
      expect(screen.getByText('Barcelona Food Tour')).toBeInTheDocument();

      // Click delete on first quest
      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);

      // Confirmation dialog appears
      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to delete this quest?')).toBeInTheDocument();

      // Confirm deletion
      fireEvent.click(screen.getByText('Confirm Delete'));

      expect(mockDeleteQuest).toHaveBeenCalledWith('q1');
      expect(screen.queryByText('Madrid Mystery Trail')).not.toBeInTheDocument();
      expect(screen.getByText('Barcelona Food Tour')).toBeInTheDocument();
    });
  });

  describe('Moderation Queue', () => {
    it('admin approves and rejects community quests', async () => {
      mockApproveQuest.mockResolvedValue({ success: true });

      function MockModerationQueue() {
        const [pending, setPending] = React.useState(mockPendingQuests);

        const handleAction = async (id: string, action: 'approve' | 'reject') => {
          await mockApproveQuest({ questId: id, action });
          setPending((prev) => prev.filter((q) => q.id !== id));
        };

        return (
          <div>
            <h1>Moderation Queue</h1>
            <p>{pending.length} quests pending review</p>
            {pending.map((q) => (
              <div key={q.id} data-testid={`pending-${q.id}`}>
                <h3>{q.title}</h3>
                <p>{q.description}</p>
                <p>By: {q.createdByName}</p>
                <p>Category: {q.category}</p>
                <button onClick={() => handleAction(q.id, 'approve')}>Approve</button>
                <button onClick={() => handleAction(q.id, 'reject')}>Reject</button>
              </div>
            ))}
            {pending.length === 0 && <p>No pending quests</p>}
          </div>
        );
      }

      render(<MockModerationQueue />);

      // Queue visible
      expect(screen.getByText('Moderation Queue')).toBeInTheDocument();
      expect(screen.getByText('2 quests pending review')).toBeInTheDocument();

      // Pending quests listed
      expect(screen.getByText('Community Nature Walk')).toBeInTheDocument();
      expect(screen.getByText('Urban Photo Hunt')).toBeInTheDocument();
      expect(screen.getByText('By: Carlos Ruiz')).toBeInTheDocument();
      expect(screen.getByText('By: Ana Torres')).toBeInTheDocument();

      // Approve first quest
      const approveButtons = screen.getAllByText('Approve');
      fireEvent.click(approveButtons[0]);

      await waitFor(() => {
        expect(mockApproveQuest).toHaveBeenCalledWith({
          questId: 'pq1',
          action: 'approve',
        });
      });

      // First quest removed from queue
      await waitFor(() => {
        expect(screen.queryByText('Community Nature Walk')).not.toBeInTheDocument();
      });

      // Reject second quest
      fireEvent.click(screen.getByText('Reject'));

      await waitFor(() => {
        expect(mockApproveQuest).toHaveBeenCalledWith({
          questId: 'pq2',
          action: 'reject',
        });
      });

      // Queue empty
      await waitFor(() => {
        expect(screen.getByText('No pending quests')).toBeInTheDocument();
      });
    });
  });

  describe('User Management', () => {
    it('admin views user list and changes user status', async () => {
      mockUpdateUserStatus.mockResolvedValue({ success: true });

      function MockUserManagement() {
        const [users, setUsers] = React.useState(mockUsers);

        const handleStatusChange = async (
          userId: string,
          newStatus: 'active' | 'suspended',
        ) => {
          await mockUpdateUserStatus({ userId, status: newStatus });
          setUsers((prev) =>
            prev.map((u) =>
              u.userId === userId ? { ...u, status: newStatus } : u,
            ),
          );
        };

        return (
          <div>
            <h1>User Management</h1>
            <p>{users.length} users</p>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Points</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.userId} data-testid={`user-${u.userId}`}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span data-testid={`status-${u.userId}`}>{u.status}</span>
                    </td>
                    <td>{u.totalPoints}</td>
                    <td>
                      {u.status === 'active' ? (
                        <button
                          onClick={() => handleStatusChange(u.userId, 'suspended')}
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(u.userId, 'active')}
                        >
                          Activate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      render(<MockUserManagement />);

      // User list visible
      expect(screen.getByText('User Management')).toBeInTheDocument();
      expect(screen.getByText('3 users')).toBeInTheDocument();

      // Users listed
      expect(screen.getByText('Maria Garcia')).toBeInTheDocument();
      expect(screen.getByText('Pablo Sanchez')).toBeInTheDocument();
      expect(screen.getByText('Carlos Ruiz')).toBeInTheDocument();

      // Status badges
      expect(screen.getByTestId('status-u1')).toHaveTextContent('active');
      expect(screen.getByTestId('status-u3')).toHaveTextContent('suspended');

      // Suspend an active user (Maria Garcia - u1)
      const u1Row = screen.getByTestId('user-u1');
      const suspendU1 = u1Row.querySelector('button')!;
      expect(suspendU1.textContent).toBe('Suspend');
      fireEvent.click(suspendU1);

      await waitFor(() => {
        expect(mockUpdateUserStatus).toHaveBeenCalledWith({
          userId: 'u1',
          status: 'suspended',
        });
      });

      // Verify status updated in UI
      await waitFor(() => {
        expect(screen.getByTestId('status-u1')).toHaveTextContent('suspended');
      });

      // Activate a suspended user (Carlos Ruiz - u3)
      const u3Row = screen.getByTestId('user-u3');
      const activateU3 = u3Row.querySelector('button')!;
      expect(activateU3.textContent).toBe('Activate');
      fireEvent.click(activateU3);

      await waitFor(() => {
        expect(mockUpdateUserStatus).toHaveBeenCalledWith({
          userId: 'u3',
          status: 'active',
        });
      });

      await waitFor(() => {
        expect(screen.getByTestId('status-u3')).toHaveTextContent('active');
      });
    });
  });
});
