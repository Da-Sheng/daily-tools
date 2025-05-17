import { ToolCategory, ToolItem } from '../../types';
import { API_BASE_URL } from '../config';

// API响应接口
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  code: number;
}

// API端点枚举
enum ApiEndpoint {
  Categories = '/categories',
  Tools = '/tools',
}

export class RestDataSource {
  // 基础 fetch 方法
  private async fetchFromApi<T>(endpoint: string): Promise<T> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      console.log(`请求API: ${url}`);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP错误! 状态: ${response.status}`);
      }

      const result: ApiResponse<T> = await response.json();
      return result.data;
    } catch (error) {
      console.error('API请求错误:', error);
      throw error;
    }
  }

  // 获取所有分类
  async getAllCategories(): Promise<ToolCategory[]> {
    return this.fetchFromApi<ToolCategory[]>(ApiEndpoint.Categories);
  }

  // 根据ID获取分类
  async getCategoryById(id: string): Promise<ToolCategory> {
    return this.fetchFromApi<ToolCategory>(`${ApiEndpoint.Categories}/${id}`);
  }

  // 获取所有工具
  async getAllTools(): Promise<ToolItem[]> {
    return this.fetchFromApi<ToolItem[]>(ApiEndpoint.Tools);
  }

  // 根据ID获取工具
  async getToolById(id: string): Promise<ToolItem> {
    return this.fetchFromApi<ToolItem>(`${ApiEndpoint.Tools}/${id}`);
  }

  // 根据分类ID获取工具
  async getToolsByCategoryId(categoryId: string): Promise<ToolItem[]> {
    return this.fetchFromApi<ToolItem[]>(`${ApiEndpoint.Categories}/${categoryId}/tools`);
  }
}
