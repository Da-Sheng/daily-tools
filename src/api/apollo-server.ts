import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { typeDefs } from './types';
import { resolvers } from './resolvers';

// 创建Apollo服务器实例
const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: formattedError => {
    // 添加更多错误信息用于调试
    console.error('GraphQL错误:', {
      message: formattedError.message,
      extensions: formattedError.extensions,
    });

    // 对客户端隐藏内部错误细节
    return {
      message: formattedError.message,
      extensions: {
        code: formattedError.extensions?.code || 'INTERNAL_SERVER_ERROR',
      },
    };
  },
});

console.log('Apollo Server已初始化');

// 这会在Next.js API路由中使用
export default startServerAndCreateNextHandler(server);
