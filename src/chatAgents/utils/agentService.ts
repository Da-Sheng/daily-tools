import { Agent, AgentType } from '../types';

// 默认API基础URL
const API_BASE_URL = process.env.API_BASE_URL || 'https://api.nizbarkwt.online';

// 内置的代理列表（固定写死）
const AGENTS: Agent[] = [
  {
    id: 'code-review',
    name: '代码评审助手',
    description: '我可以帮助你评审代码，找出潜在的问题并提供改进建议。',
    avatar: '/images/agents/code-review.png',
    apiEndpoint: `${API_BASE_URL}/agents/code-review`,
    type: AgentType.CodeReview,
    isActive: true,
  },
  {
    id: 'bug-fix',
    name: '错误修复专家',
    description: '提供你的错误代码，我会帮你分析问题并提供修复方案。',
    avatar: '/images/agents/bug-fix.png',
    apiEndpoint: `${API_BASE_URL}/agents/bug-fix`,
    type: AgentType.BugFix,
    isActive: true,
  },
  {
    id: 'feature-assistant',
    name: '功能开发助手',
    description: '帮助你设计和实现新功能，提供代码示例和最佳实践。',
    avatar: '/images/agents/feature-assistant.png',
    apiEndpoint: `${API_BASE_URL}/agents/feature-assistant`,
    type: AgentType.FeatureAssistant,
    isActive: true,
  },
  {
    id: 'document-generator',
    name: '文档生成器',
    description: '根据代码自动生成文档，包括API文档、README和使用说明。',
    avatar: '/images/agents/document-generator.png',
    apiEndpoint: `${API_BASE_URL}/agents/document-generator`,
    type: AgentType.DocumentGenerator,
    isActive: false, // 标记为未启用
  },
];

// 获取所有代理
export const getAllAgents = (): Agent[] => {
  return AGENTS;
};

// 获取激活的代理
export const getActiveAgents = (): Agent[] => {
  return AGENTS.filter(agent => agent.isActive);
};

// 根据ID获取代理
export const getAgentById = (id: string): Agent | undefined => {
  return AGENTS.find(agent => agent.id === id);
};

// 根据类型获取代理
export const getAgentsByType = (type: AgentType): Agent[] => {
  return AGENTS.filter(agent => agent.type === type);
};

// 模拟发送消息到代理
export const sendMessageToAgent = async (agentId: string, message: string): Promise<string> => {
  const agent = getAgentById(agentId);

  if (!agent) {
    throw new Error(`Agent with ID ${agentId} not found`);
  }

  // 模拟API调用延迟
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 根据代理类型返回不同的模拟响应
  switch (agent.type) {
    case AgentType.CodeReview:
      return `代码评审结果:\n\n以下是对您提供代码的分析:\n\n1. 代码质量: 良好\n2. 潜在问题: 发现了一些可能的性能优化点\n3. 建议: 考虑添加更多的注释和单元测试\n\n详细分析:\n${
        message.length > 50
          ? '您的代码结构清晰，但有以下几点可以改进...'
          : '请提供更多代码以进行详细分析'
      }`;

    case AgentType.BugFix:
      return `错误修复建议:\n\n分析结果:\n1. 可能的错误原因: 类型错误或资源未正确初始化\n2. 修复方案: 请检查变量初始化和错误处理\n\n建议代码:\n\`\`\`\n// 修复后的代码示例\ntry {\n  // 您的逻辑\n} catch (error) {\n  console.error('处理错误', error);\n}\n\`\`\``;

    case AgentType.FeatureAssistant:
      return `功能开发建议:\n\n基于您的描述，我建议以下实现方案:\n\n1. 架构设计:\n   - 使用模块化设计\n   - 考虑可扩展性\n\n2. 技术选择:\n   - 前端: React + TypeScript\n   - 状态管理: Context API或Redux\n\n3. 实现步骤:\n   - 第一步: 创建基础组件\n   - 第二步: 实现业务逻辑\n   - 第三步: 添加样式和交互`;

    case AgentType.DocumentGenerator:
      return `文档生成结果:\n\n# 项目文档\n\n## 概述\n该项目实现了...\n\n## API参考\n\n### 主要函数\n\`function example(): void\`\n- 描述: 示例函数\n- 参数: 无\n- 返回值: 无\n\n## 使用示例\n\`\`\`\n// 示例代码\nconst result = example();\n\`\`\``;

    default:
      return '收到您的消息，但我目前不支持这种请求类型。';
  }
};
