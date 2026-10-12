import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_TCGPLAYER_PRODUCTS } from '../components/graphql/queries';
import { TcgplayerProduct } from '../utils/affiliateLinks';

/**
 * TCGplayer's naming for the given product IDs, keyed by ID. Best-effort: while
 * loading or on error the map is empty and Mass Entry falls back to Scryfall naming.
 */
export function useTcgplayerProducts(ids: (number | undefined)[]): Map<number, TcgplayerProduct> {
  // Callers pass a fresh array each render; a stable string key keeps the query variables stable.
  const key = Array.from(new Set(ids.filter((id): id is number => typeof id === 'number')))
    .sort((a, b) => a - b)
    .join(',');
  const uniqueIds = useMemo(() => (key ? key.split(',').map(Number) : []), [key]);
  const { data } = useQuery(GET_TCGPLAYER_PRODUCTS, {
    variables: { ids: uniqueIds },
    skip: uniqueIds.length === 0,
  });
  return useMemo(
    () => new Map<number, TcgplayerProduct>((data?.tcgplayerProducts ?? []).map((p: TcgplayerProduct) => [p.productId, p])),
    [data]
  );
}
