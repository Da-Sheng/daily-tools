import React, { useMemo } from 'react';
import { Typography, Card, Row, Col, Empty, Breadcrumb } from 'antd';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  HomeOutlined,
  AppstoreOutlined,
  BankOutlined,
  SwapOutlined,
  CodeOutlined,
  CalendarOutlined,
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

const CategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();

  const category = useMemo(() => {
    return categories.find(c => c.id === categoryId);
  }, [categoryId]);

  const categoryTools = useMemo(() => {
    return tools.filter(tool => tool.categoryId === categoryId);
  }, [categoryId]);

  // 如果分类不存在，重定向到首页
  if (!category && categoryId) {
    navigate('/');
    return null;
  }

  return (
    <div className="category-page">
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>
          <Link to="/">
            <HomeOutlined /> 首页
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <AppstoreOutlined /> {category?.name || '所有工具'}
        </Breadcrumb.Item>
      </Breadcrumb>

      <Title level={2}>{category?.name || '所有工具'}</Title>
      <Paragraph>{category?.description || '浏览所有可用的工具'}</Paragraph>

      {categoryTools.length > 0 ? (
        <Row gutter={[16, 16]}>
          {categoryTools.map(tool => (
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
      ) : (
        <Empty description="该分类下暂无工具" style={{ margin: '40px 0' }} />
      )}
    </div>
  );
};

export default CategoryPage;
