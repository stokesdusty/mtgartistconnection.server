// Affiliate URL builders. Every link carries a placement sub-ID so partner
// dashboards (and our own click log) can tell which part of the site drove a sale.

export type Placement = 'allcards' | 'artist_page' | 'event' | 'wishlist';
export type PricePlatform = 'manapool' | 'tcgplayer' | 'cardkingdom';

const TCGPLAYER_PARTNER = 'https://partner.tcgplayer.com/JkbQGE';
const EBAY_CAMPAIGN_ID = '5339140903';
const CK_PARTNER_PARAMS = 'partner=mtgartistconnection&utm_source=mtgartistconnection&utm_medium=affiliate&utm_campaign=mtgartistconnection';

const cardSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9']+/g, '-')
    .replace(/^-+|-+$/g, '');

const withParams = (url: string, params: string) => `${url}${url.includes('?') ? '&' : '?'}${params}`;

export function manapoolUrl(set: string, collectorNumber: string, name: string, placement: Placement): string {
  return `https://manapool.com/card/${set}/${collectorNumber}/${cardSlug(name)}?ref=mtgartistconnection&utm_source=mtgartistconnection&utm_medium=affiliate&utm_content=${placement}`;
}

/** Wraps any tcgplayer.com URL in our Impact partner link; subId1 shows up in Impact reports. */
export function tcgplayerUrl(target: string, placement: Placement): string {
  return `${TCGPLAYER_PARTNER}?subId1=${placement}&u=${encodeURIComponent(target)}`;
}

export const tcgplayerProductUrl = (productId: number, placement: Placement) =>
  tcgplayerUrl(`https://www.tcgplayer.com/product/${productId}`, placement);

export const tcgplayerSearchUrl = (cardName: string, placement: Placement) =>
  tcgplayerUrl(`https://www.tcgplayer.com/search/magic/product?q=${encodeURIComponent(cardName)}`, placement);

export interface TcgplayerProduct {
  productId: number;
  name: string;
  setCode: string;
  number?: string | null;
}

export interface MassEntryCard {
  name: string;
  /** Scryfall set code; pins the printing so the cart doesn't get another artist's version. */
  set?: string;
  collectorNumber?: string;
  /** TCGplayer's own naming for this printing, e.g. "Zimone, Infinite Analyst (Borderless)". Preferred when known. */
  tcgplayer?: TcgplayerProduct;
}

// "1 Lightning Bolt [SLD] 84". Without a number any art from the set matches; without a set, any printing.
const formatLine = (name: string, set?: string, number?: string | null) => {
  if (!set) return `1 ${name}`;
  return `1 ${name} [${set.toUpperCase()}]${number ? ` ${number}` : ''}`;
};

// Mass Entry only matches TCGplayer's product names. Scryfall's are close enough for plain
// printings, except that TCGplayer names double-faced cards by their front face.
const massEntryLine = ({ name, set, collectorNumber, tcgplayer }: MassEntryCard) =>
  tcgplayer
    ? formatLine(tcgplayer.name, tcgplayer.setCode, tcgplayer.number)
    : formatLine(name.split(' // ')[0], set, collectorNumber);

/** One-click cart fill: TCGplayer Mass Entry takes one line per card, separated by "||". */
export function tcgplayerMassEntryUrl(cards: MassEntryCard[], placement: Placement): string {
  const list = Array.from(new Set(cards.map(massEntryLine))).join('||');
  return tcgplayerUrl(`https://www.tcgplayer.com/massentry?productline=Magic&c=${encodeURIComponent(list)}`, placement);
}

/** `productUrl` is the CK listing URL from our price feed; without it we fall back to the card's search slug. */
export function cardKingdomUrl(productUrl: string | undefined, cardName: string, placement: Placement): string {
  const base = productUrl || `https://www.cardkingdom.com/mtg/${cardName.toLowerCase().replace(/\s+/g, '-')}`;
  return withParams(base, `${CK_PARTNER_PARAMS}&utm_content=${placement}`);
}

export function ebaySearchUrl(query: string, placement: Placement): string {
  const keywords = query.trim().split(/\s+/).map(encodeURIComponent).join('+');
  return `https://www.ebay.com/sch/i.html?_nkw=${keywords}&_sacat=0&mkcid=1&mkrid=711-53200-19255-0&siteid=0&campid=${EBAY_CAMPAIGN_ID}&customid=${placement}&toolid=10001&mkevt=1&utm_source=mtgartistconnection&utm_medium=referral&utm_campaign=ebay_${placement}`;
}

/** GA event for an affiliate click (no-op until the visitor accepts cookies and gtag loads). */
export function trackAffiliateEvent(eventName: string, placement: Placement, params: Record<string, string | undefined> = {}): void {
  const gtag = (window as any).gtag;
  if (!gtag) return;
  gtag('event', eventName, { event_category: 'affiliate_links', placement, ...params });
}
