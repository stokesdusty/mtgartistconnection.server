import { screen, within } from '@testing-library/react';
import { MockedResponse } from '@apollo/client/testing';
import { renderWithProviders } from '../../test-utils';
import MyGroupOrder from './MyGroupOrder';
import OrganizerGroupOrder from './OrganizerGroupOrder';
import { GET_MY_GROUP_ORDER, GET_ORGANIZED_GROUP_ORDER } from '../graphql/queries';
import {
  ADD_GROUP_ORDER_CUSTOM_ITEM,
  CHECK_IN_GROUP_ORDER_PACKAGE,
  CONFIRM_GROUP_ORDER_PAYMENT,
  MARK_GROUP_ORDER_READY_TO_SHIP,
  REPORT_GROUP_ORDER_PAYMENT,
  SET_GROUP_ORDER_ROW_STATUS,
} from '../graphql/mutations';
import { organizerOrder, participant, participantOrder, row } from './testFixtures';
import { choose, click, idCache, type } from './testActions';

const loggedIn = { auth: { isLoggedIn: true, token: 't', refreshToken: 'r', user: { id: 'u1', email: 'a@b.c', name: 'Me', role: 'user' } } };

const renderMine = (order: object, extra: MockedResponse[] = []) =>
  renderWithProviders(<MyGroupOrder />, {
    route: '/tracker/shared/o1', path: '/tracker/shared/:orderId', preloadedState: loggedIn, cache: idCache(),
    mocks: [{ request: { query: GET_MY_GROUP_ORDER, variables: { orderId: 'o1' } }, result: { data: { myGroupOrder: order } } }, ...extra],
  });

const renderOrganizer = (order: object, extra: MockedResponse[] = [], route = '/tracker/group/o1') =>
  renderWithProviders(<OrganizerGroupOrder />, {
    route, path: '/tracker/group/:orderId', preloadedState: loggedIn, cache: idCache(),
    mocks: [{ request: { query: GET_ORGANIZED_GROUP_ORDER, variables: { orderId: 'o1' } }, result: { data: { organizedGroupOrder: order } } }, ...extra],
  });

/** A stand-in print window, so tests can check the artist sheet that was printed. */
const mockPrintWindow = () => {
  const doc = { write: jest.fn(), close: jest.fn() };
  const open = jest.spyOn(window, 'open').mockReturnValue({ document: doc } as unknown as Window);
  return { open, doc };
};

afterEach(() => jest.restoreAllMocks());

