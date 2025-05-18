import React, { useState, useEffect } from 'react';
import { Alert } from 'antd';
import { CodeOutlined } from '@ant-design/icons';
import AgentChat from '../components/AgentChat';
import { getAgentById } from '../utils/agentService';
import { sendStreamMessage, simulateStreamResponse } from '../utils/streamService';
import { Agent } from '../types';
import { ChatMessage } from '../components/AgentChat';
import './CodeReviewAgent.less';

// 消息历史记录 - 用于API请求
interface MessageHistory {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * 代码评审代理页面
 */
const CodeReviewAgent: React.FC = () => {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initialMessages, setInitialMessages] = useState<ChatMessage[]>([]);
  const [useRealApi, setUseRealApi] = useState(true); // 是否使用真实API而非模拟
  const [messageHistory, setMessageHistory] = useState<MessageHistory[]>([]); // 消息历史记录

  // 加载代理信息
  useEffect(() => {
    const codeReviewAgent = getAgentById('code-review');

    if (codeReviewAgent) {
      setAgent(codeReviewAgent);

      // 初始的系统消息
      const systemMessage: MessageHistory = {
        role: 'system',
        content: '你是一个专业的代码评审助手，擅长分析代码质量、性能和安全性，并提供改进建议。',
      };

      setMessageHistory([systemMessage]);

      // 设置欢迎消息
      const welcomeMessage: ChatMessage = {
        id: 'welcome-msg',
        content: '欢迎使用代码评审助手！请粘贴您想要评审的代码，我会为您提供详细的分析和改进建议。',
        sender: 'agent',
        timestamp: new Date(),
      };

      setInitialMessages([welcomeMessage]);

      // 添加欢迎消息到历史记录
      setMessageHistory(prev => [
        ...prev,
        {
          role: 'assistant',
          content: welcomeMessage.content,
        },
      ]);

      // 检查是否处于开发环境，以决定是否使用模拟API
      if (process.env.NODE_ENV === 'development') {
        // 如果需要可以通过URL参数或其他方式控制是否使用真实API
        // const useReal = new URLSearchParams(window.location.search).get('useRealApi') === 'true';
        // setUseRealApi(useReal);
      }
    } else {
      setError('无法加载代码评审代理。请稍后再试。');
    }
  }, []);

  // 处理流式消息发送
  const handleSendStreamMessage = async (
    message: string,
    onChunk?: (text: string) => void
  ): Promise<void> => {
    try {
      if (!agent) throw new Error('代理未加载');

      // 添加用户消息到历史记录
      const userMessage: MessageHistory = {
        role: 'user',
        content: message,
      };

      const updatedHistory = [...messageHistory, userMessage];
      setMessageHistory(updatedHistory);

      // 成功回调 - 添加助手响应到历史记录
      const onComplete = (fullText: string) => {
        console.log('流式消息完成:', fullText.length);

        // 添加助手响应到历史记录
        setMessageHistory(prev => [
          ...prev,
          {
            role: 'assistant',
            content: fullText,
          },
        ]);
      };

      // 错误回调
      const onError = (error: Error) => {
        console.error('流式通信错误:', error);
      };

      // 使用真实API或模拟API
      if (useRealApi) {
        await sendStreamMessage(
          message,
          onChunk ||
            ((text: string) => {
              /* 默认空回调 */
            }),
          onComplete,
          onError,
          updatedHistory
        );
      } else {
        await simulateStreamResponse(
          message,
          onChunk ||
            ((text: string) => {
              /* 默认空回调 */
            }),
          onComplete,
          onError
        );
      }
    } catch (error) {
      console.error('发送消息错误:', error);
      throw error;
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
            onSendMessage={handleSendStreamMessage}
            placeholderText="粘贴代码或输入您的问题..."
            initialMessages={initialMessages}
            useStreamApi={true}
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
