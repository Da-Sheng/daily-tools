import React from 'react';
import { Typography, Card, Space, Divider, Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import {
  BankOutlined,
  SwapOutlined,
  CodeOutlined,
  CalendarOutlined,
  HomeOutlined,
  DollarOutlined,
  CalculatorOutlined,
  KeyOutlined,
} from '@ant-design/icons';
import { categories, tools } from '../../utils/toolsData';

const { Title, Paragraph } = Typography;
const { Meta } = Card;

const getIconByName = (iconName: string): React.ReactNode => {
  switch (iconName) {
    case 'bank':
      return <BankOutlined />;
    case 'swap':
      return <SwapOutlined />;
    case 'code':
      return <CodeOutlined />;
    case 'calendar':
      return <CalendarOutlined />;
    case 'home':
      return <HomeOutlined />;
    case 'dollar':
      return <DollarOutlined />;
    case 'calculator':
      return <CalculatorOutlined />;
    case 'key':
      return <KeyOutlined />;
    default:
      return <CodeOutlined />;
  }
};

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      <Title level={2}>欢迎使用每日工具箱</Title>
      <Paragraph>
        这里提供各种实用工具，让你的日常工作和生活更加便捷。选择下方的工具分类或直接进入你需要的工具。
      </Paragraph>

      <Divider orientation="left">工具分类</Divider>
      <Row gutter={[16, 16]}>
        {categories.map(category => (
          <Col xs={24} sm={12} md={8} lg={6} key={category.id}>
            <Link to={`/category/${category.id}`}>
              <Card
                hoverable
                style={{ height: '100%' }}
                cover={
                  <div
                    style={{
                      fontSize: 48,
                      textAlign: 'center',
                      padding: '24px 0',
                      color: '#1890ff',
                    }}
                  >
                    {getIconByName(category.icon)}
                  </div>
                }
              >
                <Meta title={category.name} description={category.description} />
              </Card>
            </Link>
          </Col>
        ))}
      </Row>

      <Divider orientation="left">热门工具</Divider>
      <Row gutter={[16, 16]}>
        {tools.slice(0, 4).map(tool => (
          <Col xs={24} sm={12} md={8} lg={6} key={tool.id}>
            <Link to={tool.path}>
              <Card
                hoverable
                style={{ height: '100%' }}
                cover={
                  <div
                    style={{
                      fontSize: 48,
                      textAlign: 'center',
                      padding: '24px 0',
                      color: '#1890ff',
                    }}
                  >
                    {getIconByName(tool.icon)}
                  </div>
                }
              >
                <Meta title={tool.name} description={tool.description} />
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default HomePage;
