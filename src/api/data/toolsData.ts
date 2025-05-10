import { ToolCategory, ToolItem } from '../../types';
import { RestDataSource } from './restDataSource';

// 创建REST数据源实例
const restDataSource = new RestDataSource();

// 数据访问类 - 不再依赖静态工具数据
export class ToolsDataSource {
  // 获取所有分类
  async getAllCategories(): Promise<ToolCategory[]> {
    return restDataSource.getAllCategories();
  }

  // 根据ID获取分类
  async getCategoryById(id: string): Promise<ToolCategory | undefined> {
    try {
      return await restDataSource.getCategoryById(id);
    } catch (error) {
      console.error(`获取分类 ${id} 失败:`, error);
      return undefined;
    }
  }

  // 获取所有工具
  async getAllTools(): Promise<ToolItem[]> {
    return restDataSource.getAllTools();
  }

  // 根据ID获取工具
  async getToolById(id: string): Promise<ToolItem | undefined> {
    try {
      return await restDataSource.getToolById(id);
    } catch (error) {
      console.error(`获取工具 ${id} 失败:`, error);
      return undefined;
    }
  }

  // 根据分类ID获取工具
  async getToolsByCategoryId(categoryId: string): Promise<ToolItem[]> {
    return restDataSource.getToolsByCategoryId(categoryId);
  }
}
