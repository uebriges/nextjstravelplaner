/** @jsxImportSource @emotion/react */
import {
  ApolloClient,
  ApolloProvider,
  DefaultOptions,
  InMemoryCache
} from '@apollo/client';
import { Global } from '@emotion/react';
import { StylesProvider } from '@mui/styles';
import { AppProps } from 'next/app';
// import '../styles/globals.css';
import { globalStyles } from '../styles/styles';

import { ThemeProvider, createMuiTheme, makeStyles } from '@mui/material/styles';

const theme = createMuiTheme();

// const useStyles = makeStyles((theme) => {
//   root: {
//     // some CSS that accesses the theme
//   }
// });


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
  // const classes = useStyles();
  return (
    <>
      <Global styles={globalStyles} />
      <ThemeProvider theme={theme}>
        <StylesProvider injectFirst>
          <ApolloProvider client={client}>
            <Component {...pageProps} />
          </ApolloProvider>
        </StylesProvider>
      </ThemeProvider>;
    </>
  );
}

export default MyApp;
