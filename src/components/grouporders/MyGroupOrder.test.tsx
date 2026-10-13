import { screen, within } from '@testing-library/react';
import { MockedResponse } from '@apollo/client/testing';
import { renderWithProviders } from '../../test-utils';
import MyGroupOrder from './MyGroupOrder';
import { GET_MY_GROUP_ORDER } from '../graphql/queries';
import { ADD_GROUP_ORDER_ROW, UPDATE_GROUP_ORDER_ROW } from '../graphql/mutations';
import { participant, participantOrder, row } from './testFixtures';
import { choose, click, idCache, type } from './testActions';

const loggedIn = { auth: { isLoggedIn: true, token: 't', refreshToken: 'r', user: { id: 'u1', email: 'a@b.c', name: 'Me', role: 'user' } } };

const orderMock = (order: object): MockedResponse => ({
  request: { query: GET_MY_GROUP_ORDER, variables: { orderId: 'o1' } },
  result: { data: { myGroupOrder: order } },
});

const renderPage = (order: object) =>
  renderWithProviders(<MyGroupOrder />, { route: '/tracker/shared/o1', path: '/tracker/shared/:orderId', mocks: [orderMock(order)], preloadedState: loggedIn });

beforeEach(() => localStorage.clear());

describe('MyGroupOrder', () => {
  it('shows approved participants the private instructions and their balance', async () => {
    renderPage(participantOrder('approved'));

    const instructions = within(await screen.findByRole('region', { name: 'Shipping and payment' }));
    expect(instructions.getByText('Ship to 123 Main Street.')).toBeInTheDocument();
    const balance = within(screen.getByRole('region', { name: 'Your balance' }));
    expect(balance.getByText('Owes $17')).toBeInTheDocument();
    expect(balance.getByText(/Payment is due now/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Leave order' })).toBeInTheDocument();
  });

  it('keeps people waiting for approval to the public details', async () => {
    renderPage(participantOrder('requested'));

    expect(await screen.findByText(/Waiting for the organizer to approve you/)).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Shipping and payment' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Withdraw request' })).toBeInTheDocument();
  });

  it('nudges people without a Discord name to add one', async () => {
    renderPage(participantOrder('approved', { me: participant('me', 'approved', { discordName: null }) }));

    expect(await screen.findByText(/Add your Discord name/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Add it in settings' })).toHaveAttribute('href', '/settings');
  });
});

describe('MyGroupOrder cards', () => {
  const cardsMock = (order: object, extra: MockedResponse[] = []) =>
    renderWithProviders(<MyGroupOrder />, {
      route: '/tracker/shared/o1', path: '/tracker/shared/:orderId', mocks: [orderMock(order), ...extra], preloadedState: loggedIn, cache: idCache(),
    });

  it('lists their cards priced from the grid', async () => {
    cardsMock(participantOrder('approved'));

    const cards = within(await screen.findByRole('region', { name: 'Your cards' }));
    const card = within(cards.getByRole('row', { name: /Gaea's Liege/ }));
    expect(card.getByText('$5')).toBeInTheDocument();
    expect(card.getByText('Signature')).toBeInTheDocument();
    expect(cards.getByText('LEA')).toBeInTheDocument();
  });

  it('adds a card, defaulting to the artist\'s first offered signature type', async () => {
    const newCard = { artist: 'Kaja Foglio', signatureTypeId: 'sig', quantity: 1, cardName: 'Mana Vault', set: '', foil: 'foil', sigNotes: '' };
    cardsMock(participantOrder('approved'), [{
      request: { query: ADD_GROUP_ORDER_ROW, variables: { orderId: 'o1', row: newCard } },
      result: { data: { addGroupOrderRow: participantOrder('approved', { rows: [row('r1', 'me'), row('r2', 'me', newCard)] }) } },
    }]);

    const cards = within(await screen.findByRole('region', { name: 'Your cards' }));
    await choose('Artist', /Kaja Foglio/);
    expect(cards.getByRole('combobox', { name: 'Signature' })).toHaveTextContent('Signature · $3');
    await type(cards.getByRole('textbox', { name: 'Card name' }), 'Mana Vault');
    await click(cards.getByRole('checkbox', { name: 'Foil' }));
    await click(cards.getByRole('button', { name: 'Add card' }));

    expect(await cards.findByRole('row', { name: /Mana Vault/ })).toBeInTheDocument();
  });

  it('edits a card in place', async () => {
    const edited = { artist: 'Rebecca Guay', signatureTypeId: 'sig', quantity: 4, cardName: "Gaea's Liege", set: 'lea', foil: 'non-foil', sigNotes: '' };
    cardsMock(participantOrder('approved'), [{
      request: { query: UPDATE_GROUP_ORDER_ROW, variables: { orderId: 'o1', rowId: 'r1', row: edited } },
      result: { data: { updateGroupOrderRow: participantOrder('approved', { rows: [row('r1', 'me', { quantity: 4 })] }) } },
    }]);

    const cards = within(await screen.findByRole('region', { name: 'Your cards' }));
    await click(cards.getByRole('button', { name: "Edit Gaea's Liege" }));
    const quantity = cards.getByRole('textbox', { name: 'Quantity' });
    await click(quantity);
    await type(quantity, '{selectall}4');
    await click(cards.getByRole('button', { name: 'Save card' }));

    expect(await cards.findByRole('button', { name: 'Add card' })).toBeInTheDocument();
    expect(within(cards.getByRole('row', { name: /Gaea's Liege/ })).getByText('4')).toBeInTheDocument();
  });

  it('locks cards once the order closes', async () => {
    cardsMock(participantOrder('approved', { status: 'closed' }));

    const cards = within(await screen.findByRole('region', { name: 'Your cards' }));
    expect(cards.getByText(/Card changes closed with the order/)).toBeInTheDocument();
    expect(cards.queryByRole('button', { name: 'Add card' })).not.toBeInTheDocument();
    expect(cards.queryByRole('button', { name: /Edit/ })).not.toBeInTheDocument();
  });
});
