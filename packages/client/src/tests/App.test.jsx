import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import App from '../App.jsx';

describe('App routes', () => {
  const qc = new QueryClient();
  it('renders login page', async () => {
    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter initialEntries={[{ pathname: '/login' }]}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    );
    expect(await screen.findByText('Login')).toBeInTheDocument();
  });
  it('redirects protected to login when not authed', async () => {
    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter initialEntries={[{ pathname: '/dashboard' }]}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    );
    expect(await screen.findByText('Login')).toBeInTheDocument();
  });
});

