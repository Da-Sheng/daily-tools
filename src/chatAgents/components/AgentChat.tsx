import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, Spin, List, Typography, Avatar, Card, Divider } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import './AgentChat.less';

const { TextArea } = Input;
const { Title, Paragraph, Text } = Typography;

// 消息类型
export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

// 代理属性接口
export interface AgentChatProps {
  agentName: string;
  agentDescription: string;
  agentAvatar?: string;
  apiEndpoint: string;
  onSendMessage?: (message: string) => Promise<string>;
  placeholderText?: string;
  initialMessages?: ChatMessage[];
}

/**
 * 通用代理聊天组件
 * 可配置不同的代理名称、描述和API端点
 */
const AgentChat: React.FC<AgentChatProps> = ({
  agentName,
  agentDescription,
  agentAvatar,
  apiEndpoint,
  onSendMessage,
  placeholderText = '请输入您的问题...',
  initialMessages = [],
}) => {
  // 状态管理
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到最新消息
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // 生成唯一ID
  const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // 发送消息处理
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // 添加用户消息
    const userMessage: ChatMessage = {
      id: generateId(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // 两种使用方式：自定义处理或默认API调用
      let response;
      if (onSendMessage) {
        response = await onSendMessage(inputValue);
      } else {
        // 默认API调用逻辑
        const result = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: inputValue }),
        });
        const data = await result.json();
        response = data.response;
      }

      // 添加代理回复
      const agentMessage: ChatMessage = {
        id: generateId(),
        content: response || '抱歉，我无法处理您的请求。',
        sender: 'agent',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      console.error('消息发送错误:', error);

      // 添加错误消息
      const errorMessage: ChatMessage = {
        id: generateId(),
        content: '抱歉，处理您的请求时出现错误。请稍后再试。',
        sender: 'agent',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // 按Enter键发送消息
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="agent-chat-container">
      {/* 代理信息头部 */}
      <Card className="agent-header">
        <div className="agent-info">
          <Avatar size={64} icon={<RobotOutlined />} src={agentAvatar} className="agent-avatar" />
          <div className="agent-details">
            <Title level={4}>{agentName}</Title>
            <Paragraph>{agentDescription}</Paragraph>
          </div>
        </div>
      </Card>

      <Divider />

      {/* 消息列表 */}
      <div className="messages-container">
        <List
          itemLayout="horizontal"
          dataSource={messages}
          renderItem={message => (
            <List.Item
              className={`message-item ${
                message.sender === 'user' ? 'user-message' : 'agent-message'
              }`}
            >
              <List.Item.Meta
                avatar={
                  message.sender === 'user' ? (
                    <Avatar icon={<UserOutlined />} />
                  ) : (
                    <Avatar icon={<RobotOutlined />} src={agentAvatar} />
                  )
                }
                title={message.sender === 'user' ? '您' : agentName}
                description={
                  <div className="message-content">
                    {message.content}
                    <div className="message-timestamp">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
        <div ref={messagesEndRef} />

        {/* 加载指示器 */}
        {isLoading && (
          <div className="loading-indicator">
            <Spin tip="思考中..." />
          </div>
        )}
      </div>

      {/* 输入区域 */}
      <div className="input-container">
        <TextArea
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholderText}
          autoSize={{ minRows: 2, maxRows: 6 }}
          disabled={isLoading}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSendMessage}
          disabled={isLoading || !inputValue.trim()}
          className="send-button"
        >
          发送
        </Button>
      </div>
    </div>
  );
};

export default AgentChat;
