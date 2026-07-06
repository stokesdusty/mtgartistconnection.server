import { screen, waitFor } from '@testing-library/react';
import Artist from './Artist';
import { renderWithProviders } from '../../test-utils';
import {
  GET_ARTIST_BY_NAME,
  GET_SIGNINGEVENTS,
  GET_NEWS_REVIEWS,
} from '../graphql/queries';

describe('Artist', () => {
  it('renders without crashing and shows the artist name', async () => {
    const artistByName = {
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
    };

    const mocks = [
      {
        request: { query: GET_ARTIST_BY_NAME, variables: { name: 'Test Artist' } },
        result: { data: { artistByName } },
      },
      {
        request: { query: GET_SIGNINGEVENTS },
        result: { data: { signingEvent: [] } },
      },
      {
        request: {
          query: GET_NEWS_REVIEWS,
          variables: { isPublished: true, limit: 100 },
        },
        result: { data: { newsReviews: [] } },
      },
    ];

    renderWithProviders(<Artist />, {
      mocks,
      route: '/artist/Test%20Artist',
      path: '/artist/:name',
    });

    await waitFor(() => {
      expect(screen.getAllByText('Test Artist').length).toBeGreaterThan(0);
    });
  });
});
