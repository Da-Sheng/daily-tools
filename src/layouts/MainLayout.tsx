import React, { useState } from 'react';
import { Layout, Menu, Typography, Badge } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import {
  AppstoreOutlined,
  ToolOutlined,
  HomeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  RobotOutlined,
  CodeOutlined,
} from '@ant-design/icons';

const { Header, Content, Footer, Sider } = Layout;
const { Title } = Typography;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  // 定义基础颜色
  const primaryColor = '#1890ff';
  const bgColor = '#fff';
  const borderRadius = 8;

  // 检查当前路径是否为代码评审页面
  const isCodeReviewPage = location.pathname === '/agents/code-review';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={value => setCollapsed(value)}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            height: 32,
            margin: 16,
            textAlign: 'center',
            color: primaryColor,
            fontWeight: 'bold',
            fontSize: collapsed ? '14px' : '18px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
        >
          {!collapsed && '日常工具箱'}
          {collapsed && 'DT'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultSelectedKeys={['/']}
          items={[
            {
              key: '/',
              icon: <HomeOutlined />,
              label: <Link to="/">工具广场</Link>,
            },
            {
              key: 'tools',
              icon: <AppstoreOutlined />,
              label: '工具分类',
              children: [
                {
                  key: '/category/finance',
                  icon: <ToolOutlined />,
                  label: <Link to="/category/finance">金融工具</Link>,
                },
                {
                  key: '/category/converter',
                  icon: <ToolOutlined />,
                  label: <Link to="/category/converter">转换工具</Link>,
                },
                {
                  key: '/category/generator',
                  icon: <ToolOutlined />,
                  label: <Link to="/category/generator">生成器</Link>,
                },
                {
                  key: '/category/daily',
                  icon: <ToolOutlined />,
                  label: <Link to="/category/daily">日常工具</Link>,
                },
              ],
            },
            {
              key: 'agents',
              icon: <RobotOutlined />,
              label: (
                <span>
                  AI助手 <Badge count="NEW" size="small" offset={[5, 0]} />
                </span>
              ),
              children: [
                {
                  key: '/agents',
                  icon: <RobotOutlined />,
                  label: <Link to="/agents">助手中心</Link>,
                },
                {
                  key: '/agents/code-review',
                  icon: <CodeOutlined />,
                  label: <Link to="/agents/code-review">代码评审</Link>,
                },
              ],
            },
          ]}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'margin-left 0.2s' }}>
        <Header
          style={{
            padding: 0,
            background: bgColor,
            position: 'sticky',
            top: 0,
            zIndex: 1,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
            className: 'trigger',
            onClick: () => setCollapsed(!collapsed),
            style: { fontSize: '18px', padding: '0 24px', cursor: 'pointer' },
          })}
          <Title level={4} style={{ margin: 0 }}>
            Daily Tools | 日常工具
          </Title>
        </Header>
        <Content
          style={{
            margin: isCodeReviewPage ? 0 : '24px 16px',
            overflow: 'hidden',
            height: isCodeReviewPage ? 'calc(100vh - 64px)' : 'auto',
            display: 'flex',
            flexDirection: 'column',
            flexGrow: isCodeReviewPage ? 1 : 'unset',
          }}
        >
          <div
            style={{
              padding: isCodeReviewPage ? 0 : 24,
              flex: 1,
              background: bgColor,
              borderRadius: isCodeReviewPage ? 0 : borderRadius,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              height: isCodeReviewPage ? '100%' : 'auto',
            }}
          >
            {children}
          </div>
        </Content>
        {!isCodeReviewPage && (
          <Footer style={{ textAlign: 'center' }}>日常工具 ©{new Date().getFullYear()} 创建</Footer>
        )}
      </Layout>
    </Layout>
  );
};

export default MainLayout;
