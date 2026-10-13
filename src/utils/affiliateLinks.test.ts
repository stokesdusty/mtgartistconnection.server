import {
  cardKingdomUrl,
  ebaySearchUrl,
  expediaHotelSearchUrl,
  manapoolUrl,
  tcgplayerMassEntryUrl,
  tcgplayerProductUrl,
  tcgplayerSearchUrl,
} from './affiliateLinks';

const partnerTarget = (url: string) => {
  const parsed = new URL(url);
  expect(parsed.origin + parsed.pathname).toBe('https://partner.tcgplayer.com/JkbQGE');
  return { subId: parsed.searchParams.get('subId1'), target: parsed.searchParams.get('u')! };
};

describe('affiliateLinks', () => {
  it('builds Manapool card links with our ref and placement', () => {
    const url = new URL(manapoolUrl('lea', '232', "Gaea's Liege", 'event'));
    expect(url.pathname).toBe("/card/lea/232/gaea's-liege");
    expect(url.searchParams.get('ref')).toBe('mtgartistconnection');
    expect(url.searchParams.get('utm_content')).toBe('event');
  });

  it('wraps TCGplayer product and search pages in the partner link', () => {
    expect(partnerTarget(tcgplayerProductUrl(1234, 'allcards'))).toEqual({
      subId: 'allcards',
      target: 'https://www.tcgplayer.com/product/1234',
    });
    const { target } = partnerTarget(tcgplayerSearchUrl('Fire // Ice', 'wishlist'));
    expect(new URL(target).searchParams.get('q')).toBe('Fire // Ice');
  });

  it('pins each Mass Entry line to the exact printing', () => {
    const { subId, target } = partnerTarget(tcgplayerMassEntryUrl([
      { name: 'Lightning Bolt', set: 'sld', collectorNumber: '84' },
      { name: 'Counterspell', set: 'lea', collectorNumber: '54' },
      { name: 'Lightning Bolt', set: 'sld', collectorNumber: '84' },
    ], 'event'));
    expect(subId).toBe('event');
    const massEntry = new URL(target);
    expect(massEntry.pathname).toBe('/massentry');
    expect(massEntry.searchParams.get('productline')).toBe('Magic');
    expect(massEntry.searchParams.get('c')).toBe('1 Lightning Bolt [SLD] 84||1 Counterspell [LEA] 54');
  });

  it('keeps different printings of one card and degrades without set or number', () => {
    const { target } = partnerTarget(tcgplayerMassEntryUrl([
      { name: 'Lightning Bolt', set: 'lea', collectorNumber: '161' },
      { name: 'Lightning Bolt', set: 'm10', collectorNumber: '146' },
      { name: 'Counterspell', set: 'lea' },
      { name: 'Dark Ritual' },
    ], 'wishlist'));
    expect(new URL(target).searchParams.get('c'))
      .toBe('1 Lightning Bolt [LEA] 161||1 Lightning Bolt [M10] 146||1 Counterspell [LEA]||1 Dark Ritual');
  });

  it("prefers TCGplayer's own naming, which Mass Entry matches on", () => {
    const { target } = partnerTarget(tcgplayerMassEntryUrl([
      {
        name: 'Zimone, Infinite Analyst', set: 'soc', collectorNumber: '10',
        tcgplayer: { productId: 686633, name: 'Zimone, Infinite Analyst (Borderless)', setCode: 'SOC', number: '10' },
      },
      {
        name: 'Aang, Air Nomad', set: 'pmei', collectorNumber: '2025-25',
        tcgplayer: { productId: 5, name: 'Aang, Air Nomad', setCode: 'MEDIA', number: null },
      },
    ], 'event'));
    expect(new URL(target).searchParams.get('c'))
      .toBe('1 Zimone, Infinite Analyst (Borderless) [SOC] 10||1 Aang, Air Nomad [MEDIA]');
  });

  it('names double-faced cards by their front face when falling back to Scryfall naming', () => {
    const { target } = partnerTarget(tcgplayerMassEntryUrl([
      { name: 'Delver of Secrets // Insectile Aberration', set: 'isd', collectorNumber: '51' },
    ], 'event'));
    expect(new URL(target).searchParams.get('c')).toBe('1 Delver of Secrets [ISD] 51');
  });

  it('adds partner params to Card Kingdom links, falling back to the name slug', () => {
    const listing = new URL(cardKingdomUrl('https://www.cardkingdom.com/mtg/alpha/lightning-bolt', 'Lightning Bolt', 'event'));
    expect(listing.searchParams.get('partner')).toBe('mtgartistconnection');
    expect(listing.searchParams.get('utm_content')).toBe('event');

    expect(cardKingdomUrl(undefined, 'Lightning Bolt', 'allcards'))
      .toMatch(/^https:\/\/www\.cardkingdom\.com\/mtg\/lightning-bolt\?partner=mtgartistconnection&/);
    // A listing URL that already has a query string gets "&", not a second "?".
    expect(cardKingdomUrl('https://ck.test/x?foil=1', 'X', 'allcards')).toMatch(/\?foil=1&partner=/);
  });

  it('builds eBay searches with our campaign and the placement as customid', () => {
    const url = new URL(ebaySearchUrl('Rebecca Guay signed mtg', 'artist_page'));
    expect(url.searchParams.get('_nkw')).toBe('Rebecca Guay signed mtg');
    expect(url.searchParams.get('campid')).toBe('5339140903');
    expect(url.searchParams.get('customid')).toBe('artist_page');
  });

  it('builds Expedia hotel searches, wrapped in the affiliate link once configured', () => {
    const checkIn = new Date(2026, 9, 21);
    const checkOut = new Date(2026, 9, 25);
    const direct = new URL(expediaHotelSearchUrl('Reading, PA', checkIn, checkOut, { camref: '' }));
    expect(direct.origin + direct.pathname).toBe('https://www.expedia.com/Hotel-Search');
    expect(direct.searchParams.get('destination')).toBe('Reading, PA');
    expect(direct.searchParams.get('startDate')).toBe('2026-10-21');
    expect(direct.searchParams.get('endDate')).toBe('2026-10-25');

    const wrapped = new URL(expediaHotelSearchUrl('Reading, PA', checkIn, checkOut, { camref: 'abc', creativeref: 'xyz' }));
    expect(wrapped.origin + wrapped.pathname).toBe('https://expedia.com/affiliate');
    expect(wrapped.searchParams.get('camref')).toBe('abc');
    expect(wrapped.searchParams.get('creativeref')).toBe('xyz');
    expect(wrapped.searchParams.get('landingPage')).toBe(direct.toString());
  });

  it('matches the link Expedia\'s Link Builder generates for our account', () => {
    expect(expediaHotelSearchUrl('Sacramento, CA', new Date(2026, 9, 23), new Date(2026, 9, 26))).toBe(
      'https://expedia.com/affiliate?siteid=1&landingPage=https%3A%2F%2Fwww.expedia.com%2FHotel-Search%3Fdestination%3DSacramento%252C%2520CA%26startDate%3D2026-10-23%26endDate%3D2026-10-26%26rooms%3D1%26adults%3D2&camref=1011l6u9xH&creativeref=1100l68075&adref=PZ1pKCgN5d',
    );
  });
});
