import React from 'react';
import { Typography, Card, Row, Col, Empty, Breadcrumb, Spin } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
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
import { useToolsData } from '../../api/hooks/useToolsData';

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
  const router = useRouter();
  const { id: categoryId } = router.query;

  // 使用GraphQL自定义hook来获取数据
  const { getCategory, getToolsByCategory } = useToolsData();
  const {
    category,
    loading: categoryLoading,
    error: categoryError,
  } = getCategory(categoryId as string);
  const {
    tools: categoryTools,
    loading: toolsLoading,
    error: toolsError,
  } = getToolsByCategory(categoryId as string);

  // 加载状态处理
  if (categoryLoading || toolsLoading || !categoryId) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p style={{ marginTop: '20px' }}>加载中...</p>
      </div>
    );
  }

  // 错误处理
  if (categoryError || toolsError) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
        <p>加载数据出错，请稍后再试</p>
        <p>{categoryError?.message || toolsError?.message}</p>
      </div>
    );
  }

  // 分类不存在时重定向回首页
  if (!category) {
    router.push('/');
    return null;
  }

  return (
    <div className="category-page">
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>
          <Link href="/">
            <HomeOutlined /> 首页
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <AppstoreOutlined /> {category.name}
        </Breadcrumb.Item>
      </Breadcrumb>

      <Title level={2}>{category.name}</Title>
      <Paragraph>{category.description}</Paragraph>

      {categoryTools && categoryTools.length > 0 ? (
        <Row gutter={[16, 16]}>
          {categoryTools.map(tool => (
            <Col xs={24} sm={12} md={8} lg={6} key={tool.id}>
              <Link href={tool.path}>
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
