import React from 'react';
import { render } from '@testing-library/react';
import { ApolloCache } from '@apollo/client';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import authReducer from './store/auth-slice';

interface RenderWithProvidersOptions {
  mocks?: MockedResponse[];
  route?: string;
  path?: string;
  preloadedState?: Record<string, unknown>;
  /** Mocks run without __typename, so pass a cache keyed by id when a test needs mutation results to update queries. */
  cache?: ApolloCache<any>;
}

export function renderWithProviders(
  ui: React.ReactElement,
  { mocks = [], route = '/', path = '/', preloadedState, cache }: RenderWithProvidersOptions = {},
) {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState,
  });

  return render(
    <Provider store={store}>
      <MockedProvider mocks={mocks} addTypename={false} cache={cache}>
        <HelmetProvider>
          <MemoryRouter initialEntries={[route]}>
            <Routes>
              <Route path={path} element={ui} />
            </Routes>
          </MemoryRouter>
        </HelmetProvider>
      </MockedProvider>
    </Provider>
  );
}
