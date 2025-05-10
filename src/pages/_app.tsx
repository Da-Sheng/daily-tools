import { AppProps } from 'next/app';
import { ApolloProvider } from '@apollo/client';
import apolloClient from '../api/apollo-client';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={apolloClient}>
      <Component {...pageProps} />
    </ApolloProvider>
  );
}

export default MyApp;
