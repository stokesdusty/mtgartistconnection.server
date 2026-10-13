import { GRAPHQL_URL } from "../config/api";

// Group orders ("signing runs"): shared types, labels and the settings form model.
// The webservice enforces every rule; the helpers here only shape input and display.

export type OrderStatus = 'draft' | 'open' | 'closed' | 'at-event' | 'returning' | 'complete' | 'cancelled';
export type PaymentTiming = 'upfront' | 'after-signing';
export type ParticipantStatus = 'requested' | 'approved' | 'declined' | 'removed' | 'left';
export type BalanceStatus = 'pending' | 'unpaid' | 'partial' | 'paid' | 'overpaid';

export interface SignatureType { id: string; label: string }
export interface GridPrice { signatureTypeId: string; price: number | null }
export interface OrderArtist { name: string; cap: number | null; prices: GridPrice[]; used: number; remaining: number | null }
export interface ReturnOption { id: string; label: string; price: number }

export interface Balance {
  cardsTotal: number;
  customItemsTotal: number;
  fee: number;
  returnShipping: number;
  pendingCount: number;
  due: number | null;
  confirmedPaid: number;
  reportedPaid: number;
  remaining: number | null;
  status: BalanceStatus;
}

export type RowStatus = 'collecting' | 'signed' | 'not-signed';
export type CustomItemStatus = 'requested' | 'purchased' | 'unavailable';

export interface Payment {
  id: string;
  amount: number;              // negative is a refund the organizer recorded
  note: string | null;
  source: 'participant' | 'organizer';
  createdAt: string | null;
  confirmedAt: string | null;  // null while waiting for the organizer
}

/** Something the organizer buys for a participant: an artist proof, print, playmat... */
export interface CustomItem {
  id: string;
  label: string;
  artistName: string | null;
  quantity: number;
  price: number | null;
  status: CustomItemStatus;
  note: string | null;
}

export interface Participant {
  id: string;
  isGuest: boolean;
  displayName: string;
  discordName: string | null;
  status: ParticipantStatus;
  cardCount: number;
  balance: Balance;
  createdAt: string | null;
  readyToShipAt: string | null;
  sheetChanged: boolean;         // cards changed since they marked ready to ship
  inboundTracking: string | null;
  receivedAt: string | null;
  mismatchCount: number;         // cards the organizer counted differently
  returnOptionId: string | null;
  returnTracking: string | null;
  notesToOrganizer: string | null;
  emailOptOut: boolean | null;
  payments: Payment[];
  customItems: CustomItem[];
}

export interface GroupOrderEvent { id: string; name: string; city: string; startDate: string; endDate: string }

export interface GroupOrder {
  id: string;
  name: string;
  status: OrderStatus;
  paymentTiming: PaymentTiming;
  paymentDue: boolean;
  disabled: boolean;              // by an admin: read-only
  disabledReason: string | null;
  eventId: string | null;
  event: GroupOrderEvent | null;
  organizerDiscordName: string | null;
  publicTerms: string | null;
  cutoff: string | null;
  maxCardsPerParticipant: number | null;
  participantFee: number;
  returnOptions: ReturnOption[];
  signatureTypes: SignatureType[];
  artists: OrderArtist[];
}

/** A card in the order. Its price comes from the grid: artist + signature type. */
export interface OrderRow {
  rowId: string;
  cardName: string;
  quantity: number;
  set: string;
  foil: string;
  artist: string;
  signatureTypeId: string;
  sigNotes: string;
  owner: string;
  participantId: string | null;
  status: RowStatus;
  notSignedReason: string | null;
  receivedQuantity: number | null;  // the organizer's check-in count
}

export interface RowInput {
  artist: string;
  signatureTypeId: string;
  quantity: number;
  cardName: string;
  set: string;
  foil: string;
  sigNotes: string;
}

export interface OrganizerGroupOrder extends GroupOrder {
  savedStatus: OrderStatus;
  organizerEmailOptOut: boolean;
  inviteToken: string | null;
  privateInstructions: string | null;
  rows: OrderRow[];
  participants: Participant[];
}

