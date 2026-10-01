import { screen, waitFor, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import Settings from './Settings';
import authReducer from '../../store/auth-slice';
import { GET_CURRENT_USER } from '../graphql/queries';
import { UPDATE_EMAIL_PREFERENCES } from '../graphql/mutations';

const user = { id: 'u1', email: 'test@example.com', name: 'Test User', role: 'user' };

const loggedInState = {
  auth: { isLoggedIn: true, token: 'token', refreshToken: 'refresh', user },
};
const loggedOutState = {
  auth: { isLoggedIn: false, token: null, refreshToken: null, user: null },
};

const prefs = {
  siteUpdates: true,
  artistUpdates: false,
  localSigningEvents: true,
  newArtistNotifications: false,
};

const meMock = (emailPreferences = prefs): MockedResponse => ({
  request: { query: GET_CURRENT_USER },
  result: {
    data: {
      me: { ...user, emailPreferences, followedArtists: [], monitoredStates: [] },
    },
  },
});

const LocationDisplay = () => {
  const location = useLocation();
  return <div data-testid="location">{location.pathname + location.search}</div>;
};

function renderSettings(mocks: MockedResponse[], preloadedState: Record<string, unknown> = loggedInState) {
  const store = configureStore({ reducer: { auth: authReducer }, preloadedState });
  return render(
    <Provider store={store}>
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter initialEntries={['/settings']}>
          <Routes>
            <Route path="/settings" element={<Settings />} />
            <Route path="/auth" element={<LocationDisplay />} />
          </Routes>
        </MemoryRouter>
      </MockedProvider>
    </Provider>
  );
}

// siteUpdates is true on the server but false in the initial state, so this proves the loaded values are applied
const waitForServerPrefs = () =>
  waitFor(() => expect(screen.getByRole('checkbox', { name: 'Receive site update emails' })).toBeChecked());

const newArtistSwitch = () =>
  screen.getByRole('checkbox', { name: 'Receive new artist notifications' });

describe('Settings email preferences', () => {
  it('redirects logged-out users to login with a return path', async () => {
    renderSettings([], loggedOutState);
    expect(await screen.findByTestId('location')).toHaveTextContent('/auth?redirect=%2Fsettings');
  });

  it('starts each toggle from the server value', async () => {
    renderSettings([meMock({ ...prefs, newArtistNotifications: true })]);
    await waitFor(() => expect(newArtistSwitch()).toBeChecked());
    expect(screen.getByRole('checkbox', { name: 'Receive site update emails' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Receive artist update emails' })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Receive local signing event notifications' })).toBeChecked();
  });

  it('sends all four preferences, keeping the untouched ones, and shows success', async () => {
    const saved = { ...prefs, newArtistNotifications: true };
    renderSettings([
      meMock(),
      {
        request: { query: UPDATE_EMAIL_PREFERENCES, variables: saved },
        result: { data: { updateEmailPreferences: { success: true, message: 'ok' } } },
      },
      meMock(saved),
    ]);

    await waitForServerPrefs();
    expect(newArtistSwitch()).not.toBeChecked();
    userEvent.click(newArtistSwitch());
    userEvent.click(screen.getByRole('button', { name: 'Save Preferences' }));

    // MockedProvider only matches when the variables are exactly `saved`
    expect(await screen.findByText('Email preferences updated successfully')).toBeInTheDocument();
    expect(newArtistSwitch()).toBeChecked();
  });

  it('shows the server message when success is false', async () => {
    renderSettings([
      meMock(),
      {
        request: { query: UPDATE_EMAIL_PREFERENCES, variables: prefs },
        result: { data: { updateEmailPreferences: { success: false, message: 'Could not save preferences' } } },
      },
    ]);

    await waitForServerPrefs();
    userEvent.click(screen.getByRole('button', { name: 'Save Preferences' }));

    expect(await screen.findByText('Could not save preferences')).toBeInTheDocument();
    expect(screen.queryByText('Email preferences updated successfully')).not.toBeInTheDocument();
  });

  it('shows an error when the request fails', async () => {
    renderSettings([
      meMock(),
      {
        request: { query: UPDATE_EMAIL_PREFERENCES, variables: prefs },
        error: new Error('Network down'),
      },
    ]);

    await waitForServerPrefs();
    userEvent.click(screen.getByRole('button', { name: 'Save Preferences' }));

    expect(await screen.findByText('Network down')).toBeInTheDocument();
  });
});
