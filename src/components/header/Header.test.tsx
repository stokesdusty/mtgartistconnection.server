import { fireEvent, screen } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import Header from './Header';
import Footer from '../home/Footer';

const loggedOut = { auth: { isLoggedIn: false, token: null, refreshToken: null, user: null } };
const loggedIn = {
  auth: { isLoggedIn: true, token: 't', refreshToken: 'r', user: { email: 'fan@example.com', role: 'user' } },
};

describe('Header', () => {
  it('marks Artists as the current page on artist routes', () => {
    renderWithProviders(<Header />, { route: '/artist/Seb%20McKinnon', path: '/artist/:name', preloadedState: loggedOut });
    expect(screen.getByRole('link', { name: 'Artists' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Events' })).not.toHaveAttribute('aria-current');
  });

  it('maps nav items to the existing routes', () => {
    renderWithProviders(<Header />, { preloadedState: loggedOut });
    expect(screen.getByRole('link', { name: 'Events' })).toHaveAttribute('href', '/calendar');
    expect(screen.getByRole('link', { name: 'Services' })).toHaveAttribute('href', '/signingservices');
    expect(screen.queryByRole('link', { name: 'News' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Dashboard' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('shows Dashboard and the account drawer when logged in', () => {
    renderWithProviders(<Header />, { preloadedState: loggedIn });
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/dashboard');
    fireEvent.click(screen.getByRole('button', { name: 'open account menu' }));
    expect(screen.getByText('fan@example.com')).toBeInTheDocument();
    expect(screen.getByText('Your Signed Cards')).toBeInTheDocument();
    expect(screen.queryByText('Add Artist')).toBeNull();
  });
});

describe('Footer', () => {
  afterEach(() => {
    delete (window as any).gtag;
    jest.useRealTimers();
  });

  it('keeps the legal links and affiliate disclosure', () => {
    renderWithProviders(<Footer />);
    expect(screen.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacypolicy');
    expect(screen.getByRole('link', { name: 'Affiliate Disclosure' })).toHaveAttribute('href', '/affiliate-disclosure');
    expect(screen.getByText(/participant in affiliate programs/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Manapool Partner' })).toHaveAttribute('href', 'https://www.manapool.com?ref=mtgartistconnection');
  });

  it('tracks the Ko-fi click and opens the page exactly once', () => {
    jest.useFakeTimers();
    const open = jest.spyOn(window, 'open').mockImplementation(() => null);
    const gtag = jest.fn((_cmd, _name, params) => params.event_callback());
    (window as any).gtag = gtag;

    renderWithProviders(<Footer />);
    fireEvent.click(screen.getByRole('link', { name: /Support us/ }));
    jest.advanceTimersByTime(500);

    expect(gtag).toHaveBeenCalledWith('event', 'kofi_support_click', expect.objectContaining({ event_label: 'kofi_footer' }));
    expect(open).toHaveBeenCalledTimes(1);
    expect(open.mock.calls[0][0]).toContain('ko-fi.com/Y8Y71T8GEF');
    open.mockRestore();
  });
});
