import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Select from '@/components/ui/Select';

// Mock scrollIntoView (not available in JSDOM)
Element.prototype.scrollIntoView = vi.fn();

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: (_target: unknown, prop: string) => {
        const Component = React.forwardRef(
          (props: Record<string, unknown>, ref: React.Ref<HTMLElement>) => {
            const { children, className, onClick, style, ...rest } = props;
            void rest;
            return React.createElement(
              prop,
              { ref, className, onClick, style, 'data-testid': props['data-testid'] },
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

const defaultOptions = [
  { value: 'adventure', label: 'Adventure' },
  { value: 'mystery', label: 'Mystery' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'educational', label: 'Educational' },
];

describe('Select', () => {
  let onChange: (value: string) => void;

  beforeEach(() => {
    onChange = vi.fn();
  });

  it('renders with placeholder when no value selected', () => {
    render(<Select options={defaultOptions} value="" onChange={onChange} />);
    expect(screen.getByText('Seleccionar...')).toBeInTheDocument();
  });

  it('renders custom placeholder', () => {
    render(
      <Select
        options={defaultOptions}
        value=""
        onChange={onChange}
        placeholder="Pick one..."
      />,
    );
    expect(screen.getByText('Pick one...')).toBeInTheDocument();
  });

  it('renders selected option label', () => {
    render(<Select options={defaultOptions} value="mystery" onChange={onChange} />);
    expect(screen.getByText('Mystery')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(
      <Select
        options={defaultOptions}
        value=""
        onChange={onChange}
        label="Category"
      />,
    );
    expect(screen.getByText('Category')).toBeInTheDocument();
  });

  it('opens dropdown on click', () => {
    render(<Select options={defaultOptions} value="" onChange={onChange} />);

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    // All options should be visible
    expect(screen.getByText('Adventure')).toBeInTheDocument();
    expect(screen.getByText('Mystery')).toBeInTheDocument();
    expect(screen.getByText('Cultural')).toBeInTheDocument();
    expect(screen.getByText('Educational')).toBeInTheDocument();
  });

  it('selects option on click', () => {
    render(<Select options={defaultOptions} value="" onChange={onChange} />);

    // Open
    fireEvent.click(screen.getByRole('combobox'));

    // Click an option
    fireEvent.click(screen.getByText('Adventure'));

    expect(onChange).toHaveBeenCalledWith('adventure');
  });

  it('closes dropdown after selection', () => {
    render(<Select options={defaultOptions} value="" onChange={onChange} />);

    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Cultural'));

    // Dropdown should close
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('closes dropdown on Escape key', () => {
    render(<Select options={defaultOptions} value="" onChange={onChange} />);

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.keyDown(trigger, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('opens dropdown on ArrowDown key', () => {
    render(<Select options={defaultOptions} value="" onChange={onChange} />);

    const trigger = screen.getByRole('combobox');
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });

    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('navigates down with ArrowDown and selects with Enter', () => {
    render(<Select options={defaultOptions} value="" onChange={onChange} />);

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    // Navigate down twice (starts at 0 = Adventure, then 1 = Mystery)
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });

    // Press Enter to select focused option
    fireEvent.keyDown(trigger, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('navigates up with ArrowUp', () => {
    render(<Select options={defaultOptions} value="cultural" onChange={onChange} />);

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    // Focus starts on 'cultural' (index 2), go up to 'mystery' (index 1)
    fireEvent.keyDown(trigger, { key: 'ArrowUp' });
    fireEvent.keyDown(trigger, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith('mystery');
  });

  it('shows search input when searchable', () => {
    render(
      <Select
        options={defaultOptions}
        value=""
        onChange={onChange}
        searchable
      />,
    );

    fireEvent.click(screen.getByRole('combobox'));

    const searchInput = screen.getByPlaceholderText('Buscar...');
    expect(searchInput).toBeInTheDocument();
  });

  it('filters options based on search input', () => {
    render(
      <Select
        options={defaultOptions}
        value=""
        onChange={onChange}
        searchable
      />,
    );

    fireEvent.click(screen.getByRole('combobox'));

    const searchInput = screen.getByPlaceholderText('Buscar...');
    fireEvent.change(searchInput, { target: { value: 'myst' } });

    // Only Mystery should be visible
    expect(screen.getByText('Mystery')).toBeInTheDocument();
    expect(screen.queryByText('Adventure')).not.toBeInTheDocument();
    expect(screen.queryByText('Cultural')).not.toBeInTheDocument();
  });

  it('shows "Sin resultados" when search matches nothing', () => {
    render(
      <Select
        options={defaultOptions}
        value=""
        onChange={onChange}
        searchable
      />,
    );

    fireEvent.click(screen.getByRole('combobox'));

    const searchInput = screen.getByPlaceholderText('Buscar...');
    fireEvent.change(searchInput, { target: { value: 'zzzzz' } });

    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(
      <Select
        options={defaultOptions}
        value=""
        onChange={onChange}
        error="This field is required"
      />,
    );

    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('applies error border style', () => {
    const { container } = render(
      <Select
        options={defaultOptions}
        value=""
        onChange={onChange}
        error="Required"
      />,
    );

    const trigger = container.querySelector('button');
    expect(trigger?.className).toContain('border-rose-500');
  });

  it('is disabled when disabled prop is true', () => {
    render(
      <Select options={defaultOptions} value="" onChange={onChange} disabled />,
    );

    const trigger = screen.getByRole('combobox');
    expect(trigger).toBeDisabled();
  });

  it('does not open dropdown when disabled', () => {
    render(
      <Select options={defaultOptions} value="" onChange={onChange} disabled />,
    );

    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('skips disabled options during keyboard navigation', () => {
    const optionsWithDisabled = [
      { value: 'a', label: 'Option A' },
      { value: 'b', label: 'Option B', disabled: true },
      { value: 'c', label: 'Option C' },
    ];

    render(
      <Select options={optionsWithDisabled} value="a" onChange={onChange} />,
    );

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    // Currently focused on 'a' (index 0), pressing down should skip 'b' and land on 'c'
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    fireEvent.keyDown(trigger, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith('c');
  });

  it('does not select disabled option on click', () => {
    const optionsWithDisabled = [
      { value: 'a', label: 'Option A' },
      { value: 'b', label: 'Option B', disabled: true },
    ];

    render(
      <Select options={optionsWithDisabled} value="" onChange={onChange} />,
    );

    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByText('Option B'));

    expect(onChange).not.toHaveBeenCalled();
  });

  it('shows checkmark for selected option', () => {
    const { container } = render(
      <Select options={defaultOptions} value="mystery" onChange={onChange} />,
    );

    fireEvent.click(screen.getByRole('combobox'));

    // The selected option should have aria-selected="true"
    const selectedOption = container.querySelector('[aria-selected="true"]');
    expect(selectedOption).toBeInTheDocument();
    expect(selectedOption?.textContent).toContain('Mystery');
  });

  it('sets aria-expanded correctly', () => {
    render(<Select options={defaultOptions} value="" onChange={onChange} />);

    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });
});
