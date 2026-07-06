import { screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import Homepage from './Homepage';
import { renderWithProviders } from '../../test-utils';
import {
  GET_ARTISTS_PAGE,
  GET_ARTIST_FILTER_FLAGS,
  GET_SIGNINGEVENTS,
} from '../graphql/queries';

jest.mock('axios');

describe('Homepage', () => {
  beforeEach(() => {
    (axios.get as jest.Mock).mockResolvedValue({ data: { data: [] } });
  });

  it('renders without crashing and shows loaded artists', async () => {
    const mocks = [
      {
        request: { query: GET_ARTISTS_PAGE, variables: { offset: 0, limit: 60 } },
        result: {
          data: {
            artistsPage: {
              artists: [{ name: 'Test Artist', filename: 'test-artist' }],
              total: 1,
            },
          },
        },
      },
      {
        request: { query: GET_ARTIST_FILTER_FLAGS },
        result: {
          data: {
            artistFilterFlags: [
              { name: 'Test Artist', flags: 0, location: null, alternate_names: null },
            ],
          },
        },
      },
      {
        request: { query: GET_SIGNINGEVENTS },
        result: { data: { signingEvent: [] } },
      },
    ];

    renderWithProviders(<Homepage />, { mocks });

    expect(screen.getByText(/Loading artists/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Test Artist')).toBeInTheDocument();
    });
  });
});
