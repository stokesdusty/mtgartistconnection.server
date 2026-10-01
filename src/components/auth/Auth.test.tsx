import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import Auth from './Auth';
import authReducer from '../../store/auth-slice';
import { USER_LOGIN } from '../graphql/mutations';

const LocationDisplay = () => {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
};

const loginMock = {
  request: { query: USER_LOGIN, variables: { email: 'test@example.com', password: 'password123' } },
  result: {
    data: {
      login: {
        token: 'token',
        refreshToken: 'refresh',
        user: { id: 'u1', email: 'test@example.com', name: 'Test User', role: 'user' },
      },
    },
  },
};

function renderAuthAndLogin(route: string) {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: { auth: { isLoggedIn: false, token: null, refreshToken: null, user: null } },
  });
  render(
    <Provider store={store}>
      <MockedProvider mocks={[loginMock]} addTypename={false}>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="*" element={<LocationDisplay />} />
          </Routes>
        </MemoryRouter>
      </MockedProvider>
    </Provider>
  );
  userEvent.type(screen.getByLabelText(/Email/), 'test@example.com');
  userEvent.type(screen.getByLabelText(/Password/), 'password123');
  userEvent.click(screen.getByRole('button', { name: 'Sign In' }));
}

describe('Auth redirect after login', () => {
  it('returns to the redirect path', async () => {
    renderAuthAndLogin('/auth?redirect=%2Fsettings');
    expect(await screen.findByTestId('location')).toHaveTextContent('/settings');
  });

  it('defaults to the dashboard with no redirect', async () => {
    renderAuthAndLogin('/auth');
    expect(await screen.findByTestId('location')).toHaveTextContent('/dashboard');
  });

  it('ignores redirects that would leave the site', async () => {
    renderAuthAndLogin('/auth?redirect=%2F%2Fevil.com');
    expect(await screen.findByTestId('location')).toHaveTextContent('/dashboard');
  });
});
