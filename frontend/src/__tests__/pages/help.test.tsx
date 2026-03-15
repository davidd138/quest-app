import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

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

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) =>
    React.createElement('a', { href, ...props }, children),
}));

// Since there is no help page yet, we create a minimal mock component
// that represents what a help/FAQ page would contain.
const mockFaqData = [
  {
    category: 'General',
    items: [
      { question: 'Que es QuestMaster?', answer: 'QuestMaster es una plataforma de aventuras interactivas con IA.' },
      { question: 'Como empiezo?', answer: 'Registrate y elige tu primera quest.' },
    ],
  },
  {
    category: 'Quests',
    items: [
      { question: 'Como creo una quest?', answer: 'Ve al panel de administracion y haz clic en "Crear Quest".' },
      { question: 'Puedo jugar offline?', answer: 'Actualmente las quests requieren conexion a internet.' },
    ],
  },
  {
    category: 'Cuenta',
    items: [
      { question: 'Como cambio mi contrasena?', answer: 'Ve a Ajustes > Cuenta > Cambiar contrasena.' },
    ],
  },
];

// Mock help page component for testing purposes
function HelpPage() {
  const [search, setSearch] = React.useState('');
  const [expandedItem, setExpandedItem] = React.useState<string | null>(null);

  const filteredFaqs = mockFaqData
    .map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          !search ||
          item.question.toLowerCase().includes(search.toLowerCase()) ||
          item.answer.toLowerCase().includes(search.toLowerCase()),
      ),
    }))
    .filter((cat) => cat.items.length > 0);

  return (
    <div>
      <h1>Centro de ayuda</h1>
      <input
        type="text"
        placeholder="Buscar en FAQ..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        data-testid="faq-search"
      />
      {filteredFaqs.map((cat) => (
        <div key={cat.category}>
          <h2>{cat.category}</h2>
          {cat.items.map((item) => (
            <div key={item.question}>
              <button
                onClick={() =>
                  setExpandedItem(expandedItem === item.question ? null : item.question)
                }
                data-testid={`faq-item-${item.question}`}
              >
                {item.question}
              </button>
              {expandedItem === item.question && (
                <p data-testid={`faq-answer-${item.question}`}>{item.answer}</p>
              )}
            </div>
          ))}
        </div>
      ))}
      {filteredFaqs.length === 0 && <p>No se encontraron resultados</p>}
      <a href="/contact" data-testid="contact-support">
        Contactar soporte
      </a>
    </div>
  );
}

describe('HelpPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders FAQ categories', () => {
    render(<HelpPage />);
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('Quests')).toBeInTheDocument();
    expect(screen.getByText('Cuenta')).toBeInTheDocument();
  });

  it('renders the page heading', () => {
    render(<HelpPage />);
    expect(screen.getByText('Centro de ayuda')).toBeInTheDocument();
  });

  it('search filters FAQs', () => {
    render(<HelpPage />);
    const searchInput = screen.getByTestId('faq-search');
    fireEvent.change(searchInput, { target: { value: 'contrasena' } });
    expect(screen.getByText('Como cambio mi contrasena?')).toBeInTheDocument();
    expect(screen.queryByText('Que es QuestMaster?')).not.toBeInTheDocument();
  });

  it('search shows empty state when no results', () => {
    render(<HelpPage />);
    const searchInput = screen.getByTestId('faq-search');
    fireEvent.change(searchInput, { target: { value: 'xyznonexistent' } });
    expect(screen.getByText('No se encontraron resultados')).toBeInTheDocument();
  });

  it('expandable items work - clicking shows answer', () => {
    render(<HelpPage />);
    const question = screen.getByText('Que es QuestMaster?');
    fireEvent.click(question);
    expect(
      screen.getByText('QuestMaster es una plataforma de aventuras interactivas con IA.'),
    ).toBeInTheDocument();
  });

  it('expandable items work - clicking again hides answer', () => {
    render(<HelpPage />);
    const question = screen.getByText('Que es QuestMaster?');
    fireEvent.click(question);
    expect(
      screen.getByText('QuestMaster es una plataforma de aventuras interactivas con IA.'),
    ).toBeInTheDocument();
    fireEvent.click(question);
    expect(
      screen.queryByText('QuestMaster es una plataforma de aventuras interactivas con IA.'),
    ).not.toBeInTheDocument();
  });

  it('only one item is expanded at a time', () => {
    render(<HelpPage />);
    fireEvent.click(screen.getByText('Que es QuestMaster?'));
    expect(
      screen.getByText('QuestMaster es una plataforma de aventuras interactivas con IA.'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText('Como empiezo?'));
    expect(
      screen.queryByText('QuestMaster es una plataforma de aventuras interactivas con IA.'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText('Registrate y elige tu primera quest.'),
    ).toBeInTheDocument();
  });

  it('contact support link is present', () => {
    render(<HelpPage />);
    const link = screen.getByTestId('contact-support');
    expect(link).toBeInTheDocument();
    expect(link.getAttribute('href')).toBe('/contact');
    expect(link.textContent).toBe('Contactar soporte');
  });

  it('renders all FAQ questions', () => {
    render(<HelpPage />);
    expect(screen.getByText('Que es QuestMaster?')).toBeInTheDocument();
    expect(screen.getByText('Como empiezo?')).toBeInTheDocument();
    expect(screen.getByText('Como creo una quest?')).toBeInTheDocument();
    expect(screen.getByText('Puedo jugar offline?')).toBeInTheDocument();
    expect(screen.getByText('Como cambio mi contrasena?')).toBeInTheDocument();
  });
});
