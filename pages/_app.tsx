/** @jsxImportSource @emotion/react */
import {
  ApolloClient,
  ApolloProvider,
  DefaultOptions,
  InMemoryCache
} from '@apollo/client';
import { Global } from '@emotion/react';
import { StylesProvider } from '@material-ui/styles';
import { AppProps } from 'next/app';
// import '../styles/globals.css';
import { globalStyles } from '../styles/styles';

const defaultOptions: DefaultOptions = {
  watchQuery: {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'ignore',
  },
  query: {
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
  },
  mutate: {
    errorPolicy: 'all',
  },
};

let client: any;

if (process.env.NODE_ENV === 'production') {
  client = new ApolloClient({
    uri: 'https://travelplaner.herokuapp.com/api/graphql',
    cache: new InMemoryCache({ addTypename: false }),
    defaultOptions,
  });
} else if (process.env.NODE_ENV === 'development') {
  client = new ApolloClient({
    uri: 'http://localhost:3000/api/graphql',
    cache: new InMemoryCache({ addTypename: false }),
    defaultOptions,
  });
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Global styles={globalStyles} />
      <StylesProvider injectFirst>
        <ApolloProvider client={client}>
          <Component {...pageProps} />
        </ApolloProvider>
      </StylesProvider>
    </>
  );
}

export default MyApp;
