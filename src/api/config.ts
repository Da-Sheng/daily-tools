/**
 * API配置文件 - 集中管理所有API基础URL和端点
 */

// 定义默认API URL - 在任何情况下都有一个可用值
const DEFAULT_DEV_API_URL = 'http://localhost:8787';
const DEFAULT_PROD_API_URL = 'https://api.nizbarkwt.online';

// 直接使用环境变量或默认值
// 注意：这里不再引用 typeof process，因为webpack已经处理了这些变量
const isDevelopment = process.env.NODE_ENV !== 'production';
const envApiBaseUrl = process.env.API_BASE_URL;

// API基础URL配置
export const API_BASE_URL =
  envApiBaseUrl || (isDevelopment ? DEFAULT_DEV_API_URL : DEFAULT_PROD_API_URL);

// API路径配置
export const API_ENDPOINTS = {
  GRAPHQL: '/graphql', // GraphQL端点
  CATEGORIES: '/categories', // 分类接口
  TOOLS: '/tools', // 工具接口
};

// 构建完整API URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

// 导出GraphQL端点
export const GRAPHQL_URL = buildApiUrl(API_ENDPOINTS.GRAPHQL);

// 打印当前环境和API配置信息
console.log(`[API配置] 环境: ${isDevelopment ? '开发环境' : '生产环境'}, BaseURL: ${API_BASE_URL}`);
