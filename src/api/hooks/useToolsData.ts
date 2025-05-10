import { useQuery, useApolloClient } from '@apollo/client';
import {
  GET_CATEGORIES,
  GET_CATEGORY,
  GET_TOOLS,
  GET_TOOL,
  GET_TOOLS_BY_CATEGORY,
  GET_TOOL_CATEGORY,
} from '../queries/toolQueries';
import type { ToolCategory, ToolItem } from '../types';
import { useState, useEffect } from 'react';

// 自定义hook，提供统一的数据获取接口
export const useToolsData = () => {
  // 检查Apollo客户端是否可用
  const client = useApolloClient();
  console.log('Apollo Client:', client);

  // 获取所有分类
  const getCategories = () => {
    try {
      const { data, loading, error } = useQuery(GET_CATEGORIES);
      return {
        categories: data?.categories as ToolCategory[] | undefined,
        loading,
        error,
      };
    } catch (error) {
      console.error('获取分类数据时出错:', error);
      return {
        categories: undefined,
        loading: false,
        error: error as Error,
      };
    }
  };

  // 获取特定分类
  const getCategory = (id: string | undefined) => {
    if (!id) {
      return {
        category: undefined,
        loading: false,
        error: new Error('分类ID未提供'),
      };
    }

    try {
      const { data, loading, error } = useQuery(GET_CATEGORY, {
        variables: { id },
      });
      return {
        category: data?.category as ToolCategory | undefined,
        loading,
        error,
      };
    } catch (error) {
      console.error(`获取分类 ${id} 时出错:`, error);
      return {
        category: undefined,
        loading: false,
        error: error as Error,
      };
    }
  };

  // 获取所有工具
  const getTools = () => {
    try {
      const { data, loading, error } = useQuery(GET_TOOLS);

      // 如果成功获取工具列表，为每个工具加载分类信息
      const [tools, setTools] = useState<ToolItem[] | undefined>(undefined);

      useEffect(() => {
        if (data?.tools && !loading && !error) {
          const toolsWithCategories = async () => {
            // 获取所有分类
            const categoriesResponse = await client.query({
              query: GET_CATEGORIES,
            });
            const categories = categoriesResponse.data?.categories || [];

            // 为每个工具项添加分类信息
            const toolsWithCategory = data.tools.map((tool: ToolItem) => {
              const category = categories.find((c: ToolCategory) => c.id === tool.categoryId);
              return { ...tool, category };
            });

            setTools(toolsWithCategory);
          };

          toolsWithCategories();
        }
      }, [data, loading, error]);

      return {
        tools: tools || (data?.tools as ToolItem[] | undefined),
        loading,
        error,
      };
    } catch (error) {
      console.error('获取工具数据时出错:', error);
      return {
        tools: undefined,
        loading: false,
        error: error as Error,
      };
    }
  };

  // 获取特定工具
  const getTool = (id: string | undefined) => {
    if (!id) {
      return {
        tool: undefined,
        loading: false,
        error: new Error('工具ID未提供'),
      };
    }

    try {
      const { data, loading, error } = useQuery(GET_TOOL, {
        variables: { id },
      });

      // 加载工具的分类信息
      const [tool, setTool] = useState<ToolItem | undefined>(undefined);

      useEffect(() => {
        if (data?.tool && !loading && !error) {
          const loadCategory = async () => {
            try {
              const categoryId = data.tool.categoryId;
              const categoryResponse = await client.query({
                query: GET_TOOL_CATEGORY,
                variables: { categoryId },
              });

              const updatedTool = {
                ...data.tool,
                category: categoryResponse.data?.category,
              };

              setTool(updatedTool);
            } catch (categoryError) {
              console.error('加载工具分类信息时出错:', categoryError);
              setTool(data.tool);
            }
          };

          loadCategory();
        }
      }, [data, loading, error]);

      return {
        tool: tool || (data?.tool as ToolItem | undefined),
        loading,
        error,
      };
    } catch (error) {
      console.error(`获取工具 ${id} 时出错:`, error);
      return {
        tool: undefined,
        loading: false,
        error: error as Error,
      };
    }
  };

  // 获取特定分类下的工具
  const getToolsByCategory = (categoryId: string | undefined) => {
    if (!categoryId) {
      return {
        tools: undefined,
        loading: false,
        error: new Error('分类ID未提供'),
      };
    }

    try {
      const { data, loading, error } = useQuery(GET_TOOLS_BY_CATEGORY, {
        variables: { categoryId },
      });

      // 获取分类信息
      const [category, setCategory] = useState<ToolCategory | undefined>(undefined);

      useEffect(() => {
        if (!loading && !error) {
          const loadCategory = async () => {
            try {
              const categoryResponse = await client.query({
                query: GET_CATEGORY,
                variables: { id: categoryId },
              });
              setCategory(categoryResponse.data?.category);
            } catch (categoryError) {
              console.error('加载分类信息时出错:', categoryError);
            }
          };

          loadCategory();
        }
      }, [loading, error]);

      return {
        tools: data?.toolsByCategory as ToolItem[] | undefined,
        category,
        loading,
        error,
      };
    } catch (error) {
      console.error(`获取分类 ${categoryId} 下的工具时出错:`, error);
      return {
        tools: undefined,
        category: undefined,
        loading: false,
        error: error as Error,
      };
    }
  };

  return {
    getCategories,
    getCategory,
    getTools,
    getTool,
    getToolsByCategory,
  };
};