export interface ParticipantGroupOrder extends GroupOrder {
  privateInstructions: string | null;
  rows: OrderRow[];
  me: Participant;
}

// ─── Labels ──────────────────────────────────────────────────────────────────

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  draft: 'Draft',
  open: 'Open',
  closed: 'Closed',
  'at-event': 'At event',
  returning: 'Returning',
  complete: 'Complete',
  cancelled: 'Cancelled',
};

export const PAYMENT_TIMING_LABELS: Record<PaymentTiming, string> = {
  upfront: 'Pay upfront',
  'after-signing': 'Pay after signing',
};

/** For the organizer, in the setup form. */
export const PAYMENT_TIMING_ORGANIZER_HINTS: Record<PaymentTiming, string> = {
  upfront: 'Participants pay once you approve them.',
  'after-signing': 'Participants pay once the cards are signed, before you ship them back.',
};

/** For participants and anyone with the invite link. */
export const PAYMENT_TIMING_PARTICIPANT_HINTS: Record<PaymentTiming, string> = {
  upfront: 'You pay once the organizer approves you.',
  'after-signing': 'You pay once your cards are signed, before the organizer ships them back.',
};

/** The organizer's next step from each status, mirroring the webservice's transitions. */
export const NEXT_STATUSES: Record<OrderStatus, { status: OrderStatus; label: string }[]> = {
  draft: [{ status: 'open', label: 'Open the order' }],
  open: [{ status: 'closed', label: 'Close to new cards' }],
  closed: [{ status: 'open', label: 'Reopen' }, { status: 'at-event', label: 'Start the event' }],
  'at-event': [{ status: 'returning', label: 'Start shipping back' }],
  returning: [{ status: 'complete', label: 'Mark complete' }],
  complete: [],
  cancelled: [],
};

export const canCancel = (status: OrderStatus) => status === 'draft' || status === 'open' || status === 'closed';

export const formatMoney = (amount: number) => `$${Number.isInteger(amount) ? amount : amount.toFixed(2)}`;

/** A grid cell for display: a price, "TBD", or "—" when the artist doesn't offer it. */
export function cellLabel(artist: Pick<OrderArtist, 'prices'>, signatureTypeId: string): string {
  const cell = artist.prices.find((p) => p.signatureTypeId === signatureTypeId);
  if (!cell) return '—';
  return cell.price === null ? 'TBD' : formatMoney(cell.price);
}

/** The signature types an artist offers in this order, with each one's price label. */
export function offeredTypes(order: Pick<GroupOrder, 'artists' | 'signatureTypes'>, artistName: string) {
  const artist = order.artists.find((a) => a.name === artistName);
  if (!artist) return [];
  return order.signatureTypes
    .filter((t) => artist.prices.some((p) => p.signatureTypeId === t.id))
    .map((t) => ({ ...t, priceLabel: cellLabel(artist, t.id) }));
}

export const signatureTypeLabel = (order: Pick<GroupOrder, 'signatureTypes'>, id: string) =>
  order.signatureTypes.find((t) => t.id === id)?.label ?? 'Removed type';

/** A card's price each, from the grid: $5, TBD, or — if the cell was removed. */
export function rowPriceLabel(order: Pick<GroupOrder, 'artists'>, row: Pick<OrderRow, 'artist' | 'signatureTypeId'>) {
  const artist = order.artists.find((a) => a.name === row.artist);
  return artist ? cellLabel(artist, row.signatureTypeId) : '—';
}

export function balanceLabel(balance: Balance): string {
  switch (balance.status) {
    case 'pending': return 'Price pending';
    case 'paid': return 'Paid';
    case 'overpaid': return `Owed ${formatMoney(-(balance.remaining ?? 0))} back`;
    case 'partial': return `Owes ${formatMoney(balance.remaining ?? 0)} more`;
    default: return `Owes ${formatMoney(balance.remaining ?? 0)}`;
  }
}

const PUBLIC_SITE = 'https://www.mtgartistconnection.com';

