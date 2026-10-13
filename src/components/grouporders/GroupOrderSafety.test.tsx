import { screen, within } from '@testing-library/react';
import { MockedResponse } from '@apollo/client/testing';
import { renderWithProviders } from '../../test-utils';
import AdminGroupOrders from './AdminGroupOrders';
import MyGroupOrder from './MyGroupOrder';
import OrganizerGroupOrder from './OrganizerGroupOrder';
import { GET_ADMIN_GROUP_ORDERS, GET_MY_GROUP_ORDER, GET_ORGANIZED_GROUP_ORDER } from '../graphql/queries';
import { DELETE_GROUP_ORDER, REPORT_GROUP_ORDER, SET_GROUP_ORDER_DISABLED } from '../graphql/mutations';
import { organizerOrder, participantOrder } from './testFixtures';
import { click, idCache, type } from './testActions';

const loggedIn = (role = 'user') => ({ auth: { isLoggedIn: true, token: 't', refreshToken: 'r', user: { id: 'u1', email: 'a@b.c', name: 'Me', role } } });

const myOrderMock = (order: object): MockedResponse => ({
  request: { query: GET_MY_GROUP_ORDER, variables: { orderId: 'o1' } }, result: { data: { myGroupOrder: order } },
});

afterEach(() => jest.restoreAllMocks());

describe('reporting an order', () => {
  it('sends a report to the admins', async () => {
    const reason = 'The organizer asked me to pay by gift card.';
    renderWithProviders(<MyGroupOrder />, {
      route: '/tracker/shared/o1', path: '/tracker/shared/:orderId', preloadedState: loggedIn(),
      mocks: [
        myOrderMock(participantOrder('approved')),
        { request: { query: REPORT_GROUP_ORDER, variables: { orderId: 'o1', reason } }, result: { data: { reportGroupOrder: { success: true, message: 'Thanks. An admin will look at this order.' } } } },
      ],
    });

    await click(await screen.findByRole('button', { name: 'Report this order' }));
    const form = within(screen.getByRole('form', { name: 'Report this order' }));
    expect(form.getByRole('button', { name: 'Send report' })).toBeDisabled();
    await type(form.getByRole('textbox', { name: "What's wrong?" }), reason);
    await click(form.getByRole('button', { name: 'Send report' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Thanks. An admin will look at this order.');
  });

  it("shows participants why an order was disabled", async () => {
    renderWithProviders(<MyGroupOrder />, {
      route: '/tracker/shared/o1', path: '/tracker/shared/:orderId', preloadedState: loggedIn(),
      mocks: [myOrderMock(participantOrder('approved', { disabled: true, disabledReason: 'Suspected scam' }))],
    });
    expect(await screen.findByText(/An admin disabled this order.*Reason: Suspected scam/)).toBeInTheDocument();
  });
});

describe('deleting an order', () => {
  it("offers delete on a draft, and explains when the server won't allow it", async () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    const draft = organizerOrder({ status: 'draft', savedStatus: 'draft', participants: [], rows: [] });
    renderWithProviders(<OrganizerGroupOrder />, {
      route: '/tracker/group/o1', path: '/tracker/group/:orderId', preloadedState: loggedIn(), cache: idCache(),
      mocks: [
        { request: { query: GET_ORGANIZED_GROUP_ORDER, variables: { orderId: 'o1' } }, result: { data: { organizedGroupOrder: draft } } },
        { request: { query: DELETE_GROUP_ORDER, variables: { orderId: 'o1' } }, result: { data: { deleteGroupOrder: { success: false, message: "This order was reported, so it can't be deleted." } } } },
      ],
    });

    await click(await screen.findByRole('button', { name: 'Delete order' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('was reported');
  });

  it("doesn't offer delete while an order is running", async () => {
    renderWithProviders(<OrganizerGroupOrder />, {
      route: '/tracker/group/o1', path: '/tracker/group/:orderId', preloadedState: loggedIn(), cache: idCache(),
      mocks: [{ request: { query: GET_ORGANIZED_GROUP_ORDER, variables: { orderId: 'o1' } }, result: { data: { organizedGroupOrder: organizerOrder() } } }],
    });
    expect(await screen.findByRole('button', { name: 'Close to new cards' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Delete order' })).not.toBeInTheDocument();
  });
});

describe('admin review', () => {
  const adminOrder = (extra: Record<string, unknown> = {}) => ({
    id: 'o1', name: 'IX run', status: 'open', createdAt: '2099-09-01T00:00:00.000Z', organizerName: 'Runner', organizerEmail: 'runner@test.local',
    organizerDiscordName: 'card.runner', inviteToken: 'tok123', participantCount: 3, cardCount: 12, openReportCount: 1,
    disabled: false, disabledReason: null,
    reports: [{ id: 'r1', reason: 'Asked for payment by gift card', reporterName: 'Alice', reporterEmail: 'alice@test.local', createdAt: '2099-09-02T00:00:00.000Z', resolvedAt: null }],
    ...extra,
  });

  it('lists reported orders with their reports, and disables one with a reason', async () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    renderWithProviders(<AdminGroupOrders />, {
      preloadedState: loggedIn('admin'), cache: idCache(),
      mocks: [
        { request: { query: GET_ADMIN_GROUP_ORDERS, variables: { reportedOnly: true } }, result: { data: { adminGroupOrders: [adminOrder()] } } },
        {
          request: { query: SET_GROUP_ORDER_DISABLED, variables: { orderId: 'o1', disabled: true, reason: 'Suspected scam' } },
          result: { data: { setGroupOrderDisabled: adminOrder({ disabled: true, disabledReason: 'Suspected scam' }) } },
        },
      ],
    });

    const card = within(await screen.findByRole('region', { name: 'IX run' }));
    expect(card.getByText('1 open report')).toBeInTheDocument();
    expect(card.getByText('Asked for payment by gift card')).toBeInTheDocument();
    expect(card.getByText(/Alice \(alice@test.local\)/)).toBeInTheDocument();

    await type(card.getByRole('textbox', { name: 'Reason for disabling IX run' }), 'Suspected scam');
    await click(card.getByRole('button', { name: 'Disable' }));
    expect(await card.findByText('Disabled: Suspected scam')).toBeInTheDocument();
    expect(card.getByRole('button', { name: 'Re-enable' })).toBeInTheDocument();
  });
});
