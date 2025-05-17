/**
 * API配置文件 - 集中管理所有API基础URL和端点
 */

// 获取当前环境
const isDevelopment = process.env.NODE_ENV !== 'production';

// API基础URL配置
export const API_BASE_URL = isDevelopment
  ? 'http://localhost:60772' // 开发环境
  : 'https://api.nizbarkwt.online'; // 生产环境

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
