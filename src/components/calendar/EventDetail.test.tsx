import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { MockedResponse } from '@apollo/client/testing';
import EventDetail from './EventDetail';
import { scryfallTopCardsUrl } from './EventShopSection';
import { renderWithProviders } from '../../test-utils';
import {
  GET_SIGNINGEVENTS,
  GET_ARTISTSBYEVENTID,
  GET_ARTIST_NAMES,
  GET_CARD_PRICES,
  GET_CARDKINGDOM_PRICES_BY_SCRYFALL_IDS,
  GET_TCGPLAYER_PRODUCTS,
} from '../graphql/queries';

jest.mock('axios');

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

const scryfallCard = (id: string, name: string, tcgplayerId?: number, usd: string | null = '4.50') => ({
  id, name, set: 'lea', collector_number: id, tcgplayer_id: tcgplayerId,
  prices: { usd },
  image_uris: { normal: `https://img.test/${id}.jpg` },
});

const cardsByArtist: Record<string, ReturnType<typeof scryfallCard>[]> = {
  'Rebecca Guay': [
    scryfallCard('1', 'Gaea\'s Liege', 99),
    // A promo-only printing with no price: not buyable, so it's left out.
    scryfallCard('9', 'Path to Exile', 38436, null),
    scryfallCard('2', 'Enchantress\'s Presence'),
  ],
  'Seb McKinnon': [scryfallCard('3', 'Bitterblossom')],
};

// The shop only asks for prices of the cards it shows (the buyable ones).
const priceMocks: MockedResponse[] = Object.values(cardsByArtist).map((cards) => cards.filter((c) => c.prices.usd)).flatMap((cards) => [
  {
    request: {
      query: GET_CARD_PRICES,
      variables: { cards: cards.map((c) => ({ set_code: 'LEA', number: c.collector_number })) },
    },
    result: {
      data: {
        cardPricesByCards: [{
          id: `mp-${cards[0].id}`, name: cards[0].name, set_code: 'LEA', number: cards[0].collector_number,
          price_cents_nm: 1234, price_cents_lp_plus: null, price_cents: null, price_cents_foil: null, url: 'https://manapool.test',
        }],
      },
    },
  },
  {
    request: { query: GET_CARDKINGDOM_PRICES_BY_SCRYFALL_IDS, variables: { scryfallIds: cards.map((c) => c.id) } },
    result: { data: { cardKingdomPricesByScryfallIds: [] } },
  },
]);

// Only Gaea's Liege has a TCGplayer ID; TCGplayer names that printing differently from Scryfall.
priceMocks.push({
  request: { query: GET_TCGPLAYER_PRODUCTS, variables: { ids: [99] } },
  result: { data: { tcgplayerProducts: [{ productId: 99, name: "Gaea's Liege (Retro Frame)", setCode: 'LEA', number: '1' }] } },
});

beforeEach(() => {
  (axios.get as jest.Mock).mockImplementation(async (url: string) => {
    const artist = Object.keys(cardsByArtist).find((name) => url === scryfallTopCardsUrl(name));
    // Artists without fixtures have no cards, like Scryfall's 404.
    if (!artist) throw new Error(`No cards: ${url}`);
    return { data: { data: cardsByArtist[artist] } };
  });
});

