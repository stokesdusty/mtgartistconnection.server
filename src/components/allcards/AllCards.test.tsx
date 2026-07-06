import { screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import AllCards from './AllCards';
import { renderWithProviders } from '../../test-utils';
import {
  GET_ARTIST_BY_NAME,
  GET_CARD_PRICES,
  GET_CARDKINGDOM_PRICES_BY_SCRYFALL_IDS,
} from '../graphql/queries';

jest.mock('axios');

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

  beforeEach(() => {
    (axios.get as jest.Mock).mockResolvedValue({
      data: { data: [card], has_more: false, next_page: undefined, total_cards: 1 },
    });
  });

  it('renders without crashing and shows fetched cards', async () => {
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
    ];

    renderWithProviders(<AllCards />, {
      mocks,
      route: '/allcards/Test%20Artist',
      path: '/allcards/:name',
    });

    await waitFor(() => {
      expect(screen.getByText(/card.*found/i)).toBeInTheDocument();
    });
  });
});
