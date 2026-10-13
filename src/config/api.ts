// The GraphQL API. `npm run start:local` points this at the local webservice
// (`npm run dev:local` there); everything else uses production.
export const GRAPHQL_URL =
  process.env.REACT_APP_GRAPHQL_URL || 'https://mtgartistconnectionwebservice-production.up.railway.app/graphql';