/**
 * Where shared links point. Always www on the real site, since the bare domain doesn't open
 * deep links, even when the page was opened without www. Local testing keeps its own origin.
 */
export const siteOrigin = ({ hostname, origin }: Pick<Location, 'hostname' | 'origin'> = window.location) =>
  /(^|\.)mtgartistconnection\.com$/i.test(hostname) ? PUBLIC_SITE : origin;

export const inviteUrl = (token: string) => `${siteOrigin()}/tracker/join/${token}`;

/**
 * The link to paste into Discord. The webservice serves it so Discord can show a preview
 * (order, event, artists, slots), then it forwards people to the invite page. On the real site
 * it's www.mtgartistconnection.com/join/<token>, which an Amplify rewrite proxies to the
 * webservice; local testing has no rewrite, so it points at the webservice directly.
 */
export const shareUrl = (token: string, location: Pick<Location, 'hostname' | 'origin'> = window.location) =>
  siteOrigin(location) === PUBLIC_SITE
    ? `${PUBLIC_SITE}/join/${token}`
    : `${GRAPHQL_URL.replace(/\/graphql\/?$/, '')}/share/group-order/${token}`;

// Mirrors the webservice's light check, so mistakes show while typing.
const DISCORD_USERNAME = /^(?!.*\.\.)[a-z0-9_.]{2,32}$/;
const LEGACY_DISCORD_NAME = /^[^@#:`]{2,32}#\d{4}$/;

export function discordNameError(input: string): string | null {
  const name = input.trim().replace(/^@/, '');
  if (!name || LEGACY_DISCORD_NAME.test(name) || DISCORD_USERNAME.test(name.toLowerCase())) return null;
  return 'Discord names are 2–32 characters: letters, numbers, "_" and "."';
}

// ─── Settings form ───────────────────────────────────────────────────────────

/**
 * Editable copy of an order's settings. Prices are strings while typing: in `cells`, a
 * missing signature type isn't offered, '' is TBD, and anything else is the price.
 */
export interface SettingsForm {
  name: string;
  eventId: string | null;
  signatureTypes: SignatureType[];
  artists: { name: string; cap: string; cells: Record<string, string> }[];
  participantFee: string;
  returnOptions: { id: string; label: string; price: string }[];
  cutoff: string;                       // yyyy-mm-dd, the last day to join
  maxCardsPerParticipant: string;
  paymentTiming: PaymentTiming | '';    // no default: the organizer has to choose
  publicTerms: string;
  privateInstructions: string;
  organizerDiscordName: string;
}

export const newId = () => Math.random().toString(36).slice(2, 10);

export const emptySettingsForm = (organizerDiscordName = ''): SettingsForm => ({
  name: '',
  eventId: null,
  signatureTypes: [{ id: 'sig', label: 'Signature' }],
  artists: [],
  participantFee: '',
  returnOptions: [],
  cutoff: '',
  maxCardsPerParticipant: '',
  paymentTiming: '',
  publicTerms: '',
  privateInstructions: '',
  organizerDiscordName,
});

/** New artists start with every signature type offered at TBD. */
export const newArtistRow = (name: string, signatureTypes: SignatureType[]) => ({
  name,
  cap: '',
  cells: Object.fromEntries(signatureTypes.map((t) => [t.id, ''])),
});

const toLocalDay = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export function formFromOrder(order: OrganizerGroupOrder): SettingsForm {
  return {
    name: order.name,
    eventId: order.eventId,
    signatureTypes: order.signatureTypes.map(({ id, label }) => ({ id, label })),
    artists: order.artists.map((a) => ({
      name: a.name,
      cap: a.cap === null ? '' : String(a.cap),
      cells: Object.fromEntries(a.prices.map((p) => [p.signatureTypeId, p.price === null ? '' : String(p.price)])),
    })),
    participantFee: order.participantFee ? String(order.participantFee) : '',
    returnOptions: order.returnOptions.map((o) => ({ id: o.id, label: o.label, price: String(o.price) })),
    cutoff: order.cutoff ? toLocalDay(order.cutoff) : '',
    maxCardsPerParticipant: order.maxCardsPerParticipant === null ? '' : String(order.maxCardsPerParticipant),
    paymentTiming: order.paymentTiming,
    publicTerms: order.publicTerms ?? '',
    privateInstructions: order.privateInstructions ?? '',
    organizerDiscordName: order.organizerDiscordName ?? '',
  };
}

export interface SettingsInput {
  name: string;
  eventId: string | null;
  settings: {
    signatureTypes: SignatureType[];
    artists: { name: string; cap: number | null; prices: GridPrice[] }[];
    participantFee: number;
    returnOptions: ReturnOption[];
    cutoff: string | null;
    maxCardsPerParticipant: number | null;
    paymentTiming: PaymentTiming;
    publicTerms: string;
    privateInstructions: string;
    organizerDiscordName: string;
  };
}

const parseMoney = (value: string, label: string): number => {
  const clean = value.trim().replace(/^\$/, '');
  if (!clean) return 0;
  const n = Number(clean);
  if (!Number.isFinite(n) || n < 0) throw new Error(`${label} must be a dollar amount.`);
  return n;
};

const parseCount = (value: string, label: string): number | null => {
  if (!value.trim()) return null;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) throw new Error(`${label} must be a whole number of 1 or more.`);
  return n;
};

