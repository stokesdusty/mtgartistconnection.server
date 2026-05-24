import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from "react-router-dom";
import { ApolloClient, ApolloProvider, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from '@apollo/client/link/context';
import { persistCache, LocalStorageWrapper } from 'apollo3-cache-persist';
import { Provider } from 'react-redux';
import store from './store/store';

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

const client = new ApolloClient({
  link: authLink.concat(httpLink),
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
    <Provider store={store}>
      <ApolloProvider client={client}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ApolloProvider>
    </Provider>
  );
}

render();
reportWebVitals();
