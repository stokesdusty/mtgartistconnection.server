import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { ApolloClient, ApolloProvider, InMemoryCache, createHttpLink, Observable } from "@apollo/client";
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { persistCache, LocalStorageWrapper } from 'apollo3-cache-persist';
import { Provider } from 'react-redux';
import store from './store/store';
import { logout, tokenRefreshed, refreshAccessToken } from './store/auth-slice';

const CACHE_KEY = 'apollo-cache';
const CACHE_TS_KEY = 'apollo-cache-ts';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const cache = new InMemoryCache();

const httpLink = createHttpLink({
  uri: "https://mtgartistconnectionwebservice-production.up.railway.app/graphql",
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  const isAuthError = graphQLErrors?.some(e =>
    e.message === 'Authentication required. Please log in.'
  );
  if (!isAuthError) return;

  return new Observable(observer => {
    refreshAccessToken()
      .then(newToken => {
        if (!newToken) {
          store.dispatch(logout());
          observer.complete();
          return;
        }
        store.dispatch(tokenRefreshed(newToken));
        operation.setContext(({ headers = {} }: { headers: Record<string, string> }) => ({
          headers: { ...headers, authorization: `Bearer ${newToken}` },
        }));
        forward(operation).subscribe({
          next: observer.next.bind(observer),
          error: observer.error.bind(observer),
          complete: observer.complete.bind(observer),
        });
      })
      .catch(() => {
        store.dispatch(logout());
        observer.complete();
      });
  });
});

const client = new ApolloClient({
  link: errorLink.concat(authLink).concat(httpLink),
  cache,
});

async function render() {
  const ts = localStorage.getItem(CACHE_TS_KEY);
  if (!ts || Date.now() - Number(ts) > CACHE_TTL_MS) {
    localStorage.removeItem(CACHE_KEY);
    localStorage.setItem(CACHE_TS_KEY, String(Date.now()));
  }

  await persistCache({
    cache,
    storage: new LocalStorageWrapper(window.localStorage),
    key: CACHE_KEY,
  });

  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
  );

  root.render(
    <HelmetProvider>
      <Provider store={store}>
        <ApolloProvider client={client}>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <App />
          </BrowserRouter>
        </ApolloProvider>
      </Provider>
    </HelmetProvider>
  );
}

render();
reportWebVitals();
