import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { GraphQLError } from 'graphql';
import ArtistDashboard from './ArtistDashboard';
import authReducer from '../../store/auth-slice';
import { GET_ARTIST_DASHBOARD, GET_ARTIST_EDIT_LOG } from '../graphql/queries';
import { UPDATE_ARTIST_PROFILE } from '../graphql/mutations';

const user = { id: 'u1', email: 'artist@example.com', name: 'Artist', role: 'user' };
const loggedInState = { auth: { isLoggedIn: true, token: 'token', refreshToken: 'refresh', user } };
const loggedOutState = { auth: { isLoggedIn: false, token: null, refreshToken: null, user: null } };

const artist = {
  id: 'a1',
  name: 'Jane Painter',
  email: 'jane@example.com',
  url: 'https://jane.art',
  facebook: null,
  instagram: 'https://instagram.com/jane',
  twitter: null,
  patreon: null,
  youtube: null,
  artstation: null,
  bluesky: null,
  omalink: null,
  inprnt: null,
  location: 'Ohio',
  signing: 'yes',
  artistProofs: 'false',
  artistNote: '',
  artistNoteUpdatedAt: null,
  signatureExamples: [],
};

const dashboardMock = (artistDashboard: any, artistId?: string): MockedResponse => ({
  request: { query: GET_ARTIST_DASHBOARD, variables: { artistId } },
  result: { data: { artistDashboard } },
});

const logMock = (entries: any[] = []): MockedResponse => ({
  request: { query: GET_ARTIST_EDIT_LOG, variables: { artistId: 'a1' } },
  result: { data: { artistEditLog: entries } },
});

const LocationDisplay = () => {
  const location = useLocation();
  return <div data-testid="location">{location.pathname + location.search}</div>;
};

function renderDashboard(mocks: MockedResponse[], route = '/artist-dashboard', preloadedState: Record<string, unknown> = loggedInState) {
  const store = configureStore({ reducer: { auth: authReducer }, preloadedState });
  return render(
    <Provider store={store}>
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path="/artist-dashboard" element={<ArtistDashboard />} />
            <Route path="/artist-dashboard/:artistId" element={<ArtistDashboard />} />
            <Route path="/auth" element={<LocationDisplay />} />
          </Routes>
        </MemoryRouter>
      </MockedProvider>
    </Provider>
  );
}

describe('ArtistDashboard', () => {
  it('redirects logged-out users to login with a return path', async () => {
    renderDashboard([], '/artist-dashboard', loggedOutState);
    expect(await screen.findByTestId('location')).toHaveTextContent('/auth?redirect=%2Fartist-dashboard');
  });

  it('explains how to get linked when the account is not a verified artist', async () => {
    renderDashboard([dashboardMock(null)]);
    expect(await screen.findByRole('heading', { name: 'Not linked yet' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'contact us' })).toHaveAttribute('href', '/contact');
  });

  it('shows no access when the API refuses the artist id', async () => {
    renderDashboard(
      [{ request: { query: GET_ARTIST_DASHBOARD, variables: { artistId: 'other' } }, result: { errors: [new GraphQLError("You don't have access to this artist's dashboard.")] } }],
      '/artist-dashboard/other',
    );
    expect(await screen.findByRole('heading', { name: 'No access' })).toBeInTheDocument();
  });

  it('loads the artist and normalises legacy yes/no values', async () => {
    renderDashboard([dashboardMock(artist), logMock()]);
    expect(await screen.findByRole('heading', { name: 'Jane Painter' })).toBeInTheDocument();
    expect(screen.getByLabelText('Location')).toHaveValue('Ohio');
    expect(screen.getByRole('checkbox', { name: "I'm currently signing cards" })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'I offer artist proofs' })).not.toBeChecked();
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
  });

  it('sends only the changed fields and shows the saved state', async () => {
    const saved = { ...artist, location: 'Seattle, WA', artistNote: 'Signing at MagicCon!', artistNoteUpdatedAt: '2026-10-11T00:00:00.000Z' };
    const updateMock: MockedResponse = {
      request: {
        query: UPDATE_ARTIST_PROFILE,
        variables: { artistId: 'a1', input: { location: 'Seattle, WA', artistNote: 'Signing at MagicCon!' } },
      },
      result: { data: { updateArtistProfile: saved } },
    };
    renderDashboard([dashboardMock(artist), logMock(), updateMock, logMock([{ id: 'l1', byAdmin: false, createdAt: '2026-10-11T00:00:00.000Z', changes: [{ field: 'location' }, { field: 'artistNote' }] }])]);

    const location = await screen.findByLabelText('Location');
    await userEvent.clear(location);
    await userEvent.type(location, 'Seattle, WA');
    await userEvent.type(screen.getByRole('textbox', { name: 'Note from you' }), 'Signing at MagicCon!');
    expect(screen.getByText('You have unsaved changes.')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Saved. Your artist page is updated.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
    expect(await screen.findByText('Location, Note')).toBeInTheDocument();
  });

  it('shows the API error when a save is rejected', async () => {
    const updateMock: MockedResponse = {
      request: { query: UPDATE_ARTIST_PROFILE, variables: { artistId: 'a1', input: { instagram: 'https://evil.example' } } },
      result: { errors: [new GraphQLError('Instagram must be a link to instagram.com.')] },
    };
    renderDashboard([dashboardMock(artist), logMock(), updateMock]);

    const instagram = await screen.findByLabelText('Instagram');
    await userEvent.clear(instagram);
    await userEvent.type(instagram, 'https://evil.example');
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Instagram must be a link to instagram.com.');
  });
});
