import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EventDetail from './EventDetail';
import { renderWithProviders } from '../../test-utils';
import { GET_SIGNINGEVENTS, GET_ARTISTSBYEVENTID, GET_ARTIST_NAMES } from '../graphql/queries';

const event = {
  id: 'e1', name: 'IX Art Show', city: 'Reading, PA',
  startDate: '2099-10-21T12:00:00', endDate: '2099-10-24T12:00:00', url: 'https://example.com/ix',
};

const mocks = [
  { request: { query: GET_SIGNINGEVENTS }, result: { data: { signingEvent: [event] } } },
  {
    request: { query: GET_ARTISTSBYEVENTID, variables: { eventId: 'e1' } },
    result: { data: { mapArtistToEventByEventId: [{ artistName: 'Seb McKinnon' }, { artistName: 'Rebecca Guay' }] } },
  },
  {
    request: { query: GET_ARTIST_NAMES },
    result: { data: { artistNames: [{ name: 'Rebecca Guay', filename: 'rebecca-guay' }, { name: 'Seb McKinnon', filename: null }] } },
  },
];

const renderPage = (route = '/calendar/e1', extraMocks = mocks) =>
  renderWithProviders(<EventDetail />, { route, path: '/calendar/:eventId', mocks: extraMocks });

describe('EventDetail', () => {
  it('shows the hero, info panel and site link', async () => {
    renderPage();

    expect(await screen.findByRole('heading', { level: 1, name: 'IX Art Show' })).toBeInTheDocument();
    expect(screen.getByText('Oct 21–24, 2099')).toBeInTheDocument();
    expect(screen.getByText('Reading, PA')).toBeInTheDocument();
    expect(await screen.findByText('2 confirmed')).toBeInTheDocument();
    expect(screen.getByText(/^In \d+ days$/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Visit event site/ })).toHaveAttribute('href', event.url);
    expect(screen.getByRole('link', { name: /Signing calendar/ })).toHaveAttribute('href', '/calendar');
  });

  it('lists attending artists A–Z, linking to their all-cards pages', async () => {
    renderPage();

    const section = await screen.findByRole('region', { name: 'Artists attending' });
    const links = await within(section).findAllByRole('link');
    expect(links.map(l => l.textContent)).toEqual(['Rebecca Guay', 'Seb McKinnon']);
    expect(links[0]).toHaveAttribute('href', '/allcards/Rebecca%20Guay');
  });

  it('opens the add-to-calendar menu', async () => {
    renderPage();

    await userEvent.click(await screen.findByRole('button', { name: /Add to calendar/ }));
    const menu = screen.getByRole('menu');
    expect(within(menu).getByText('Google Calendar')).toBeInTheDocument();
    expect(within(menu).getByText('Outlook Calendar')).toBeInTheDocument();
    expect(within(menu).getByText('Apple/Other (.ics)')).toBeInTheDocument();
  });

  it('shows a not-found message with a way back', async () => {
    renderPage('/calendar/missing', [
      mocks[0],
      mocks[2],
      {
        request: { query: GET_ARTISTSBYEVENTID, variables: { eventId: 'missing' } },
        result: { data: { mapArtistToEventByEventId: [] } },
      },
    ]);

    expect(await screen.findByText('Event not found')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Signing calendar/ })).toHaveAttribute('href', '/calendar');
  });
});
