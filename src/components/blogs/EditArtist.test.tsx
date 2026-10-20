import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { GraphQLError } from 'graphql';
import EditArtist from './EditArtist';
import authReducer from '../../store/auth-slice';
import { GET_ARTIST_BY_ID } from '../graphql/queries';
import { UPDATE_ARTIST_BULK } from '../graphql/mutations';

const admin = { id: 'u1', email: 'admin@example.com', name: 'Admin', role: 'admin' };
const authState = (user: typeof admin | null) => ({ auth: { isLoggedIn: !!user, token: user && 'token', refreshToken: user && 'refresh', user } });

const artist = {
  id: 'a1',
  name: 'Rebecca Guay',
  email: 'rebecca@example.com',
  artistProofs: 'yes',
  facebook: '',
  instagram: 'https://instagram.com/rebecca',
  twitter: '',
  patreon: '',
  youtube: '',
  artstation: '',
  bluesky: '',
  signing: 'unknown',
  signingComment: 'Signs at most cons.',
  haveSignature: 'true',
  url: 'https://rebeccaguay.com',
  location: 'Massachusetts',
  filename: 'rebeccaguay',
  mountainmage: '',
  markssignatureservice: 'false',
  omalink: '',
  inprnt: '',
  scryfall_name: 'Rebecca Guay',
  signatureExamples: [{ id: 'e1', imageUrl: 'https://cdn.test/1.jpg', label: 'Regular' }],
};

const artistMock: MockedResponse = {
  request: { query: GET_ARTIST_BY_ID, variables: { id: 'a1' } },
  result: { data: { artistById: artist } },
};

const savedVariables = {
  id: 'a1',
  name: artist.name,
  email: artist.email,
  filename: artist.filename,
  facebook: '',
  instagram: artist.instagram,
  patreon: '',
  twitter: '',
  youtube: '',
  artstation: '',
  mountainmage: '',
  url: artist.url,
  location: 'Western Massachusetts',
  signingComment: artist.signingComment,
  bluesky: '',
  omalink: '',
  inprnt: '',
  scryfall_name: artist.scryfall_name,
  artistProofs: 'true',
  haveSignature: 'true',
  signing: 'false',
  markssignatureservice: 'false',
};

function renderPage(mocks: MockedResponse[], user: typeof admin | null = admin) {
  const store = configureStore({ reducer: { auth: authReducer }, preloadedState: authState(user) });
  return render(
    <Provider store={store}>
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter initialEntries={['/editartist/a1']}>
          <Routes>
            <Route path="/editartist/:artistId" element={<EditArtist />} />
            <Route path="/" element={<div>Home page</div>} />
            <Route path="/artist/:name" element={<div>Artist page</div>} />
          </Routes>
        </MemoryRouter>
      </MockedProvider>
    </Provider>,
  );
}

const editLocation = async () => {
  const location = await screen.findByLabelText('Location');
  await userEvent.clear(location);
  await userEvent.type(location, 'Western Massachusetts');
};

describe('EditArtist', () => {
  it('sends non-admins home', () => {
    renderPage([], { ...admin, role: 'user' });
    expect(screen.getByText('Home page')).toBeInTheDocument();
  });

  it('fills the form from the artist, normalising legacy yes/no values', async () => {
    renderPage([artistMock]);

    expect(await screen.findByLabelText('Artist name')).toHaveValue('Rebecca Guay');
    expect(screen.getByLabelText('Signing comment')).toHaveValue('Signs at most cons.');
    const proofs = screen.getByRole('radiogroup', { name: 'Artist proofs available' });
    expect(within(proofs).getByRole('radio', { name: 'Yes' })).toHaveAttribute('aria-checked', 'true');
    const signing = screen.getByRole('radiogroup', { name: 'Offers signing services' });
    expect(within(signing).getByRole('radio', { name: 'No' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('link', { name: 'View artist page →' })).toHaveAttribute('href', '/artist/Rebecca%20Guay');
  });

  it('saves the edited values and shows a confirmation', async () => {
    const updateMock: MockedResponse = {
      request: { query: UPDATE_ARTIST_BULK, variables: savedVariables },
      result: { data: { updateArtistBulk: { id: 'a1', name: artist.name } } },
    };
    renderPage([artistMock, updateMock]);

    await editLocation();
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Saved.');
  });

  it('shows the API error when a save is rejected', async () => {
    const updateMock: MockedResponse = {
      request: { query: UPDATE_ARTIST_BULK, variables: savedVariables },
      result: { errors: [new GraphQLError('Not authorized')] },
    };
    renderPage([artistMock, updateMock]);

    await editLocation();
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Not authorized');
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeEnabled();
  });

  it('does not submit the profile when Enter is pressed in a signature label', async () => {
    // No update mock: a submit would surface a "no more mocked responses" error.
    renderPage([artistMock]);

    const label = await screen.findByRole('textbox', { name: 'Label for Regular' });
    await userEvent.type(label, '{Enter}');

    expect(screen.getByRole('button', { name: 'Save changes' })).toBeEnabled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
