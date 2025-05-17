import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AgentsHome from './pages/AgentsHome';
import CodeReviewAgent from './pages/CodeReviewAgent';

/**
 * 聊天代理路由组件
 */
const ChatAgents: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AgentsHome />} />
      <Route path="/code-review" element={<CodeReviewAgent />} />
      {/* 未来可以添加更多代理路由 */}
    </Routes>
  );
};

export default ChatAgents;
