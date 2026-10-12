import { act, fireEvent, screen } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import SignupPromptModal, { SIGNUP_PROMPT_KEY } from './SignupPromptModal';

const loggedOut = { auth: { isLoggedIn: false, token: null, refreshToken: null, user: null } };
const loggedIn = {
  auth: { isLoggedIn: true, token: 't', refreshToken: 'r', user: { email: 'fan@example.com', role: 'user' } },
};

const advancePastDelay = () => act(() => { jest.advanceTimersByTime(15000); });

describe('SignupPromptModal', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows once for a logged-out visitor after the delay and records that it was seen', () => {
    renderWithProviders(<SignupPromptModal />, { preloadedState: loggedOut });
    expect(screen.queryByRole('dialog')).toBeNull();

    advancePastDelay();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Follow your favorite artists')).toBeInTheDocument();
    expect(localStorage.getItem(SIGNUP_PROMPT_KEY)).toBe('true');

    fireEvent.click(screen.getByRole('button', { name: 'Maybe later' }));
    expect(localStorage.getItem(SIGNUP_PROMPT_KEY)).toBe('true');
  });

  it('never shows again once it has been seen', () => {
    localStorage.setItem(SIGNUP_PROMPT_KEY, 'true');
    renderWithProviders(<SignupPromptModal />, { preloadedState: loggedOut });
    advancePastDelay();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('never shows to logged-in users and marks them as seen', () => {
    renderWithProviders(<SignupPromptModal />, { preloadedState: loggedIn });
    advancePastDelay();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(localStorage.getItem(SIGNUP_PROMPT_KEY)).toBe('true');
  });

  it('does not show on the auth page', () => {
    renderWithProviders(<SignupPromptModal />, { route: '/auth', path: '/auth', preloadedState: loggedOut });
    advancePastDelay();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(localStorage.getItem(SIGNUP_PROMPT_KEY)).toBeNull();
  });
});
