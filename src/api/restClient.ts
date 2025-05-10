import { ToolCategory, ToolItem } from '../types';

// API 基础URL
const API_BASE_URL = 'https://api.nizbarkwt.online';

// API响应接口
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  code: number;
}

// REST API客户端
export const apiClient = {
  // 获取所有分类
  async getCategories(): Promise<ToolCategory[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (!response.ok) {
        throw new Error(`HTTP错误! 状态: ${response.status}`);
      }
      const result: ApiResponse<ToolCategory[]> = await response.json();
      return result.data;
    } catch (error) {
      console.error('获取分类列表失败:', error);
      throw error;
    }
  },

  // 获取特定分类
  async getCategory(id: string): Promise<ToolCategory> {
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP错误! 状态: ${response.status}`);
      }
      const result: ApiResponse<ToolCategory> = await response.json();
      return result.data;
    } catch (error) {
      console.error(`获取分类 ${id} 失败:`, error);
      throw error;
    }
  },

  // 获取所有工具
  async getTools(): Promise<ToolItem[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/tools`);
      if (!response.ok) {
        throw new Error(`HTTP错误! 状态: ${response.status}`);
      }
      const result: ApiResponse<ToolItem[]> = await response.json();
      return result.data;
    } catch (error) {
      console.error('获取工具列表失败:', error);
      throw error;
    }
  },

  // 获取特定工具
  async getTool(id: string): Promise<ToolItem> {
    try {
      const response = await fetch(`${API_BASE_URL}/tools/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP错误! 状态: ${response.status}`);
      }
      const result: ApiResponse<ToolItem> = await response.json();
      return result.data;
    } catch (error) {
      console.error(`获取工具 ${id} 失败:`, error);
      throw error;
    }
  },

  // 获取特定分类下的工具
  async getToolsByCategory(categoryId: string): Promise<ToolItem[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${categoryId}/tools`);
      if (!response.ok) {
        throw new Error(`HTTP错误! 状态: ${response.status}`);
      }
      const result: ApiResponse<ToolItem[]> = await response.json();
      return result.data;
    } catch (error) {
      console.error(`获取分类 ${categoryId} 下的工具失败:`, error);
      throw error;
    }
  },
};
