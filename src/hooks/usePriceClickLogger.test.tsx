import { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../store/auth-slice';
import { LOG_PRICE_CLICK, LOG_PRICE_CLICK_LEGACY } from '../components/graphql/mutations';
import { usePriceClickLogger } from './usePriceClickLogger';

const click = { artistName: 'Rebecca Guay', cardName: "Gaea's Liege", cardSet: 'lea' };
const baseVars = { ...click, platform: 'tcgplayer' };

// What Apollo's HTTP link produces when the API rejects an argument it doesn't know (HTTP 400).
const unknownPlacementError = () =>
  Object.assign(new Error('Response not successful: Received status code 400'), {
    statusCode: 400,
    result: { errors: [{ message: 'Unknown argument "placement" on field "mutations.logPriceClick".' }] },
  });

const renderLogger = (mocks: MockedResponse[]) => {
  const store = configureStore({ reducer: { auth: authReducer } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>
      <MockedProvider mocks={mocks} addTypename={false}>{children}</MockedProvider>
    </Provider>
  );
  return renderHook(() => usePriceClickLogger('event'), { wrapper });
};

describe('usePriceClickLogger', () => {
  it('logs the click with its placement', async () => {
    const logged = jest.fn(() => ({ data: { logPriceClick: { success: true } } }));
    const legacy = jest.fn(() => ({ data: { logPriceClick: { success: true } } }));
    const { result } = renderLogger([
      { request: { query: LOG_PRICE_CLICK, variables: { ...baseVars, placement: 'event' } }, result: logged },
      { request: { query: LOG_PRICE_CLICK_LEGACY, variables: baseVars }, result: legacy },
    ]);

    act(() => result.current('tcgplayer', click));

    await waitFor(() => expect(logged).toHaveBeenCalled());
    expect(legacy).not.toHaveBeenCalled();
  });

  it('falls back to the old mutation, without throwing, when the API predates placement', async () => {
    const legacy = jest.fn(() => ({ data: { logPriceClick: { success: true } } }));
    const { result } = renderLogger([
      { request: { query: LOG_PRICE_CLICK, variables: { ...baseVars, placement: 'event' } }, error: unknownPlacementError() },
      { request: { query: LOG_PRICE_CLICK_LEGACY, variables: baseVars }, result: legacy },
    ]);

    act(() => result.current('tcgplayer', click));

    await waitFor(() => expect(legacy).toHaveBeenCalled());
  });

  it('swallows other logging failures without retrying', async () => {
    const legacy = jest.fn(() => ({ data: { logPriceClick: { success: true } } }));
    const { result } = renderLogger([
      { request: { query: LOG_PRICE_CLICK, variables: { ...baseVars, placement: 'event' } }, error: new Error('offline') },
      { request: { query: LOG_PRICE_CLICK_LEGACY, variables: baseVars }, result: legacy },
    ]);

    act(() => result.current('tcgplayer', click));

    // Give the rejected request a chance to settle; nothing should be retried or thrown.
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(legacy).not.toHaveBeenCalled();
  });
});
