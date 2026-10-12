import { screen, waitFor, within } from '@testing-library/react';
import axios from 'axios';
import WishlistShop, { WishlistItem } from './WishlistShop';
import { renderWithProviders } from '../../test-utils';
import { GET_TCGPLAYER_PRODUCTS } from '../graphql/queries';

jest.mock('axios');

// The vendor URL wrapped inside our TCGplayer partner link.
const tcgTarget = (link: HTMLElement) => new URL(new URL(link.getAttribute('href')!).searchParams.get('u')!);

// s1 is priced with TCGplayer product 101, whose TCGplayer name carries a variant suffix.
const tcgplayerMocks = [{
  request: { query: GET_TCGPLAYER_PRODUCTS, variables: { ids: [101] } },
  result: { data: { tcgplayerProducts: [{ productId: 101, name: "Gaea's Liege (Borderless)", setCode: 'LEA', number: '232' }] } },
}];

const items: WishlistItem[] = [
  { scryfallId: 's1', cardName: "Gaea's Liege", artistName: 'Rebecca Guay', set: 'lea', collectorNumber: '232' },
  { scryfallId: 's2', cardName: 'Bitterblossom', artistName: 'Seb McKinnon', set: 'mor', collectorNumber: '58' },
];

describe('WishlistShop', () => {
  beforeEach(() => {
    (axios.post as jest.Mock).mockResolvedValue({
      data: {
        data: [
          { id: 's1', tcgplayer_id: 101, prices: { usd: '10.00' } },
          { id: 's2', prices: { usd: '2.50' } },
        ],
      },
    });
  });

  it('lists wishlist cards with TCGplayer prices and signed copies on eBay', async () => {
    renderWithProviders(<WishlistShop items={items} />, { mocks: tcgplayerMocks });

    const section = screen.getByRole('region', { name: 'Signing wishlist' });
    const rows = within(section).getAllByRole('listitem');
    expect(rows).toHaveLength(2);

    // Prices come from Scryfall; a card with no TCGplayer ID links to a search instead.
    const liege = await within(rows[0]).findByRole('link', { name: 'Buy on TCGplayer: $10.00' });
    expect(tcgTarget(liege).pathname).toBe('/product/101');
    const bitterblossom = await within(rows[1]).findByRole('link', { name: 'Buy on TCGplayer: $2.50' });
    expect(tcgTarget(bitterblossom).searchParams.get('q')).toBe('Bitterblossom');

    const ebay = within(rows[0]).getByRole('link', { name: 'Signed on eBay' });
    expect(new URL(ebay.getAttribute('href')!).searchParams.get('_nkw')).toBe("Gaea's Liege Rebecca Guay signed");

    const buyAll = await within(section).findByRole('link', { name: /Buy all 2 on TCGplayer · about \$12\.50/ });
    expect(buyAll).toHaveAttribute('href', expect.stringContaining('subId1=wishlist'));
    await waitFor(() => expect(tcgTarget(buyAll).searchParams.get('c'))
      .toBe("1 Gaea's Liege (Borderless) [LEA] 232||1 Bitterblossom [MOR] 58"));
    expect(axios.post).toHaveBeenCalledWith('https://api.scryfall.com/cards/collection', {
      identifiers: [{ id: 's1' }, { id: 's2' }],
    });
  });

  it('still links out when Scryfall prices fail to load', async () => {
    (axios.post as jest.Mock).mockRejectedValue(new Error('offline'));
    renderWithProviders(<WishlistShop items={items.slice(0, 1)} />);

    const link = await screen.findByRole('link', { name: 'Buy on TCGplayer: Shop' });
    expect(tcgTarget(link).searchParams.get('q')).toBe("Gaea's Liege");
    // One card has nothing to bundle.
    expect(screen.queryByRole('link', { name: /Buy all/ })).not.toBeInTheDocument();
  });
});
