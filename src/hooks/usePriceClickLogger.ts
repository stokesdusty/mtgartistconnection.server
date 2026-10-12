import { useCallback } from 'react';
import { ApolloError, useMutation } from '@apollo/client';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { LOG_PRICE_CLICK, LOG_PRICE_CLICK_LEGACY } from '../components/graphql/mutations';
import { Placement, PricePlatform, trackAffiliateEvent } from '../utils/affiliateLinks';

interface PriceClick {
  artistName: string;
  cardName?: string;
  cardSet?: string;
}

// A 400 validation error (the API predates `placement`) arrives as a network error whose
// body holds the GraphQL errors, so look in both places.
const rejectsPlacement = (err: ApolloError) => {
  const result = (err.networkError as { result?: { errors?: { message: string }[] } } | null)?.result;
  const messages = [...(result?.errors ?? []), ...err.graphQLErrors].map((e) => e.message);
  return messages.some((m) => m.includes('Unknown argument "placement"'));
};

/** Logs a vendor price click to GA and our first-party click log (admins excluded from the latter). */
export function usePriceClickLogger(placement: Placement) {
  const userRole = useSelector((state: RootState) => state.auth.user?.role);
  const [logPriceClick] = useMutation(LOG_PRICE_CLICK);
  // Click logging is best-effort; a failed log must never surface as an error.
  const [logPriceClickLegacy] = useMutation(LOG_PRICE_CLICK_LEGACY, { onError: () => {} });

  return useCallback((platform: PricePlatform, { artistName, cardName, cardSet }: PriceClick) => {
    trackAffiliateEvent(`${platform}_price_click`, placement, { event_label: cardName, card_set: cardSet });
    if (userRole === 'admin') return;
    logPriceClick({ variables: { artistName, platform, cardName, cardSet, placement } }).catch((err: ApolloError) => {
      if (rejectsPlacement(err)) logPriceClickLegacy({ variables: { artistName, platform, cardName, cardSet } });
    });
  }, [placement, userRole, logPriceClick, logPriceClickLegacy]);
}
