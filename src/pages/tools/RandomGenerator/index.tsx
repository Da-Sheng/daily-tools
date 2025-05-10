import React, { useState } from 'react';
import {
  Typography,
  Form,
  InputNumber,
  Switch,
  Card,
  Divider,
  Breadcrumb,
  Row,
  Col,
  Button,
  Input,
  Tabs,
  List,
  Space,
  Tooltip,
  message,
  Slider,
} from 'antd';
import {
  HomeOutlined,
  KeyOutlined,
  CopyOutlined,
  ReloadOutlined,
  DeleteOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

// 随机密码生成器
const PasswordGenerator: React.FC = () => {
  const [password, setPassword] = useState<string>('');
  const [passwordLength, setPasswordLength] = useState<number>(12);
  const [includeLowercase, setIncludeLowercase] = useState<boolean>(true);
  const [includeUppercase, setIncludeUppercase] = useState<boolean>(true);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeSpecial, setIncludeSpecial] = useState<boolean>(true);
  const [passwordHistory, setPasswordHistory] = useState<string[]>([]);

  // 生成随机密码
  const generatePassword = () => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let chars = '';
    if (includeLowercase) chars += lowercase;
    if (includeUppercase) chars += uppercase;
    if (includeNumbers) chars += numbers;
    if (includeSpecial) chars += special;

    if (chars.length === 0) {
      message.error('请至少选择一种字符类型');
      return;
    }

    let newPassword = '';
    for (let i = 0; i < passwordLength; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      newPassword += chars[randomIndex];
    }

    setPassword(newPassword);
    setPasswordHistory([newPassword, ...passwordHistory.slice(0, 9)]);
  };

  // 获取密码强度
  const getPasswordStrength = (pwd: string): { level: number; text: string; color: string } => {
    if (!pwd) return { level: 0, text: '无', color: '#bfbfbf' };

    let score = 0;

    // 长度检查
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    if (pwd.length >= 16) score += 1;

    // 复杂度检查
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^a-zA-Z0-9]/.test(pwd)) score += 1;

    // 重复字符检查
    const repeatedChars = pwd.match(/(.)\1{2,}/g);
    if (repeatedChars) score -= repeatedChars.length;

    // 计算最终得分
    if (score <= 2) return { level: 1, text: '弱', color: '#f5222d' };
    if (score <= 4) return { level: 2, text: '中', color: '#faad14' };
    if (score <= 6) return { level: 3, text: '强', color: '#52c41a' };
    return { level: 4, text: '非常强', color: '#1890ff' };
  };

  // 复制到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        message.success('已复制到剪贴板');
      },
      () => {
        message.error('复制失败');
      }
    );
  };

  // 清空历史记录
  const clearHistory = () => {
    setPasswordHistory([]);
    message.success('历史记录已清空');
  };

  // 计算密码强度
  const passwordStrength = getPasswordStrength(password);

  return (
    <div>
      <Card>
        <Form layout="vertical">
          <Form.Item label="密码长度">
            <Row gutter={16}>
              <Col span={18}>
                <Slider
                  min={4}
                  max={32}
                  value={passwordLength}
                  onChange={(value: number) => setPasswordLength(value)}
                />
              </Col>
              <Col span={6}>
                <InputNumber
                  min={4}
                  max={32}
                  value={passwordLength}
                  onChange={value => setPasswordLength(value || 4)}
                  style={{ width: '100%' }}
                />
              </Col>
            </Row>
          </Form.Item>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item label="包含小写字母" valuePropName="checked">
                <Switch checked={includeLowercase} onChange={setIncludeLowercase} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="包含大写字母" valuePropName="checked">
                <Switch checked={includeUppercase} onChange={setIncludeUppercase} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="包含数字" valuePropName="checked">
                <Switch checked={includeNumbers} onChange={setIncludeNumbers} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="包含特殊符号" valuePropName="checked">
                <Switch checked={includeSpecial} onChange={setIncludeSpecial} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button type="primary" icon={<ReloadOutlined />} onClick={generatePassword}>
              生成密码
            </Button>
          </Form.Item>

          {password && (
            <>
              <Form.Item label="生成的密码">
                <Input.Password
                  value={password}
                  readOnly
                  addonAfter={
                    <Tooltip title="复制密码">
                      <CopyOutlined
                        onClick={() => copyToClipboard(password)}
                        style={{ cursor: 'pointer' }}
                      />
                    </Tooltip>
                  }
                />
              </Form.Item>

              <Form.Item label="密码强度">
                <Space>
                  <div
                    style={{ width: 120, height: 8, backgroundColor: '#f0f0f0', borderRadius: 4 }}
                  >
                    <div
                      style={{
                        width: `${(passwordStrength.level / 4) * 100}%`,
                        height: '100%',
                        backgroundColor: passwordStrength.color,
                        borderRadius: 4,
                        transition: 'width 0.3s',
                      }}
                    />
                  </div>
                  <Text style={{ color: passwordStrength.color }}>{passwordStrength.text}</Text>
                </Space>
              </Form.Item>
            </>
          )}
        </Form>

        {passwordHistory.length > 0 && (
          <>
            <Divider orientation="left">
              <Space>
                <HistoryOutlined />
                历史记录
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={clearHistory}
                  size="small"
                  danger
                >
                  清空
                </Button>
              </Space>
            </Divider>
            <List
              size="small"
              bordered
              dataSource={passwordHistory}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Tooltip title="复制密码" key="copy">
                      <Button
                        type="text"
                        icon={<CopyOutlined />}
                        onClick={() => copyToClipboard(item)}
                        size="small"
                      />
                    </Tooltip>,
                  ]}
                >
                  <Text ellipsis style={{ width: '100%' }}>
                    {item}
                  </Text>
                </List.Item>
              )}
            />
          </>
        )}
      </Card>
    </div>
  );
};