describe('participant: shipping', () => {
  it('prints the artist sheet and marks the cards ready to ship', async () => {
    const { doc } = mockPrintWindow();
    const ready = participantOrder('approved', { me: participant('me', 'approved', { readyToShipAt: '2099-09-10T12:00:00.000Z' }) });
    renderMine(participantOrder('approved'), [
      { request: { query: MARK_GROUP_ORDER_READY_TO_SHIP, variables: { orderId: 'o1' } }, result: { data: { markGroupOrderReadyToShip: ready } } },
    ]);

    const shipping = within(await screen.findByRole('region', { name: 'Ship your cards' }));
    await click(shipping.getByRole('button', { name: /Ready to ship/ }));

    expect(doc.write).toHaveBeenCalledWith(expect.stringContaining('Rebecca Guay'));
    expect(doc.write).toHaveBeenCalledWith(expect.stringContaining('me_discord'));
    expect(doc.write).toHaveBeenCalledWith(expect.stringContaining('IX run · organizer runner'));
    expect(await shipping.findByText(/Marked ready to ship/)).toBeInTheDocument();
    expect(shipping.getByRole('button', { name: 'Print artist sheet' })).toBeInTheDocument();
  });

  it('says when the browser blocks the print window', async () => {
    jest.spyOn(window, 'open').mockReturnValue(null);
    renderMine(participantOrder('approved'));

    const shipping = within(await screen.findByRole('region', { name: 'Ship your cards' }));
    await click(shipping.getByRole('button', { name: /Ready to ship/ }));
    expect(await shipping.findByRole('alert')).toHaveTextContent('blocked the print window');
  });

  it('asks for a reprint when cards changed, and flags check-in mismatches', async () => {
    renderMine(participantOrder('approved', {
      rows: [row('r1', 'me', { receivedQuantity: 1 })],
      me: participant('me', 'approved', { readyToShipAt: '2099-09-10T12:00:00.000Z', sheetChanged: true, receivedAt: '2099-09-20T12:00:00.000Z', mismatchCount: 1 }),
    }));

    const shipping = within(await screen.findByRole('region', { name: 'Ship your cards' }));
    expect(shipping.getByRole('alert')).toHaveTextContent('counted one of your cards differently');
    expect(screen.getByText('Received 1 of 2')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Leave order' })).not.toBeInTheDocument();
    expect(screen.getByText(/has your cards, so you can't leave/)).toBeInTheDocument();
  });
});

describe('participant: payments', () => {
  it('reports a payment for the organizer to confirm', async () => {
    const reported = participantOrder('approved', {
      me: participant('me', 'approved', { payments: [{ id: 'pay1', amount: 17, note: 'venmo 123', source: 'participant', createdAt: '2099-09-11T12:00:00.000Z', confirmedAt: null }] }),
    });
    renderMine(participantOrder('approved'), [
      { request: { query: REPORT_GROUP_ORDER_PAYMENT, variables: { orderId: 'o1', amount: 17, note: 'venmo 123' } }, result: { data: { reportGroupOrderPayment: reported } } },
    ]);

    const balance = within(await screen.findByRole('region', { name: 'Your balance' }));
    await type(balance.getByRole('textbox', { name: 'Amount you sent' }), '17');
    await type(balance.getByRole('textbox', { name: 'Payment note' }), 'venmo 123');
    await click(balance.getByRole('button', { name: 'Report payment' }));

    expect(await balance.findByText('$17 · waiting for the organizer')).toBeInTheDocument();
    expect(balance.getByRole('button', { name: 'Withdraw' })).toBeInTheDocument();
  });

  it('shows items the organizer is buying for them', async () => {
    renderMine(participantOrder('approved', {
      me: participant('me', 'approved', { customItems: [{ id: 'i1', label: 'Bolt AP', artistName: 'Rebecca Guay', quantity: 2, price: null, status: 'requested', note: null }] }),
    }));

    const items = within(await screen.findByRole('list', { name: 'Other items' }));
    expect(items.getByText('Bolt AP ×2')).toBeInTheDocument();
    expect(items.getByText(/Price pending/)).toBeInTheDocument();
    expect(items.getByText('To buy')).toBeInTheDocument();
  });
});

describe('organizer: managing a participant', () => {
  const reportedPayment = { id: 'pay1', amount: 17, note: 'venmo', source: 'participant', createdAt: '2099-09-11T12:00:00.000Z', confirmedAt: null };

  it('confirms a reported payment', async () => {
    const withReport = organizerOrder({ participants: [participant('alice', 'approved', { payments: [reportedPayment] })] });
    const confirmed = organizerOrder({ participants: [participant('alice', 'approved', { payments: [{ ...reportedPayment, confirmedAt: '2099-09-12T12:00:00.000Z' }] })] });
    renderOrganizer(withReport, [
      { request: { query: CONFIRM_GROUP_ORDER_PAYMENT, variables: { participantId: 'alice', paymentId: 'pay1' } }, result: { data: { confirmGroupOrderPayment: confirmed } } },
    ]);

    await click(await screen.findByRole('button', { name: 'Manage alice_discord' }));
    const payments = within(screen.getByRole('list', { name: "alice_discord's payments" }));
    expect(payments.getByText('$17 · waiting for the organizer')).toBeInTheDocument();
    await click(payments.getByRole('button', { name: 'Confirm' }));

    expect(await payments.findByText('$17 · confirmed')).toBeInTheDocument();
  });

  it('checks in a package with a count for each card', async () => {
    const received = organizerOrder({
      rows: [row('r1', 'alice', { receivedQuantity: 1 })],
      participants: [participant('alice', 'approved', { receivedAt: '2099-09-20T12:00:00.000Z', mismatchCount: 1 })],
    });
    renderOrganizer(organizerOrder({ participants: [participant('alice', 'approved')] }), [
      {
        request: { query: CHECK_IN_GROUP_ORDER_PACKAGE, variables: { participantId: 'alice', counts: [{ rowId: 'r1', receivedQuantity: 1 }] } },
        result: { data: { checkInGroupOrderPackage: received } },
      },
    ]);

    await click(await screen.findByRole('button', { name: 'Manage alice_discord' }));
    const form = within(screen.getByRole('form', { name: "Check in alice_discord's package" }));
    const count = form.getByRole('textbox', { name: "Received Gaea's Liege" });
    expect(count).toHaveValue('2');
    await type(count, '{selectall}1');
    await click(form.getByRole('button', { name: 'Mark package received' }));

    expect(await screen.findByText(/package received · counts off/)).toBeInTheDocument();
  });

  it('adds an item with its price pending', async () => {
    const item = { label: 'Bolt AP', artistName: 'Rebecca Guay', quantity: 2, price: null, status: 'requested', note: null };
    renderOrganizer(organizerOrder({ participants: [participant('alice', 'approved')] }), [
      {
        request: { query: ADD_GROUP_ORDER_CUSTOM_ITEM, variables: { participantId: 'alice', item } },
        result: { data: { addGroupOrderCustomItem: organizerOrder({ participants: [participant('alice', 'approved', { customItems: [{ id: 'i1', ...item }] })] }) } },
      },
    ]);

    await click(await screen.findByRole('button', { name: 'Manage alice_discord' }));
    const form = within(screen.getByRole('form', { name: 'Add an item for alice_discord' }));
    await type(form.getByRole('textbox', { name: 'Item' }), 'Bolt AP');
    await choose('Artist', 'Rebecca Guay', form);
    await type(form.getByRole('textbox', { name: 'Quantity' }), '{selectall}2');
    await click(form.getByRole('button', { name: 'Add item' }));

    const items = within(await screen.findByRole('list', { name: "alice_discord's other items" }));
    expect(items.getByText('Bolt AP ×2')).toBeInTheDocument();
  });
});

describe('organizer: event day', () => {
  const atEvent = (rows = [row('r1', 'alice'), row('r2', 'alice', { artist: 'Kaja Foglio', cardName: 'Mana Vault', quantity: 1 })]) =>
    organizerOrder({ status: 'at-event', savedStatus: 'at-event', rows, participants: [participant('alice', 'approved')] });

  it("opens on the by-artist list during the event, with each artist's line", async () => {
    renderOrganizer(atEvent());

    const guay = within(await screen.findByRole('region', { name: 'Rebecca Guay' }));
    expect(guay.getByText(/2 cards from 1 person · 2 Signature/)).toBeInTheDocument();
    expect(guay.getByText('alice_discord')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Kaja Foglio' })).toBeInTheDocument();
  });

  it('marks a card signed', async () => {
    renderOrganizer(atEvent(), [
      {
        request: { query: SET_GROUP_ORDER_ROW_STATUS, variables: { orderId: 'o1', rowIds: ['r1'], status: 'signed', reason: null } },
        result: { data: { setGroupOrderRowStatus: atEvent([row('r1', 'alice', { status: 'signed' }), row('r2', 'alice', { artist: 'Kaja Foglio', cardName: 'Mana Vault', quantity: 1 })]) } },
      },
    ]);

    const guay = within(await screen.findByRole('region', { name: 'Rebecca Guay' }));
    await click(guay.getByRole('button', { name: "Gaea's Liege signed" }));
    expect(await guay.findByText(/2 signed · 0 not · 0 waiting/)).toBeInTheDocument();
    expect(guay.getByRole('button', { name: "Undo Gaea's Liege" })).toBeInTheDocument();
  });

  it('asks why when marking a card not signed', async () => {
    renderOrganizer(atEvent(), [
      {
        request: { query: SET_GROUP_ORDER_ROW_STATUS, variables: { orderId: 'o1', rowIds: ['r2'], status: 'not-signed', reason: 'Artist limit reached' } },
        result: {
          data: {
            setGroupOrderRowStatus: atEvent([row('r1', 'alice'), row('r2', 'alice', { artist: 'Kaja Foglio', cardName: 'Mana Vault', quantity: 1, status: 'not-signed', notSignedReason: 'Artist limit reached' })]),
          },
        },
      },
    ]);

    const foglio = within(await screen.findByRole('region', { name: 'Kaja Foglio' }));
    await click(foglio.getByRole('button', { name: 'Mana Vault not signed' }));
    const dialog = within(screen.getByRole('dialog', { name: "Why weren't they signed?" }));
    await choose('Reason', 'Artist limit reached');
    await click(dialog.getByRole('button', { name: 'Mark not signed' }));

    expect(await foglio.findByText(/Not signed · Artist limit reached/)).toBeInTheDocument();
  });

  it('keeps the people view one tap away', async () => {
    renderOrganizer(atEvent(), [], '/tracker/group/o1?view=people');
    expect(await screen.findByRole('region', { name: 'Participants' })).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Rebecca Guay' })).not.toBeInTheDocument();
  });
});
