import React, { useState, useEffect } from 'react';
import { Alert } from 'antd';
import { CodeOutlined } from '@ant-design/icons';
import AgentChat from '../components/AgentChat';
import { getAgentById, sendMessageToAgent } from '../utils/agentService';
import { Agent } from '../types';
import { ChatMessage } from '../components/AgentChat';
import './CodeReviewAgent.less';

/**
 * 代码评审代理页面
 */
const CodeReviewAgent: React.FC = () => {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initialMessages, setInitialMessages] = useState<ChatMessage[]>([]);

  // 加载代理信息
  useEffect(() => {
    const codeReviewAgent = getAgentById('code-review');

    if (codeReviewAgent) {
      setAgent(codeReviewAgent);

      // 设置欢迎消息
      setInitialMessages([
        {
          id: 'welcome-msg',
          content:
            '欢迎使用代码评审助手！请粘贴您想要评审的代码，我会为您提供详细的分析和改进建议。',
          sender: 'agent',
          timestamp: new Date(),
        },
      ]);
    } else {
      setError('无法加载代码评审代理。请稍后再试。');
    }
  }, []);

  // 处理发送消息
  const handleSendMessage = async (message: string): Promise<string> => {
    try {
      if (!agent) throw new Error('代理未加载');
      return await sendMessageToAgent(agent.id, message);
    } catch (error) {
      console.error('发送消息错误:', error);
      return '抱歉，处理您的请求时出现错误。请稍后再试。';
    }
  };

  return (
    <div className="code-review-container">
      {error ? (
        <Alert message="错误" description={error} type="error" showIcon style={{ margin: 16 }} />
      ) : agent ? (
        <div className="chat-fullscreen">
          <AgentChat
            agentName={agent.name}
            agentDescription={agent.description}
            agentAvatar={agent.avatar}
            apiEndpoint={agent.apiEndpoint}
            onSendMessage={handleSendMessage}
            placeholderText="粘贴代码或输入您的问题..."
            initialMessages={initialMessages}
          />
        </div>
      ) : (
        <div className="loading-container">
          <CodeOutlined spin />
          <p>加载中...</p>
        </div>
      )}
    </div>
  );
};

export default CodeReviewAgent;
