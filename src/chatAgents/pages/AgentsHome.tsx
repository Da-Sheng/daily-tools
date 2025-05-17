import React from 'react';
import { Card, Typography, Row, Col, Button, Badge } from 'antd';
import { RobotOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { getActiveAgents } from '../utils/agentService';
import './AgentsHome.less';

const { Title, Paragraph } = Typography;

/**
 * 聊天代理入口页面
 */
const AgentsHome: React.FC = () => {
  // 获取激活的代理
  const agents = getActiveAgents();

  return (
    <div className="agents-home-container">
      <div className="agents-header">
        <Title level={2}>
          <RobotOutlined /> AI 助手
        </Title>
        <Paragraph>选择一个AI助手来帮助你解决问题。每个助手都有特定的专长领域。</Paragraph>
      </div>

      <Row gutter={[24, 24]} className="agents-grid">
        {agents.map(agent => (
          <Col xs={24} sm={12} xl={8} key={agent.id}>
            <Badge.Ribbon
              text="推荐"
              color="green"
              style={{ display: agent.id === 'code-review' ? 'block' : 'none' }}
            >
              <Card
                hoverable
                className="agent-card"
                actions={[
                  <Link to={`/agents/${agent.id}`} key="enter">
                    <Button type="primary" icon={<ArrowRightOutlined />}>
                      开始对话
                    </Button>
                  </Link>,
                ]}
              >
                <Card.Meta
                  avatar={
                    <div className="agent-avatar-wrapper">
                      {agent.avatar ? (
                        <img src={agent.avatar} alt={agent.name} className="agent-avatar" />
                      ) : (
                        <RobotOutlined className="agent-avatar-icon" />
                      )}
                    </div>
                  }
                  title={agent.name}
                  description={agent.description}
                />
              </Card>
            </Badge.Ribbon>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default AgentsHome;
