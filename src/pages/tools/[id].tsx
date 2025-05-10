import React from 'react';
import { Typography, Card, Breadcrumb, Spin } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { HomeOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useToolsData } from '../../api/hooks/useToolsData';

const { Title, Paragraph } = Typography;

const ToolPage: React.FC = () => {
  const router = useRouter();
  const { id: toolId } = router.query;

  // 使用GraphQL自定义hook来获取数据
  const { getTool } = useToolsData();
  const { tool, loading, error } = getTool(toolId as string);

  // 加载状态处理
  if (loading || !toolId) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p style={{ marginTop: '20px' }}>加载中...</p>
      </div>
    );
  }

  // 错误处理
  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
        <p>加载数据出错，请稍后再试</p>
        <p>{error.message}</p>
      </div>
    );
  }

  // 工具不存在时重定向回首页
  if (!tool) {
    router.push('/');
    return null;
  }

  return (
    <div className="tool-page">
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>
          <Link href="/">
            <HomeOutlined /> 首页
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link href={`/category/${tool.categoryId}`}>
            <AppstoreOutlined /> {tool.category ? tool.category.name : '分类'}
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{tool.name}</Breadcrumb.Item>
      </Breadcrumb>

      <Card>
        <Title level={2}>{tool.name}</Title>
        <Paragraph>{tool.description}</Paragraph>

        {/* 这里可以根据不同工具类型渲染具体工具内容 */}
        <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '5px' }}>
          <p>工具正在开发中...</p>
        </div>
      </Card>
    </div>
  );
};

export default ToolPage;