// UUID生成器
const UuidGenerator: React.FC = () => {
  const [uuids, setUuids] = useState<string[]>([]);
  const [uuidCount, setUuidCount] = useState<number>(1);

  // 生成UUID
  const generateUuids = () => {
    const newUuids = [];
    for (let i = 0; i < uuidCount; i++) {
      newUuids.push(uuidv4());
    }
    setUuids(newUuids);
  };

  // 复制到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        message.success('已复制到剪贴板');
      },
      () => {
        message.error('复制失败');
      }
    );
  };

  return (
    <div>
      <Card>
        <Form layout="vertical">
          <Form.Item label="生成数量">
            <Row gutter={16}>
              <Col span={18}>
                <Slider
                  min={1}
                  max={10}
                  value={uuidCount}
                  onChange={(value: number) => setUuidCount(value)}
                />
              </Col>
              <Col span={6}>
                <InputNumber
                  min={1}
                  max={10}
                  value={uuidCount}
                  onChange={value => setUuidCount(value || 1)}
                  style={{ width: '100%' }}
                />
              </Col>
            </Row>
          </Form.Item>

          <Form.Item>
            <Button type="primary" icon={<ReloadOutlined />} onClick={generateUuids}>
              生成UUID
            </Button>
          </Form.Item>

          {uuids.length > 0 && (
            <Form.Item label="生成的UUID">
              <List
                size="small"
                bordered
                dataSource={uuids}
                renderItem={item => (
                  <List.Item
                    actions={[
                      <Tooltip title="复制" key="copy">
                        <Button
                          type="text"
                          icon={<CopyOutlined />}
                          onClick={() => copyToClipboard(item)}
                          size="small"
                        />
                      </Tooltip>,
                    ]}
                  >
                    <Text code copyable={false}>
                      {item}
                    </Text>
                  </List.Item>
                )}
              />
            </Form.Item>
          )}
        </Form>
      </Card>
    </div>
  );
};

const RandomGenerator: React.FC = () => {
  return (
    <div className="random-generator-page">
      <Breadcrumb>
        <Breadcrumb.Item>
          <Link to="/">
            <HomeOutlined /> 首页
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/category/generator">
            <KeyOutlined /> 生成工具
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <KeyOutlined /> 随机生成器
        </Breadcrumb.Item>
      </Breadcrumb>

      <Title level={2} style={{ marginTop: 16 }}>
        随机生成器
      </Title>
      <Paragraph>生成随机密码、UUID等内容，提供多种自定义选项。</Paragraph>

      <Tabs defaultActiveKey="password">
        <TabPane tab="密码生成器" key="password">
          <PasswordGenerator />
        </TabPane>
        <TabPane tab="UUID生成器" key="uuid">
          <UuidGenerator />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default RandomGenerator;
