import React from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider } from 'antd';
import { ApolloProvider } from '@apollo/client';
import zhCN from 'antd/lib/locale/zh_CN';
import apolloClient from './api/apollo-client';
import App from './App';
import './styles/index.less';

const container = document.getElementById('root');
if (!container) throw new Error('Failed to find the root element');

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <ApolloProvider client={apolloClient}>
      <ConfigProvider locale={zhCN}>
        <App />
      </ConfigProvider>
    </ApolloProvider>
  </React.StrictMode>
);

console.log('应用程序已渲染');
