import { act } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InMemoryCache } from '@apollo/client';

// With userEvent v13 on React 18, state updates from these events land outside act and the
// next step sees stale DOM, so each interaction is flushed before the next.
/* eslint-disable testing-library/no-unnecessary-act */
export const click = (el: Element) => act(async () => { userEvent.click(el); });
export const type = (el: Element, text: string) => act(async () => { userEvent.type(el, text); });
/* eslint-enable testing-library/no-unnecessary-act */

/** Opens an MUI select by its label (inside `within`, when there are several) and picks an option. */
export async function choose(label: string, option: string | RegExp, within: Pick<typeof screen, 'getByRole'> = screen) {
  await click(within.getByRole('combobox', { name: label }));
  // The option list renders in a portal at the end of the page.
  await click(screen.getByRole('option', { name: option }));
}

/** Mocks run without __typename; key the cache by id, as the app's cache does by type + id, so mutation results update queries. */
export const idCache = () => new InMemoryCache({ addTypename: false, dataIdFromObject: (o: any) => (o.id ? String(o.id) : undefined) });
