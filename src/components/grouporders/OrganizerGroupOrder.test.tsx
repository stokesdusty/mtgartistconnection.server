import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockedResponse } from '@apollo/client/testing';
import { renderWithProviders } from '../../test-utils';
import OrganizerGroupOrder from './OrganizerGroupOrder';
import { GET_ORGANIZED_GROUP_ORDER } from '../graphql/queries';
import { ORGANIZER_ADD_GROUP_ORDER_ROW, REVIEW_GROUP_ORDER_REQUEST, SET_GROUP_ORDER_STATUS } from '../graphql/mutations';
import { organizerOrder, participant, row } from './testFixtures';
import { choose, click, idCache, type } from './testActions';

const loggedIn = { auth: { isLoggedIn: true, token: 't', refreshToken: 'r', user: { id: 'u1', email: 'a@b.c', name: 'Runner', role: 'user' } } };

const orderMock = (extra: Record<string, unknown> = {}): MockedResponse => ({
  request: { query: GET_ORGANIZED_GROUP_ORDER, variables: { orderId: 'o1' } },
  result: { data: { organizedGroupOrder: organizerOrder(extra) } },
});

const renderPage = (mocks: MockedResponse[]) =>
  renderWithProviders(<OrganizerGroupOrder />, {
    route: '/tracker/group/o1', path: '/tracker/group/:orderId', mocks, preloadedState: loggedIn, cache: idCache(),
  });

describe('OrganizerGroupOrder', () => {
  it('lists join requests apart from participants, flagging missing Discord names', async () => {
    renderPage([orderMock()]);

    const requests = within(await screen.findByRole('region', { name: 'Join requests' }));
    expect(requests.getByText('bob name')).toBeInTheDocument();
    expect(requests.getByText('No Discord name')).toBeInTheDocument();
    const participants = within(screen.getByRole('region', { name: 'Participants' }));
    expect(participants.getByText('alice_discord')).toBeInTheDocument();
    expect(participants.getByText(/3 cards · Owes \$17/)).toBeInTheDocument();
  });

  it('approves a request, moving them into participants', async () => {
    renderPage([
      orderMock(),
      {
        request: { query: REVIEW_GROUP_ORDER_REQUEST, variables: { participantId: 'bob', approve: true } },
        result: {
          data: {
            reviewGroupOrderRequest: organizerOrder({
              participants: [participant('alice', 'approved'), participant('bob', 'approved', { discordName: null })],
            }),
          },
        },
      },
    ]);

    userEvent.click(await screen.findByRole('button', { name: 'Approve bob name' }));

    const participants = within(screen.getByRole('region', { name: 'Participants' }));
    expect(await participants.findByText('bob name')).toBeInTheDocument();
    expect(within(screen.getByRole('region', { name: 'Join requests' })).getByText('No requests waiting.')).toBeInTheDocument();
  });

  it('copies the invite link for Discord', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    renderPage([orderMock()]);

    const share = 'https://mtgartistconnectionwebservice-production.up.railway.app/share/group-order/tok123';
    expect(await screen.findByRole('textbox', { name: 'Invite link' })).toHaveValue(share);
    expect(screen.getByRole('link', { name: `${window.location.origin}/tracker/join/tok123` })).toHaveAttribute('href', '/tracker/join/tok123');
    userEvent.click(screen.getByRole('button', { name: 'Copy link for Discord' }));

    expect(await screen.findByRole('button', { name: 'Copied' })).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith(share);
  });

  it('opens a draft order', async () => {
    renderPage([
      orderMock({ status: 'draft', savedStatus: 'draft', participants: [] }),
      {
        request: { query: SET_GROUP_ORDER_STATUS, variables: { orderId: 'o1', status: 'open' } },
        result: { data: { setGroupOrderStatus: organizerOrder({ participants: [] }) } },
      },
    ]);

    expect(await screen.findByText(/Only you can see this order/)).toBeInTheDocument();
    userEvent.click(screen.getByRole('button', { name: 'Open the order' }));

    expect(await screen.findByRole('button', { name: 'Close to new cards' })).toBeInTheDocument();
  });

  it('explains a passed cutoff and hides Reopen', async () => {
    renderPage([orderMock({ status: 'closed', savedStatus: 'open' })]);

    expect(await screen.findByText(/The cutoff has passed/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reopen' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start the event' })).toBeInTheDocument();
  });

  it("shows everyone's cards with whose they are, priced from the grid", async () => {
    renderPage([orderMock()]);

    const cards = within(await screen.findByRole('region', { name: 'Cards' }));
    const card = within(cards.getByRole('row', { name: /Gaea's Liege/ }));
    expect(card.getByText('alice_discord')).toBeInTheDocument();
    expect(card.getByText('$5')).toBeInTheDocument();
  });

  it('adds a card for someone, asking whose it is first', async () => {
    renderPage([
      orderMock(),
      {
        request: {
          query: ORGANIZER_ADD_GROUP_ORDER_ROW,
          variables: {
            participantId: 'alice',
            row: { artist: 'Rebecca Guay', signatureTypeId: 'sketch', quantity: 1, cardName: 'Swords', set: '', foil: 'non-foil', sigNotes: '' },
          },
        },
        result: {
          data: {
            organizerAddGroupOrderRow: organizerOrder({
              rows: [row('r1', 'alice'), row('r2', 'alice', { cardName: 'Swords', quantity: 1, signatureTypeId: 'sketch' })],
            }),
          },
        },
      },
    ]);

    const cards = within(await screen.findByRole('region', { name: 'Cards' }));
    await choose('Artist', /Rebecca Guay/);
    await choose('Signature', /Sketch · TBD/);
    await type(cards.getByRole('textbox', { name: 'Card name' }), 'Swords');
    await click(cards.getByRole('button', { name: 'Add card' }));
    expect(await cards.findByRole('alert')).toHaveTextContent('Pick whose card this is.');

    await choose('Person', 'alice_discord');
    await click(cards.getByRole('button', { name: 'Add card' }));
    expect(await cards.findByRole('row', { name: /Swords/ })).toBeInTheDocument();
  });
});