const renderPage = (route = '/calendar/e1', extraMocks = [...mocks, ...priceMocks]) =>
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

  it('suggests cards to bring with affiliate prices, per artist', async () => {
    renderPage();

    // The shop sits in a tab next to the artists, and doesn't load anything until opened.
    await screen.findByRole('region', { name: 'Artists attending' });
    expect(screen.queryByRole('region', { name: 'Bring cards to get signed' })).not.toBeInTheDocument();
    expect(axios.get).not.toHaveBeenCalled();
    await userEvent.click(await screen.findByRole('radio', { name: 'Bring cards to sign' }));
    expect(screen.queryByRole('region', { name: 'Artists attending' })).not.toBeInTheDocument();

    const section = await screen.findByRole('region', { name: 'Bring cards to get signed' });
    // First artist A–Z is preselected.
    expect(within(section).getByRole('button', { name: 'Rebecca Guay' })).toHaveAttribute('aria-pressed', 'true');
    expect(await within(section).findByText("Gaea's Liege")).toBeInTheDocument();
    expect(within(section).queryByText('Path to Exile')).not.toBeInTheDocument();

    const manapool = await within(section).findByRole('link', { name: 'Buy on Manapool: $12.34' });
    expect(manapool.getAttribute('href')).toContain('utm_content=event');
    expect(within(section).getByRole('link', { name: 'Buy on TCGplayer: $4.50' }).getAttribute('href')).toContain('subId1=event');
    const buyAll = within(section).getByRole('link', { name: /Buy all 2 on TCGplayer/ });
    const massEntry = new URL(new URL(buyAll.getAttribute('href')!).searchParams.get('u')!);
    // Pinned to the artist's own printings, not just the card names.
    expect(massEntry.searchParams.get('c')).toBe("1 Gaea's Liege [LEA] 1||1 Enchantress's Presence [LEA] 2");
    // Once TCGplayer's naming loads it replaces Scryfall's; cards without a TCGplayer ID keep the fallback.
    await waitFor(() => {
      const href = within(section).getByRole('link', { name: /Buy all 2 on TCGplayer/ }).getAttribute('href')!;
      expect(new URL(new URL(href).searchParams.get('u')!).searchParams.get('c'))
        .toBe("1 Gaea's Liege (Retro Frame) [LEA] 1||1 Enchantress's Presence [LEA] 2");
    });
    expect(within(section).getByRole('link', { name: /Already-signed Rebecca Guay cards on eBay/ }).getAttribute('href'))
      .toContain('customid=event');

    await userEvent.click(within(section).getByRole('button', { name: 'Seb McKinnon' }));
    expect(await within(section).findByText('Bitterblossom')).toBeInTheDocument();
    expect(within(section).queryByText("Gaea's Liege")).not.toBeInTheDocument();
    // A single card has nothing to bundle.
    expect(within(section).queryByRole('link', { name: /Buy all/ })).not.toBeInTheDocument();

    // Switching tabs keeps the chosen artist and loaded cards instead of starting over.
    await userEvent.click(screen.getByRole('radio', { name: 'Artists · 2' }));
    expect(await screen.findByRole('region', { name: 'Artists attending' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('radio', { name: 'Bring cards to sign' }));
    const reopened = await screen.findByRole('region', { name: 'Bring cards to get signed' });
    expect(within(reopened).getByRole('button', { name: 'Seb McKinnon' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(reopened).getByText('Bitterblossom')).toBeInTheDocument();
    expect(axios.get).toHaveBeenCalledTimes(2);
  });

  it("asks Scryfall for each card's cheapest priced printing by the artist", () => {
    const query = new URL(scryfallTopCardsUrl('Alan Pollack')).searchParams.get('q');
    expect(query).toBe('game:paper artist:"Alan Pollack" usd>0 prefer:usd-low');
  });

  it('opens straight to the shopping tab from a ?tab=cards link', async () => {
    renderPage('/calendar/e1?tab=cards');

    const section = await screen.findByRole('region', { name: 'Bring cards to get signed' });
    expect(await within(section).findByText("Gaea's Liege")).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Bring cards to sign' })).toHaveAttribute('aria-checked', 'true');
  });

  it('uses a searchable artist picker instead of chips for big shows', async () => {
    const names = ['Rebecca Guay', 'Seb McKinnon', ...Array.from({ length: 8 }, (_, i) => `Artist ${i + 1}`)];
    renderPage('/calendar/e1?tab=cards', [
      mocks[0],
      {
        request: { query: GET_ARTISTSBYEVENTID, variables: { eventId: 'e1' } },
        result: { data: { mapArtistToEventByEventId: names.map((artistName) => ({ artistName })) } },
      },
      {
        request: { query: GET_ARTIST_NAMES },
        result: { data: { artistNames: names.map((name) => ({ name, filename: null })) } },
      },
      ...priceMocks,
    ]);

    const section = await screen.findByRole('region', { name: 'Bring cards to get signed' });
    expect(within(section).queryByRole('group', { name: 'Choose an artist' })).not.toBeInTheDocument();
    const picker = within(section).getByRole('combobox', { name: 'Artist (10 attending)' });
    // A–Z, so "Artist 1" comes first.
    await waitFor(() => expect(picker).toHaveValue('Artist 1'));

    await userEvent.clear(picker);
    await userEvent.type(picker, 'Seb');
    await userEvent.click(await screen.findByRole('option', { name: 'Seb McKinnon' }));
    expect(await within(section).findByText('Bitterblossom')).toBeInTheDocument();
  });

  it('skips the shopping section for past events', async () => {
    const pastEvent = { ...event, startDate: '2001-10-21T12:00:00', endDate: '2001-10-24T12:00:00' };
    renderPage('/calendar/e1', [
      { request: { query: GET_SIGNINGEVENTS }, result: { data: { signingEvent: [pastEvent] } } },
      mocks[1],
      mocks[2],
    ]);

    await screen.findByRole('region', { name: 'Artists attending' });
    expect(await screen.findByText('2 confirmed')).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Bring cards to get signed' })).not.toBeInTheDocument();
    expect(screen.queryByRole('radiogroup', { name: 'Event sections' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Artists attending' })).toBeInTheDocument();
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
