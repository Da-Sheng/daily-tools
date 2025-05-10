import { RestDataSource } from '../data/restDataSource';

// 创建REST数据源实例
const dataSource = new RestDataSource();

// 解析器定义
export const resolvers = {
  Query: {
    // 获取所有分类
    categories: async () => {
      console.log('GraphQL解析器: 获取所有分类');
      try {
        const categories = await dataSource.getAllCategories();
        console.log('获取分类成功:', categories);
        return categories;
      } catch (error) {
        console.error('获取分类列表失败:', error);
        throw error;
      }
    },

    // 根据ID获取分类
    category: async (_: any, { id }: { id: string }) => {
      console.log(`GraphQL解析器: 获取分类 ${id}`);
      try {
        const category = await dataSource.getCategoryById(id);
        console.log('获取分类成功:', category);
        return category;
      } catch (error) {
        console.error(`获取分类 ${id} 失败:`, error);
        return null;
      }
    },

    // 获取所有工具
    tools: async () => {
      console.log('GraphQL解析器: 获取所有工具');
      try {
        const tools = await dataSource.getAllTools();
        console.log('获取工具成功:', tools);
        return tools;
      } catch (error) {
        console.error('获取工具列表失败:', error);
        throw error;
      }
    },

    // 根据ID获取工具
    tool: async (_: any, { id }: { id: string }) => {
      console.log(`GraphQL解析器: 获取工具 ${id}`);
      try {
        const tool = await dataSource.getToolById(id);
        console.log('获取工具成功:', tool);
        return tool;
      } catch (error) {
        console.error(`获取工具 ${id} 失败:`, error);
        return null;
      }
    },

    // 根据分类ID获取工具
    toolsByCategory: async (_: any, { categoryId }: { categoryId: string }) => {
      console.log(`GraphQL解析器: 获取分类 ${categoryId} 下的工具`);
      try {
        const tools = await dataSource.getToolsByCategoryId(categoryId);
        console.log('获取分类下工具成功:', tools);
        return tools;
      } catch (error) {
        console.error(`获取分类 ${categoryId} 下的工具失败:`, error);
        throw error;
      }
    },
  },

  // 解析ToolItem中的category字段
  ToolItem: {
    category: async (parent: { categoryId: string }) => {
      if (!parent.categoryId) return null;

      console.log(`GraphQL解析器: 解析工具分类 ${parent.categoryId}`);
      try {
        const category = await dataSource.getCategoryById(parent.categoryId);
        console.log('解析工具分类成功:', category);
        return category;
      } catch (error) {
        console.error(`获取工具分类 ${parent.categoryId} 失败:`, error);
        return null;
      }
    },
  },
};
