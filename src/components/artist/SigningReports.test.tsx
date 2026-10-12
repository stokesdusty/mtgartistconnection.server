import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { Route, Routes, useLocation } from 'react-router-dom';
import { renderWithProviders } from '../../test-utils';
import SigningReports from './SigningReports';
import { GET_RECENT_SIGNING_REPORTS, GET_SIGNING_REPORT_SUMMARY } from '../graphql/queries';
import { SUBMIT_SIGNING_REPORT } from '../graphql/mutations';

const loggedOut = { auth: { isLoggedIn: false, token: null, refreshToken: null, user: null } };
const loggedIn = {
  auth: { isLoggedIn: true, token: 't', refreshToken: 'r', user: { email: 'fan@example.com', role: 'user' } },
};

const artistName = 'Rebecca Guay';
const events = [{ id: 'ev1', name: 'MagicCon Las Vegas', startDate: '2026-05-01T00:00:00.000Z' }];

const summaryMock = (summary: object) => ({
  request: { query: GET_SIGNING_REPORT_SUMMARY, variables: { artistName } },
  result: { data: { signingReportSummary: summary } },
});
const recentMock = (reports: object[]) => ({
  request: { query: GET_RECENT_SIGNING_REPORTS, variables: { artistName, limit: 5 } },
  result: { data: { recentSigningReports: reports } },
});
const emptyMocks = [
  summaryMock({ count: 0, medianPrice: null, minPrice: null, maxPrice: null, latestSignedOn: null, byMethod: [] }),
  recentMock([]),
];

const report = {
  id: 'r1',
  artistName,
  signedOn: '2026-05-01T00:00:00.000Z',
  method: 'convention',
  pricePerSig: 5,
  freeCount: 2,
  perPersonLimit: null,
  extras: [{ kind: 'remarque', price: 40 }],
  turnaroundWeeks: null,
  eventId: 'ev1',
  serviceName: null,
  note: 'Lovely to chat with',
};

const LocationProbe = () => <div data-testid="location">{useLocation().pathname + useLocation().search}</div>;

describe('SigningReports', () => {
  it('summarises approved reports and lists recent ones', async () => {
    renderWithProviders(<SigningReports artistName={artistName} events={events} />, {
      preloadedState: loggedOut,
      mocks: [
        summaryMock({
          count: 3,
          medianPrice: 5,
          minPrice: 3,
          maxPrice: 10,
          latestSignedOn: '2026-08-01T00:00:00.000Z',
          byMethod: [
            { method: 'convention', count: 2, medianPrice: 4 },
            { method: 'mail_in', count: 1, medianPrice: 10 },
          ],
        }),
        recentMock([report]),
      ],
    });

    expect(await screen.findByText('$3–10')).toBeInTheDocument();
    expect(screen.getByText('Median $5 · 3 reports · latest Aug 2026')).toBeInTheDocument();
    expect(screen.getByText('Mail-in · $10')).toBeInTheDocument();

    const list = await screen.findByRole('list', { name: 'Recent signing reports' });
    const row = within(list).getByRole('listitem');
    expect(row).toHaveTextContent('Convention · MagicCon Las Vegas');
    expect(row).toHaveTextContent('First 2 free · Remarque $40');
    expect(row).toHaveTextContent('"Lovely to chat with"');
    expect(row).toHaveTextContent('$5 / sig');
  });

  it('sends logged-out visitors to sign up, then back to the artist page', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/artist/:name" element={<SigningReports artistName={artistName} events={events} />} />
        <Route path="/auth" element={<LocationProbe />} />
      </Routes>,
      { preloadedState: loggedOut, mocks: emptyMocks, route: '/artist/Rebecca%20Guay', path: '*' },
    );

    expect(await screen.findByText(/No recent reports yet/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Sign in to report signing info' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/auth?tab=signup&redirect=%2Fartist%2FRebecca%2520Guay');
  });

  it('submits a report and tells the user it is in review', async () => {
    const submit = {
      request: {
        query: SUBMIT_SIGNING_REPORT,
        variables: {
          artistName,
          input: {
            signedOn: new Date().toISOString().slice(0, 10),
            method: 'convention',
            pricePerSig: 4,
            freeCount: null,
            perPersonLimit: null,
            turnaroundWeeks: null,
            eventId: 'ev1',
            serviceName: null,
            note: 'Quick and friendly',
            extras: [],
          },
        },
      },
      result: { data: { submitSigningReport: { id: 'new', status: 'pending' } } },
    };
    renderWithProviders(<SigningReports artistName={artistName} events={events} />, {
      preloadedState: loggedIn,
      mocks: [...emptyMocks, submit],
    });

    fireEvent.click(await screen.findByRole('button', { name: 'Report signing info' }));
    const dialog = await screen.findByRole('dialog');

    fireEvent.mouseDown(within(dialog).getByRole('combobox', { name: /Event/ }));
    fireEvent.click(await screen.findByRole('option', { name: 'MagicCon Las Vegas' }));
    fireEvent.change(within(dialog).getByRole('spinbutton', { name: /Price per signature/ }), { target: { value: '4' } });
    fireEvent.change(within(dialog).getByRole('textbox', { name: /Note/ }), { target: { value: 'Quick and friendly' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Submit report' }));

    expect(await within(dialog).findByRole('status')).toHaveTextContent('will appear after a quick review');
  });

  it('requires a price before submitting', async () => {
    renderWithProviders(<SigningReports artistName={artistName} events={[]} />, {
      preloadedState: loggedIn,
      mocks: emptyMocks,
    });

    fireEvent.click(await screen.findByRole('button', { name: 'Report signing info' }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Submit report' }));
    expect(within(dialog).getByRole('alert')).toHaveTextContent('Enter the price per signature');
  });

  it('shows the server message when a report is rejected', async () => {
    const submit = {
      request: {
        query: SUBMIT_SIGNING_REPORT,
        variables: {
          artistName,
          input: {
            signedOn: new Date().toISOString().slice(0, 10),
            method: 'convention',
            pricePerSig: 4,
            freeCount: null,
            perPersonLimit: null,
            turnaroundWeeks: null,
            eventId: null,
            serviceName: null,
            note: null,
            extras: [],
          },
        },
      },
      result: { errors: [new GraphQLError("You've already reported on this artist in the last 7 days.")] },
    };
    renderWithProviders(<SigningReports artistName={artistName} events={[]} />, {
      preloadedState: loggedIn,
      mocks: [...emptyMocks, submit],
    });

    fireEvent.click(await screen.findByRole('button', { name: 'Report signing info' }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.change(within(dialog).getByRole('spinbutton', { name: /Price per signature/ }), { target: { value: '4' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Submit report' }));

    await waitFor(() =>
      expect(within(dialog).getByRole('alert')).toHaveTextContent('already reported on this artist'),
    );
  });
});
