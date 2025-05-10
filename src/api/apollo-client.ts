import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
  WatchQueryFetchPolicy,
  FetchPolicy,
  ErrorPolicy,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';

// 错误处理链接
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.error(`[GraphQL错误]: 消息: ${message}, 位置: ${locations}, 路径: ${path}`)
    );
  }
  if (networkError) console.error(`[网络错误]: ${networkError}`);
});

// GraphQL链接配置
const httpLink = new HttpLink({
  uri: 'https://api.nizbarkwt.online/graphql',
});

// 创建Apollo客户端实例
const client = new ApolloClient({
  link: ApolloLink.from([errorLink, httpLink]),
  cache: new InMemoryCache(),
  connectToDevTools: process.env.NODE_ENV !== 'production',
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only' as WatchQueryFetchPolicy,
      errorPolicy: 'all' as ErrorPolicy,
    },
    query: {
      fetchPolicy: 'network-only' as FetchPolicy,
      errorPolicy: 'all' as ErrorPolicy,
    },
    mutate: {
      errorPolicy: 'all' as ErrorPolicy,
    },
  },
});

// 提供更清晰的错误信息
window.onerror = function (message, source, lineno, colno, error) {
  console.error('全局错误:', { message, source, lineno, colno, error });
};

console.log('Apollo Client已初始化');

export default client;
