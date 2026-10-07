import { fireEvent, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import AllCards from './AllCards';
import { renderWithProviders } from '../../test-utils';
import {
  GET_ARTIST_BY_NAME,
  GET_CARD_PRICES,
  GET_CARDKINGDOM_PRICES_BY_SCRYFALL_IDS,
  GET_USER_CARD_COLLECTION,
} from '../graphql/queries';

jest.mock('axios');

const loggedOut = { auth: { isLoggedIn: false, token: null, refreshToken: null, user: null } };
const loggedIn = { auth: { isLoggedIn: true, token: 't', refreshToken: 'r', user: null } };

describe('AllCards', () => {
  const card = {
    id: 'card-1',
    name: 'Test Card',
    artist: 'Test Artist',
    set: 'tst',
    collector_number: '1',
    scryfall_uri: 'https://scryfall.com/test',
    related_uris: {},
    prices: { usd: null },
    image_uris: { border_crop: 'https://img.test/card.jpg' },
  };

  const mocks = [
    {
      request: { query: GET_ARTIST_BY_NAME, variables: { name: 'Test Artist' } },
      result: {
        data: {
          artistByName: {
            id: '1',
            name: 'Test Artist',
            alternate_names: null,
            scryfall_name: null,
            email: null,
            artistProofs: null,
            facebook: null,
            haveSignature: 'false',
            instagram: null,
            signing: null,
            patreon: null,
            signingComment: null,
            twitter: null,
            url: null,
            youtube: null,
            mountainmage: null,
            markssignatureservice: null,
            filename: 'test-artist',
            artstation: null,
            location: null,
            bluesky: null,
            omalink: null,
            inprnt: null,
          },
        },
      },
    },
    {
      request: {
        query: GET_CARD_PRICES,
        variables: { cards: [{ set_code: 'TST', number: '1' }] },
      },
      result: { data: { cardPricesByCards: [] } },
    },
    {
      request: {
        query: GET_CARDKINGDOM_PRICES_BY_SCRYFALL_IDS,
        variables: { scryfallIds: ['card-1'] },
      },
      result: { data: { cardKingdomPricesByScryfallIds: [] } },
    },
    {
      request: { query: GET_USER_CARD_COLLECTION, variables: { scryfallIds: ['card-1'] } },
      result: { data: { userCardCollection: [] } },
    },
  ];

  const renderPage = (preloadedState: Record<string, unknown>) =>
    renderWithProviders(<AllCards />, {
      mocks,
      route: '/allcards/Test%20Artist',
      path: '/allcards/:name',
      preloadedState,
    });

  beforeEach(() => {
    (axios.get as jest.Mock).mockResolvedValue({
      data: { data: [card], has_more: false, next_page: undefined, total_cards: 1 },
    });
  });

  it('renders the header, count and fetched cards', async () => {
    renderPage(loggedOut);

    expect(await screen.findByText('Test Card')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('All cards 1');
    expect(screen.getByText('TST · #1')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /test artist/i })).toHaveAttribute('href', '/artist/Test%20Artist');
    expect(screen.getByRole('link', { name: /test card on scryfall/i })).toHaveAttribute('href', 'https://scryfall.com/test');
  });

  it('shows collection filters only when logged in', async () => {
    renderPage(loggedOut);
    await screen.findByText('Test Card');
    expect(screen.queryByRole('button', { name: 'Signed' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /log in to track/i })).toBeInTheDocument();
  });

  it('filters by collection from the rail', async () => {
    renderPage(loggedIn);
    await screen.findByText('Test Card');
    expect(screen.getByText(/your collection:/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Missing' })).not.toBeInTheDocument();

    const signed = screen.getByRole('button', { name: 'Signed' });
    fireEvent.click(signed);
    await waitFor(() => expect(signed).toHaveAttribute('aria-pressed', 'true'));
    // Nothing is signed yet, so the filter empties the grid.
    expect(await screen.findByText('No cards match this filter.')).toBeInTheDocument();
  });
});
