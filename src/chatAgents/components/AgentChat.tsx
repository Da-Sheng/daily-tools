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
  sender: 'user' | 'agent' | 'system';
  timestamp: Date;
}

// 代理属性接口
export interface AgentChatProps {
  agentName: string;
  agentDescription: string;
  agentAvatar?: string;
  apiEndpoint: string;
  onSendMessage: (message: string, onChunk?: (text: string) => void) => Promise<string | void>;
  placeholderText?: string;
  initialMessages?: ChatMessage[];
  useStreamApi?: boolean;
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
  useStreamApi = false,
}) => {
  // 状态管理
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到最新消息
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // 生成唯一ID
  const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // 处理消息发送
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // 添加用户消息
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    console.log('AgentChat: 发送消息', inputValue);
    console.log('AgentChat: useStreamApi =', useStreamApi);
    console.log('AgentChat: onSendMessage类型 =', typeof onSendMessage);

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsSubmitting(true);

    try {
      // 如果使用流式API
      if (useStreamApi && onSendMessage) {
        // 创建一个空的代理回复消息
        const agentMessageId = `agent-${Date.now()}`;
        const agentMessage: ChatMessage = {
          id: agentMessageId,
          content: '',
          sender: 'agent',
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, agentMessage]);

        // 处理流式回复
        const handleChunk = (text: string) => {
          setMessages(prev =>
            prev.map(msg => (msg.id === agentMessageId ? { ...msg, content: text } : msg))
          );
        };

        await onSendMessage(inputValue, handleChunk);
      }
      // 使用普通API
      else if (onSendMessage) {
        const response = await onSendMessage(inputValue);

        // 添加代理回复
        if (response) {
          const agentMessage: ChatMessage = {
            id: `agent-${Date.now()}`,
            content: response,
            sender: 'agent',
            timestamp: new Date(),
          };

          setMessages(prev => [...prev, agentMessage]);
        }
      }
    } catch (error) {
      console.error('发送消息错误:', error);

      // 添加错误消息
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        content: '发送消息时出现错误，请稍后再试。',
        sender: 'system',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSubmitting(false);
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
                message.sender === 'user'
                  ? 'user-message'
                  : message.sender === 'agent'
                  ? 'agent-message'
                  : 'system-message'
              }`}
            >
              <List.Item.Meta
                avatar={
                  message.sender === 'user' ? (
                    <Avatar icon={<UserOutlined />} />
                  ) : message.sender === 'agent' ? (
                    <Avatar icon={<RobotOutlined />} src={agentAvatar} />
                  ) : (
                    <Avatar icon={<RobotOutlined />} />
                  )
                }
                title={
                  message.sender === 'user' ? '您' : message.sender === 'agent' ? agentName : '系统'
                }
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
        {isSubmitting && (
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
          disabled={isSubmitting}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSendMessage}
          disabled={isSubmitting || !inputValue.trim()}
          className="send-button"
        >
          发送
        </Button>
      </div>
    </div>
  );
};

export default AgentChat;