/**
 * Turns the form into mutation variables, or a message for the first problem found.
 * The webservice validates again; this catches what can be caught before sending.
 */
export function settingsInputFromForm(form: SettingsForm): { input: SettingsInput } | { error: string } {
  try {
    if (!form.name.trim()) throw new Error('Give the order a name.');
    if (form.signatureTypes.length === 0) throw new Error('Add at least one signature type.');
    if (form.signatureTypes.some((t) => !t.label.trim())) throw new Error('Name every signature type.');
    if (form.artists.length === 0) throw new Error('Add at least one artist.');
    if (!form.paymentTiming) throw new Error('Choose when participants pay.');
    const discordError = discordNameError(form.organizerDiscordName);
    if (discordError) throw new Error(discordError);

    const typeIds = new Set(form.signatureTypes.map((t) => t.id));
    const artists = form.artists.map((a) => ({
      name: a.name.trim(),
      cap: parseCount(a.cap, `${a.name}'s cap`),
      prices: Object.entries(a.cells)
        .filter(([typeId]) => typeIds.has(typeId))
        .map(([signatureTypeId, value]) => ({
          signatureTypeId,
          price: value.trim() === '' ? null : parseMoney(value, `${a.name}'s prices`),
        })),
    }));

    return {
      input: {
        name: form.name.trim(),
        eventId: form.eventId,
        settings: {
          signatureTypes: form.signatureTypes.map((t) => ({ id: t.id, label: t.label.trim() })),
          artists,
          participantFee: parseMoney(form.participantFee, 'The per-person fee'),
          returnOptions: form.returnOptions.map((o) => ({ id: o.id, label: o.label.trim(), price: parseMoney(o.price, 'Return shipping') })),
          // The whole cutoff day counts, in the organizer's time zone.
          cutoff: form.cutoff ? new Date(`${form.cutoff}T23:59:59`).toISOString() : null,
          maxCardsPerParticipant: parseCount(form.maxCardsPerParticipant, 'Cards per person'),
          paymentTiming: form.paymentTiming,
          publicTerms: form.publicTerms.trim(),
          privateInstructions: form.privateInstructions.trim(),
          organizerDiscordName: form.organizerDiscordName.trim(),
        },
      },
    };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

// ─── Progress: payments, shipping, event day ─────────────────────────────────

export const ROW_STATUS_LABELS: Record<RowStatus, string> = {
  collecting: 'Waiting',
  signed: 'Signed',
  'not-signed': 'Not signed',
};

export const CUSTOM_ITEM_STATUS_LABELS: Record<CustomItemStatus, string> = {
  requested: 'To buy',
  purchased: 'Bought',
  unavailable: 'Unavailable',
};

/** Quick picks when marking cards not signed; the organizer can also type their own. */
export const NOT_SIGNED_REASONS = ["Artist didn't show", 'Artist limit reached', 'Artist declined the card', 'Ran out of time'];

/** "$20 refund", "$15 · waiting for the organizer", "$15 · confirmed". */
export function paymentLabel(payment: Payment): string {
  if (payment.amount < 0) return `${formatMoney(-payment.amount)} refund`;
  return `${formatMoney(payment.amount)} · ${payment.confirmedAt ? 'confirmed' : 'waiting for the organizer'}`;
}

/** Parses a dollar amount typed by a person. Null when it isn't one. */
export function parseAmount(value: string): number | null {
  const clean = value.trim().replace(/^\$/, '').replace(/^-\$/, '-');
  if (!clean || !/^-?\d+(\.\d{1,2})?$/.test(clean)) return null;
  const n = Number(clean);
  return n === 0 ? null : n;
}

export interface PickListArtist {
  name: string;
  cardCount: number;
  peopleCount: number;
  /** "2 Signature, 1 Sketch", in the order's signature type order. */
  byType: { label: string; count: number }[];
  waiting: number;
  signed: number;
  notSigned: number;
  people: { participantId: string | null; label: string; rows: OrderRow[] }[];
  /** Things to buy at this artist's table. */
  items: { participantId: string; label: string; item: CustomItem }[];
}

/**
 * The organizer's event-day list: for each artist, whose cards are in their line and what to
 * buy there. Only artists with cards or items show up, in the order's artist order.
 */
export function artistPickList(order: OrganizerGroupOrder): PickListArtist[] {
  const nameOf = (id: string | null) => {
    const p = order.participants.find((x) => x.id === id);
    return p ? p.discordName || p.displayName : 'Removed';
  };
  return order.artists
    .map((artist) => {
      const rows = order.rows.filter((r) => r.artist === artist.name);
      const count = (status: RowStatus) => rows.filter((r) => r.status === status).reduce((sum, r) => sum + r.quantity, 0);
      const peopleIds = Array.from(new Set(rows.map((r) => r.participantId)));
      const items = order.participants.flatMap((p) =>
        p.customItems
          .filter((item) => item.artistName === artist.name)
          .map((item) => ({ participantId: p.id, label: p.discordName || p.displayName, item })));
      return {
        name: artist.name,
        cardCount: rows.reduce((sum, r) => sum + r.quantity, 0),
        peopleCount: peopleIds.length,
        byType: order.signatureTypes
          .map((t) => ({ label: t.label, count: rows.filter((r) => r.signatureTypeId === t.id).reduce((sum, r) => sum + r.quantity, 0) }))
          .filter((t) => t.count > 0),
        waiting: count('collecting'),
        signed: count('signed'),
        notSigned: count('not-signed'),
        people: peopleIds
          .map((id) => ({ participantId: id, label: nameOf(id), rows: rows.filter((r) => r.participantId === id) }))
          .sort((a, b) => a.label.localeCompare(b.label)),
        items,
      };
    })
    .filter((a) => a.cardCount > 0 || a.items.length > 0);
}

export type OrganizerAction = 'checkIn' | 'returnTracking' | 'markRows' | 'customItems' | 'recordPayment';

// Mirrors the webservice, so buttons only show when the server will accept them.
const ORGANIZER_ACTIONS: Record<OrderStatus, OrganizerAction[]> = {
  draft: [],
  open: ['checkIn', 'customItems', 'recordPayment', 'markRows'],
  closed: ['checkIn', 'customItems', 'recordPayment', 'markRows'],
  'at-event': ['checkIn', 'customItems', 'recordPayment', 'markRows', 'returnTracking'],
  returning: ['customItems', 'recordPayment', 'markRows', 'returnTracking'],
  complete: ['recordPayment', 'returnTracking'],
  cancelled: ['recordPayment', 'returnTracking'],
};

export const organizerCan = (action: OrganizerAction, status: OrderStatus) => ORGANIZER_ACTIONS[status].includes(action);
