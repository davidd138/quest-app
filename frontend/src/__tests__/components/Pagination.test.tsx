import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from '@/components/ui/Pagination';

describe('Pagination', () => {
  it('renders page numbers', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={vi.fn()} />);
    for (let i = 1; i <= 5; i++) {
      expect(screen.getByLabelText(`Page ${i}`)).toBeInTheDocument();
    }
  });

  it('highlights the active page with aria-current', () => {
    render(<Pagination currentPage={3} totalPages={5} onPageChange={vi.fn()} />);
    const activePage = screen.getByLabelText('Page 3');
    expect(activePage).toHaveAttribute('aria-current', 'page');
  });

  it('does not mark non-active pages with aria-current', () => {
    render(<Pagination currentPage={2} totalPages={5} onPageChange={vi.fn()} />);
    const page1 = screen.getByLabelText('Page 1');
    expect(page1).not.toHaveAttribute('aria-current');
  });

  it('calls onPageChange when Previous is clicked', () => {
    const handleChange = vi.fn();
    render(<Pagination currentPage={3} totalPages={5} onPageChange={handleChange} />);
    fireEvent.click(screen.getByLabelText('Previous page'));
    expect(handleChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageChange when Next is clicked', () => {
    const handleChange = vi.fn();
    render(<Pagination currentPage={3} totalPages={5} onPageChange={handleChange} />);
    fireEvent.click(screen.getByLabelText('Next page'));
    expect(handleChange).toHaveBeenCalledWith(4);
  });

  it('disables Previous on the first page', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={vi.fn()} />);
    expect(screen.getByLabelText('Previous page')).toBeDisabled();
  });

  it('disables Next on the last page', () => {
    render(<Pagination currentPage={5} totalPages={5} onPageChange={vi.fn()} />);
    expect(screen.getByLabelText('Next page')).toBeDisabled();
  });

  it('shows ellipsis when there are many pages', () => {
    render(<Pagination currentPage={5} totalPages={20} onPageChange={vi.fn()} />);
    const dots = screen.getAllByText('...');
    expect(dots.length).toBeGreaterThan(0);
  });

  it('renders First and Last page buttons in non-compact mode', () => {
    render(<Pagination currentPage={3} totalPages={10} onPageChange={vi.fn()} />);
    expect(screen.getByLabelText('First page')).toBeInTheDocument();
    expect(screen.getByLabelText('Last page')).toBeInTheDocument();
  });

  it('calls onPageChange(1) when First page is clicked', () => {
    const handleChange = vi.fn();
    render(<Pagination currentPage={5} totalPages={10} onPageChange={handleChange} />);
    fireEvent.click(screen.getByLabelText('First page'));
    expect(handleChange).toHaveBeenCalledWith(1);
  });

  it('calls onPageChange(totalPages) when Last page is clicked', () => {
    const handleChange = vi.fn();
    render(<Pagination currentPage={5} totalPages={10} onPageChange={handleChange} />);
    fireEvent.click(screen.getByLabelText('Last page'));
    expect(handleChange).toHaveBeenCalledWith(10);
  });

  it('hides First/Last buttons in compact mode', () => {
    render(<Pagination currentPage={3} totalPages={10} onPageChange={vi.fn()} compact />);
    expect(screen.queryByLabelText('First page')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Last page')).not.toBeInTheDocument();
  });

  it('renders nothing when totalPages is 1', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={vi.fn()} />,
    );
    expect(container.innerHTML).toBe('');
  });

  it('calls onPageChange when a page number is clicked', () => {
    const handleChange = vi.fn();
    render(<Pagination currentPage={1} totalPages={5} onPageChange={handleChange} />);
    fireEvent.click(screen.getByLabelText('Page 4'));
    expect(handleChange).toHaveBeenCalledWith(4);
  });
});
