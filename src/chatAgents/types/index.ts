// 代理类型接口
export interface Agent {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  apiEndpoint: string;
  type: AgentType;
  isActive: boolean;
}

// 代理类型枚举
export enum AgentType {
  CodeReview = 'codeReview',
  BugFix = 'bugFix',
  FeatureAssistant = 'featureAssistant',
  DocumentGenerator = 'documentGenerator',
}

// 代理API响应接口
export interface AgentResponse {
  response: string;
  status: 'success' | 'error';
  metadata?: Record<string, any>;
}
