// 导入TS类型定义
import { ToolCategory, ToolItem } from '../../types';

// GraphQL类型定义
export const typeDefs = `#graphql
  type ToolCategory {
    id: ID!
    name: String!
    icon: String!
    description: String!
  }

  type ToolItem {
    id: ID!
    name: String!
    description: String!
    icon: String!
    path: String!
    categoryId: ID!
    category: ToolCategory
  }

  type Query {
    categories: [ToolCategory!]!
    category(id: ID!): ToolCategory
    tools: [ToolItem!]!
    tool(id: ID!): ToolItem
    toolsByCategory(categoryId: ID!): [ToolItem!]!
  }
`;

// 导出TS类型
export type { ToolCategory, ToolItem };
