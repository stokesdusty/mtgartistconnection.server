import { screen, waitFor, fireEvent, within } from '@testing-library/react';
import axios from 'axios';
import Homepage from './Homepage';
import { renderWithProviders } from '../../test-utils';
import {
  GET_ARTISTS_PAGE,
  GET_ARTIST_FILTER_FLAGS,
  GET_SIGNINGEVENTS,
  GET_ARTISTS_BY_EVENT_IDS,
  GET_ARTISTS_BY_SET,
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

describe('Homepage vault layout', () => {
  const DAY = 24 * 60 * 60 * 1000;
  const iso = (offsetDays: number) => new Date(Date.now() + offsetDays * DAY).toISOString();

  const makeMocks = () => [
    {
      request: { query: GET_ARTISTS_PAGE, variables: { offset: 0, limit: 60 } },
      result: {
        data: {
          artistsPage: {
            artists: [
              { name: 'Alice Artist', filename: 'alice' },
              { name: 'Bob Artist', filename: 'bob' },
              { name: 'Cara Artist', filename: 'cara' },
            ],
            total: 3,
          },
        },
      },
    },
    {
      request: { query: GET_ARTIST_FILTER_FLAGS },
      result: {
        data: {
          artistFilterFlags: [
            { name: 'Alice Artist', flags: 0, location: 'Seattle, US', alternate_names: null, filename: 'alice' },
            { name: 'Bob Artist', flags: 0, location: null, alternate_names: null, filename: 'bob' },
            { name: 'Cara Artist', flags: 0, location: null, alternate_names: null, filename: 'cara' },
          ],
        },
      },
    },
    {
      request: { query: GET_SIGNINGEVENTS },
      result: {
        data: {
          signingEvent: [
            { id: 'soon', name: 'IX Art Show', city: 'Reading', startDate: iso(5), endDate: iso(7), url: null },
            { id: 'later', name: 'Far Con', city: 'Austin', startDate: iso(60), endDate: iso(62), url: null },
          ],
        },
      },
    },
    {
      request: { query: GET_ARTISTS_BY_EVENT_IDS, variables: { eventIds: ['soon', 'later'] } },
      result: {
        data: {
          artistsByEventIds: [
            { eventId: 'soon', artistName: 'Alice Artist' },
            { eventId: 'later', artistName: 'Bob Artist' },
          ],
        },
      },
    },
  ];

  beforeEach(() => {
    (axios.get as jest.Mock).mockResolvedValue({ data: { data: [] } });
  });

  it('shows the location and a signing badge only for events within 30 days', async () => {
    renderWithProviders(<Homepage />, { mocks: makeMocks() });

    expect(await screen.findByText(/IX Art Show/)).toBeInTheDocument();
    expect(screen.getByText('Seattle, US')).toBeInTheDocument();
    expect(screen.queryByText(/Far Con/)).toBeNull();
  });

  it('"Signing soon" filters to artists with any upcoming event', async () => {
    renderWithProviders(<Homepage />, { mocks: makeMocks() });
    await screen.findByText(/IX Art Show/);

    const signingSoon = screen.getAllByRole('button', { name: 'Signing soon' })[0];
    fireEvent.click(signingSoon);

    await waitFor(() => expect(screen.queryByText('Cara Artist')).toBeNull());
    expect(screen.getByText('Alice Artist')).toBeInTheDocument();
    expect(screen.getByText('Bob Artist')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Signing soon' })[0]).toHaveAttribute('aria-pressed', 'true');
  });

  it('letter rail toggles the letter filter', async () => {
    renderWithProviders(<Homepage />, { mocks: makeMocks() });
    // Location comes from the flags query — wait so filtering runs on real flags
    await screen.findByText('Seattle, US');

    const rail = screen.getByRole('navigation', { name: 'Filter by first letter' });
    const letterB = within(rail).getByRole('button', { name: 'B' });
    fireEvent.click(letterB);

    await waitFor(() => expect(screen.queryByText('Alice Artist')).toBeNull());
    expect(screen.getByText('Bob Artist')).toBeInTheDocument();
    expect(letterB).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(letterB);
    expect(await screen.findByText('Alice Artist')).toBeInTheDocument();
  });

  it('"/" focuses the search box, but not while typing elsewhere', async () => {
    renderWithProviders(<Homepage />, { mocks: makeMocks() });
    const search = await screen.findByRole('searchbox', { name: 'Search artists' });

    fireEvent.keyDown(window, { key: '/' });
    expect(search).toHaveFocus();

    fireEvent.change(search, { target: { value: 'a/' } });
    expect(search).toHaveValue('a/');
  });

  const setMock = (code: string, artistsBySet: string[] | null) => ({
    request: { query: GET_ARTISTS_BY_SET, variables: { code } },
    result: { data: { artistsBySet } },
  });

  it('set filter shows only the artists the server lists for that set', async () => {
    renderWithProviders(<Homepage />, {
      mocks: [...makeMocks(), setMock('hob', ['Bob Artist', 'Cara Artist'])],
      route: '/?set=hob',
    });

    expect(await screen.findByText('Bob Artist')).toBeInTheDocument();
    expect(screen.getByText('Cara Artist')).toBeInTheDocument();
    expect(screen.queryByText('Alice Artist')).toBeNull();
  });

  it('explains when a set has not been indexed yet', async () => {
    renderWithProviders(<Homepage />, {
      mocks: [...makeMocks(), setMock('new', null)],
      route: '/?set=new',
    });

    expect(await screen.findByText("This set hasn't been indexed yet")).toBeInTheDocument();
    expect(screen.queryByText('No artists match your search')).toBeNull();
  });
});
