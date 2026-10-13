import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import authReducer from '../../store/auth-slice';
import JoinGroupOrder from './JoinGroupOrder';
import { GET_GROUP_ORDER_INVITE, GET_MY_DISCORD_NAME } from '../graphql/queries';
import { JOIN_GROUP_ORDER } from '../graphql/mutations';
import { order, participantOrder } from './testFixtures';

const loggedIn = { auth: { isLoggedIn: true, token: 't', refreshToken: 'r', user: { id: 'u1', email: 'a@b.c', name: 'Me', role: 'user' } } };
const loggedOut = { auth: { isLoggedIn: false, token: null, refreshToken: null, user: null } };

const inviteMock = (viewerStatus: string | null, extra: Record<string, unknown> = {}): MockedResponse => ({
  request: { query: GET_GROUP_ORDER_INVITE, variables: { token: 'tok123' } },
  result: { data: { groupOrderByInvite: { ...order, viewerStatus, ...extra } } },
});
const discordMock = (discordName: string | null = 'saved.name'): MockedResponse => ({
  request: { query: GET_MY_DISCORD_NAME },
  result: { data: { me: { id: 'u1', discordName } } },
});

const Location = () => {
  const location = useLocation();
  return <div data-testid="location">{location.pathname + location.search}</div>;
};

function renderJoin(mocks: MockedResponse[], preloadedState: Record<string, unknown> = loggedIn) {
  const store = configureStore({ reducer: { auth: authReducer }, preloadedState });
  return render(
    <Provider store={store}>
      <MockedProvider mocks={mocks} addTypename={false}>
        <HelmetProvider>
          <MemoryRouter initialEntries={['/tracker/join/tok123']}>
            <Routes>
              <Route path="/tracker/join/:token" element={<JoinGroupOrder />} />
              <Route path="*" element={<Location />} />
            </Routes>
          </MemoryRouter>
        </HelmetProvider>
      </MockedProvider>
    </Provider>
  );
}

describe('JoinGroupOrder', () => {
  it('shows the public summary: organizer, prices, TBD and not-offered cells, slots and terms', async () => {
    renderJoin([inviteMock(null)], loggedOut);

    expect(await screen.findByRole('heading', { level: 1, name: 'IX run' })).toBeInTheDocument();
    expect(screen.getByText('Discord (unverified)')).toBeInTheDocument();
    const prices = within(screen.getByRole('region', { name: 'Prices' }));
    const guay = within(prices.getByRole('row', { name: /Rebecca Guay/ }));
    expect(guay.getByText('$5')).toBeInTheDocument();
    expect(guay.getByText('TBD')).toBeInTheDocument();
    expect(guay.getByText('6 of 10 left')).toBeInTheDocument();
    expect(within(prices.getByRole('row', { name: /Kaja Foglio/ })).getByLabelText('Not offered')).toBeInTheDocument();
    expect(screen.getByText('Cards back within 3 weeks.')).toBeInTheDocument();
  });

  it('sends logged-out visitors to log in and back to the link', async () => {
    renderJoin([inviteMock(null)], loggedOut);

    const login = await screen.findByRole('link', { name: 'Log in or sign up to join' });
    expect(login).toHaveAttribute('href', '/auth?redirect=%2Ftracker%2Fjoin%2Ftok123');
  });

  it('asks to join with their saved Discord name once they accept the terms', async () => {
    renderJoin([
      inviteMock(null),
      discordMock(),
      {
        request: { query: JOIN_GROUP_ORDER, variables: { token: 'tok123', discordName: 'saved.name', acceptTerms: true } },
        result: { data: { joinGroupOrder: participantOrder('requested') } },
      },
    ]);

    const name = await screen.findByLabelText('Your Discord name');
    expect(await screen.findByDisplayValue('saved.name')).toBe(name);
    const submit = screen.getByRole('button', { name: 'Ask to join' });
    expect(submit).toBeDisabled();

    userEvent.click(screen.getByRole('checkbox', { name: /agree to them/ }));
    userEvent.click(submit);

    expect(await screen.findByTestId('location')).toHaveTextContent('/tracker/shared/o1');
  });

  it('blocks a malformed Discord name before sending', async () => {
    renderJoin([inviteMock(null), discordMock(null)]);

    userEvent.type(await screen.findByLabelText('Your Discord name'), 'has space');
    userEvent.click(screen.getByRole('checkbox', { name: /agree to them/ }));
    expect(screen.getByText(/Discord names are 2–32 characters/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ask to join' })).toBeDisabled();
  });

  it.each([
    ['requested', 'Request sent'],
    ['approved', "You're in"],
    ['organizer', "You're the organizer"],
    ['declined', "You're not in this order"],
  ])('shows the %s state instead of the form', async (viewerStatus, heading) => {
    renderJoin([inviteMock(viewerStatus)]);

    expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Ask to join' })).not.toBeInTheDocument();
  });

  it('says when the order has stopped taking people', async () => {
    renderJoin([inviteMock(null, { status: 'closed' })]);

    expect(await screen.findByRole('heading', { name: 'Not taking new people' })).toBeInTheDocument();
  });

  it('explains a dead link', async () => {
    renderJoin([{ request: { query: GET_GROUP_ORDER_INVITE, variables: { token: 'tok123' } }, result: { data: { groupOrderByInvite: null } } }]);

    expect(await screen.findByRole('heading', { name: "This invite link isn't active" })).toBeInTheDocument();
  });
});
