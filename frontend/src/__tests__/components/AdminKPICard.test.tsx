import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminKPICard from '@/components/admin/AdminKPICard';
import { Users } from 'lucide-react';

describe('AdminKPICard', () => {
  it('renders value text', () => {
    render(<AdminKPICard label="Total Users" value={1234} />);
    // The animated counter renders inside a testid
    const valueEl = screen.getByTestId('kpi-value');
    expect(valueEl).toBeInTheDocument();
  });

  it('renders label text', () => {
    render(<AdminKPICard label="Total Users" value={100} />);
    expect(screen.getByText('Total Users')).toBeInTheDocument();
  });

  it('shows trend arrow when trend is up', () => {
    render(
      <AdminKPICard
        label="Users"
        value={100}
        trend={{ direction: 'up', percentage: 12.5 }}
      />,
    );
    const trend = screen.getByTestId('kpi-trend');
    expect(trend).toBeInTheDocument();
    expect(trend.textContent).toContain('12.5%');
  });

  it('shows trend arrow when trend is down', () => {
    render(
      <AdminKPICard
        label="Users"
        value={100}
        trend={{ direction: 'down', percentage: 5.3 }}
      />,
    );
    const trend = screen.getByTestId('kpi-trend');
    expect(trend).toBeInTheDocument();
    expect(trend.textContent).toContain('5.3%');
    expect(trend.className).toContain('text-rose-400');
  });

  it('shows neutral trend indicator', () => {
    render(
      <AdminKPICard
        label="Score"
        value={4.5}
        trend={{ direction: 'neutral', percentage: 0.0 }}
      />,
    );
    const trend = screen.getByTestId('kpi-trend');
    expect(trend).toBeInTheDocument();
    expect(trend.className).toContain('text-slate-400');
  });

  it('renders sparkline when data is provided', () => {
    render(
      <AdminKPICard
        label="Users"
        value={100}
        sparklineData={[10, 20, 30, 40, 50]}
      />,
    );
    const sparkline = screen.getByTestId('kpi-sparkline');
    expect(sparkline).toBeInTheDocument();
  });

  it('does not render sparkline when data has fewer than 2 points', () => {
    render(
      <AdminKPICard
        label="Users"
        value={100}
        sparklineData={[10]}
      />,
    );
    expect(screen.queryByTestId('kpi-sparkline')).not.toBeInTheDocument();
  });

  it('shows loading skeleton when loading is true', () => {
    render(<AdminKPICard label="Users" value={100} loading />);
    const skeleton = screen.getByTestId('kpi-skeleton');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton.className).toContain('animate-pulse');
    // Should not render the card content
    expect(screen.queryByTestId('kpi-card')).not.toBeInTheDocument();
  });

  it('fires click callback when clicked', () => {
    const handleClick = vi.fn();
    render(
      <AdminKPICard label="Users" value={100} onClick={handleClick} />,
    );
    const card = screen.getByTestId('kpi-card');
    fireEvent.click(card);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('has cursor-pointer when onClick is provided', () => {
    render(
      <AdminKPICard label="Users" value={100} onClick={() => {}} />,
    );
    const card = screen.getByTestId('kpi-card');
    expect(card.className).toContain('cursor-pointer');
  });

  it('does not have cursor-pointer when onClick is not provided', () => {
    render(<AdminKPICard label="Users" value={100} />);
    const card = screen.getByTestId('kpi-card');
    expect(card.className).not.toContain('cursor-pointer');
  });

  it('shows comparison label when trend has label', () => {
    render(
      <AdminKPICard
        label="Revenue"
        value={5000}
        trend={{ direction: 'up', percentage: 10, label: 'vs last week' }}
      />,
    );
    expect(screen.getByText('vs last week')).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    const { container } = render(
      <AdminKPICard label="Users" value={100} icon={Users} />,
    );
    // lucide icons render as SVG elements inside the icon container
    const iconContainer = container.querySelector('.rounded-xl.bg-violet-500\\/10');
    expect(iconContainer).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <AdminKPICard label="Users" value={100} className="my-custom-class" />,
    );
    const card = screen.getByTestId('kpi-card');
    expect(card.className).toContain('my-custom-class');
  });
});
