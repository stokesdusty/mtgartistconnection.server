import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Calendar from './Calendar';
import { renderWithProviders } from '../../test-utils';
import {
  GET_SIGNINGEVENTS,
  GET_ARTISTS_BY_EVENT_IDS,
  GET_ARTISTSBYEVENTID,
  GET_MY_CARD_COLLECTION,
} from '../graphql/queries';

const events = [
  { id: 'e1', name: 'Spring Con', city: 'Portland, OR', startDate: '2099-03-10T12:00:00', endDate: '2099-03-12T12:00:00', url: null },
  { id: 'e2', name: 'Late March Expo', city: 'Toronto, ON', startDate: '2099-03-20T12:00:00', endDate: '2099-03-20T12:00:00', url: null },
  { id: 'e3', name: 'April Show', city: 'Austin, TX', startDate: '2099-04-05T12:00:00', endDate: '2099-04-06T12:00:00', url: null },
];

const eventArtists: Record<string, string[]> = {
  e1: ['Rebecca Guay', 'Seb McKinnon', 'John Avon', 'Terese Nielsen', 'Mark Poole'],
  e2: ['John Avon'],
  e3: [],
};

const baseMocks = [
  { request: { query: GET_SIGNINGEVENTS }, result: { data: { signingEvent: events } } },
  {
    request: { query: GET_ARTISTS_BY_EVENT_IDS, variables: { eventIds: ['e1', 'e2', 'e3'] } },
    result: {
      data: {
        artistsByEventIds: Object.entries(eventArtists).flatMap(([eventId, names]) =>
          names.map(artistName => ({ eventId, artistName })),
        ),
      },
    },
  },
  ...Object.entries(eventArtists).map(([eventId, names]) => ({
    request: { query: GET_ARTISTSBYEVENTID, variables: { eventId } },
    result: { data: { mapArtistToEventByEventId: names.map(artistName => ({ artistName })) } },
  })),
];

const loggedOut = { auth: { isLoggedIn: false, token: null, refreshToken: null, user: null } };
const loggedIn = { auth: { isLoggedIn: true, token: 't', refreshToken: 'r', user: null } };

const card = (id: string, artistName: string, wishlistSigned: boolean) => ({
  id, scryfallId: id, cardName: id, artistName, set: 'lea', collectorNumber: '1',
  signedNonfoil: false, signedFoil: false, wishlistSigned, artistProof: false, artistProofFoil: false,
});

describe('Calendar', () => {
  it('groups upcoming events by month and links each row to its event page', async () => {
    renderWithProviders(<Calendar />, { route: '/calendar', path: '/calendar', mocks: baseMocks, preloadedState: loggedOut });

    const march = await screen.findByRole('region', { name: /March 2099/ });
    expect(within(march).getByText('2 events')).toBeInTheDocument();
    expect(within(march).getByRole('link', { name: /Spring Con/ })).toHaveAttribute('href', '/calendar/e1');

    const april = screen.getByRole('region', { name: /April 2099/ });
    expect(within(april).getByText('1 event')).toBeInTheDocument();
    expect(screen.getByText('3 upcoming events')).toBeInTheDocument();

    // Three initials plus an overflow bubble, and the full count
    expect(await screen.findByText('5 artists')).toBeInTheDocument();
    const springRow = within(march).getByRole('link', { name: /Spring Con/ });
    expect(within(springRow).getByText('+2')).toBeInTheDocument();
    expect(within(springRow).getByText('RG')).toBeInTheDocument();
    expect(screen.getByText('1 artist')).toBeInTheDocument();
  });

  it('hides the wishlist switch when logged out', async () => {
    renderWithProviders(<Calendar />, { route: '/calendar', path: '/calendar', mocks: baseMocks, preloadedState: loggedOut });

    await screen.findByText('Spring Con');
    expect(screen.queryByLabelText('My wishlist only')).not.toBeInTheDocument();
  });

  it('filters to events with wishlisted artists when the switch is on', async () => {
    const mocks = [
      ...baseMocks,
      {
        request: { query: GET_MY_CARD_COLLECTION },
        result: {
          data: {
            myCardCollection: [card('c1', 'Mark Poole', true), card('c2', 'John Avon', false)],
          },
        },
      },
    ];
    renderWithProviders(<Calendar />, { route: '/calendar', path: '/calendar', mocks, preloadedState: loggedIn });

    const chip = await screen.findByTitle('Wishlisted cards from artists at this event');
    expect(chip).toHaveTextContent('1 wishlisted');

    userEvent.click(screen.getByLabelText('My wishlist only'));

    await waitFor(() => expect(screen.queryByText('Late March Expo')).not.toBeInTheDocument());
    expect(screen.getByText('Spring Con')).toBeInTheDocument();
    expect(screen.queryByText('April Show')).not.toBeInTheDocument();
    expect(screen.getByText('Showing 1 of 3 upcoming events')).toBeInTheDocument();
  });
});
