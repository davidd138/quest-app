import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import QuestMap from '@/components/maps/QuestMap';
import type { Stage } from '@/types';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: (_target: unknown, prop: string) => {
      const Component = React.forwardRef((props: Record<string, unknown>, ref: React.Ref<HTMLElement>) => {
        const { children, className, onClick, href, style, ...rest } = props;
        void rest;
        return React.createElement(prop, { ref, className, onClick, href, style, 'data-testid': props['data-testid'] }, children as React.ReactNode);
      });
      Component.displayName = `motion.${prop}`;
      return Component;
    }
  }),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
}));

// Mock react-map-gl
const mockMarkerClick = vi.fn();

vi.mock('react-map-gl', () => ({
  default: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <div data-testid="map-container" data-access-token={props.mapboxAccessToken as string}>
      {children}
    </div>
  ),
  Marker: ({ children, onClick, longitude, latitude }: React.PropsWithChildren<{
    onClick?: (e: { originalEvent: { stopPropagation: () => void } }) => void;
    longitude: number;
    latitude: number;
  }>) => (
    <div
      data-testid="map-marker"
      data-longitude={longitude}
      data-latitude={latitude}
      onClick={() => {
        mockMarkerClick();
        onClick?.({ originalEvent: { stopPropagation: vi.fn() } });
      }}
    >
      {children}
    </div>
  ),
  Popup: ({ children }: React.PropsWithChildren<Record<string, unknown>>) => (
    <div data-testid="map-popup">{children}</div>
  ),
  NavigationControl: () => <div data-testid="nav-control" />,
}));

// Mock RouteLayer
vi.mock('@/components/maps/RouteLayer', () => ({
  default: () => <div data-testid="route-layer" />,
}));

// Mock mapbox-gl CSS import
vi.mock('mapbox-gl/dist/mapbox-gl.css', () => ({}));

// Mock constants
vi.mock('@/lib/constants', () => ({
  MAPBOX_TOKEN: 'test-mapbox-token',
}));

const makeStage = (id: string, order: number, lat = 40.4, lng = -3.7): Stage => ({
  id,
  order,
  title: `Stage ${order}`,
  description: `Description for stage ${order}`,
  location: { latitude: lat, longitude: lng, name: `Location ${order}` },
  character: {
    name: 'Guide',
    role: 'NPC',
    personality: 'Friendly',
    backstory: 'A guide',
    voiceStyle: 'warm',
    greetingMessage: 'Hello!',
  },
  challenge: {
    type: 'conversation' as const,
    description: 'Talk to the character',
    successCriteria: 'Complete dialogue',
    failureHints: ['Try again'],
  },
  points: 100,
  hints: ['Look around'],
});

describe('QuestMap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const stages = [makeStage('s1', 1), makeStage('s2', 2)];
    const { container } = render(
      <QuestMap stages={stages} currentStageIndex={0} />,
    );
    expect(container).toBeTruthy();
  });

  it('renders the map container', () => {
    const stages = [makeStage('s1', 1)];
    render(<QuestMap stages={stages} currentStageIndex={0} />);
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });

  it('renders markers for each stage', () => {
    const stages = [makeStage('s1', 1), makeStage('s2', 2), makeStage('s3', 3)];
    render(<QuestMap stages={stages} currentStageIndex={0} />);
    const markers = screen.getAllByTestId('map-marker');
    expect(markers).toHaveLength(3);
  });

  it('handles empty stages array', () => {
    render(<QuestMap stages={[]} currentStageIndex={0} />);
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
    expect(screen.queryByTestId('map-marker')).not.toBeInTheDocument();
  });

  it('calls onStageClick when a marker is clicked', () => {
    const onStageClick = vi.fn();
    const stages = [makeStage('s1', 1), makeStage('s2', 2)];
    render(
      <QuestMap stages={stages} currentStageIndex={0} onStageClick={onStageClick} />,
    );
    const markers = screen.getAllByTestId('map-marker');
    fireEvent.click(markers[0]);
    expect(onStageClick).toHaveBeenCalledTimes(1);
    expect(onStageClick).toHaveBeenCalledWith(expect.objectContaining({ id: 's1' }), 0);
  });

  it('renders navigation control', () => {
    const stages = [makeStage('s1', 1)];
    render(<QuestMap stages={stages} currentStageIndex={0} />);
    expect(screen.getByTestId('nav-control')).toBeInTheDocument();
  });

  it('renders route layer', () => {
    const stages = [makeStage('s1', 1), makeStage('s2', 2)];
    render(<QuestMap stages={stages} currentStageIndex={0} />);
    expect(screen.getByTestId('route-layer')).toBeInTheDocument();
  });

  it('passes mapbox token to Map component', () => {
    const stages = [makeStage('s1', 1)];
    render(<QuestMap stages={stages} currentStageIndex={0} />);
    expect(screen.getByTestId('map-container')).toHaveAttribute(
      'data-access-token',
      'test-mapbox-token',
    );
  });

  it('shows popup when marker is clicked', () => {
    const stages = [makeStage('s1', 1)];
    render(<QuestMap stages={stages} currentStageIndex={0} />);
    const marker = screen.getByTestId('map-marker');
    fireEvent.click(marker);
    expect(screen.getByTestId('map-popup')).toBeInTheDocument();
  });

  it('sorts stages by order', () => {
    const stages = [makeStage('s3', 3, 40.6, -3.5), makeStage('s1', 1, 40.4, -3.7), makeStage('s2', 2, 40.5, -3.6)];
    render(<QuestMap stages={stages} currentStageIndex={0} />);
    const markers = screen.getAllByTestId('map-marker');
    // First marker should be stage with order 1
    expect(markers[0]).toHaveAttribute('data-latitude', '40.4');
  });
});
