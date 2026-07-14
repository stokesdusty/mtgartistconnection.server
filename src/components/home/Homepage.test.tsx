import { screen, waitFor, fireEvent } from '@testing-library/react';
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
              { name: 'Test Artist', flags: 0, location: null, alternate_names: null, filename: 'test-artist' },
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

  it('renders search matches from the flags index even when the matching artist has not been paginated in yet', async () => {
    // Alice is the only artist in the loaded artistsPage batch; Zoe only exists
    // in the flags index (as if she sorts later in the alphabet and hasn't been
    // paginated in via infinite scroll). Search should still find her instantly,
    // with no second artistsPage request required.
    const mocks = [
      {
        request: { query: GET_ARTISTS_PAGE, variables: { offset: 0, limit: 60 } },
        result: {
          data: {
            artistsPage: {
              artists: [{ name: 'Alice Artist', filename: 'alice' }],
              total: 2,
            },
          },
        },
      },
      {
        request: { query: GET_ARTIST_FILTER_FLAGS },
        result: {
          data: {
            artistFilterFlags: [
              { name: 'Alice Artist', flags: 0, location: null, alternate_names: null, filename: 'alice' },
              { name: 'Zoe Artist', flags: 0, location: null, alternate_names: null, filename: 'zoe' },
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

    await waitFor(() => {
      expect(screen.getByText('Alice Artist')).toBeInTheDocument();
    });

    const [searchInput] = screen.getAllByPlaceholderText('Search for an artist');
    fireEvent.change(searchInput, { target: { value: 'zoe' } });

    await waitFor(() => {
      expect(screen.getByText('Zoe Artist')).toBeInTheDocument();
    }, { timeout: 2000 });
  });
});
