import { gql } from '@apollo/client';

// 获取所有分类
export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
      icon
      description
    }
  }
`;

// 获取特定分类
export const GET_CATEGORY = gql`
  query GetCategory($id: ID!) {
    category(id: $id) {
      id
      name
      icon
      description
    }
  }
`;

// 获取所有工具
export const GET_TOOLS = gql`
  query GetTools {
    tools {
      id
      name
      description
      icon
      path
      categoryId
    }
  }
`;

// 获取特定工具
export const GET_TOOL = gql`
  query GetTool($id: ID!) {
    tool(id: $id) {
      id
      name
      description
      icon
      path
      categoryId
    }
  }
`;

// 获取特定分类下的工具
export const GET_TOOLS_BY_CATEGORY = gql`
  query GetToolsByCategory($categoryId: ID!) {
    toolsByCategory(categoryId: $categoryId) {
      id
      name
      description
      icon
      path
      categoryId
    }
  }
`;

// 获取分类详情（用于工具分类字段）
export const GET_TOOL_CATEGORY = gql`
  query GetToolCategory($categoryId: ID!) {
    category(id: $categoryId) {
      id
      name
      icon
      description
    }
  }
`;
