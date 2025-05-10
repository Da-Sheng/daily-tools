import React, { useState, useMemo } from 'react';
import {
  Typography,
  Form,
  InputNumber,
  Switch,
  Button,
  Card,
  Input,
  Breadcrumb,
  Row,
  Col,
  Slider,
  Space,
  Progress,
  message,
  Divider,
  Tooltip,
  Tag,
} from 'antd';
import {
  HomeOutlined,
  KeyOutlined,
  LockOutlined,
  CopyOutlined,
  ReloadOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;

const PasswordGenerator: React.FC = () => {
  const [passwordLength, setPasswordLength] = useState<number>(12);
  const [includeUppercase, setIncludeUppercase] = useState<boolean>(true);
  const [includeLowercase, setIncludeLowercase] = useState<boolean>(true);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(true);
  const [excludeSimilar, setExcludeSimilar] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [passwordHistory, setPasswordHistory] = useState<string[]>([]);
  const [copied, setCopied] = useState<boolean>(false);

  // 计算密码强度
  const passwordStrength = useMemo(() => {
    if (!password) return 0;

    let strength = 0;

    // 长度评分: 最长20字符为满分
    strength += Math.min(password.length / 20, 1) * 25;

    // 字符多样性评分
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);

    strength += hasUpper ? 25 : 0;
    strength += hasLower ? 15 : 0;
    strength += hasNumber ? 15 : 0;
    strength += hasSymbol ? 20 : 0;

    return Math.min(Math.floor(strength), 100);
  }, [password]);

  // 评估密码强度等级文字
  const getStrengthLevel = (strength: number): { text: string; color: string } => {
    if (strength >= 80) return { text: '非常强', color: '#52c41a' };
    if (strength >= 60) return { text: '强', color: '#1890ff' };
    if (strength >= 40) return { text: '中等', color: '#faad14' };
    return { text: '弱', color: '#f5222d' };
  };

  // 生成随机密码
  const generatePassword = () => {
    let charset = '';

    if (includeLowercase) charset += 'abcdefghjkmnpqrstuvwxyz';
    if (includeUppercase) charset += 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+~`|}{[]:;?><,./-=';

    // 排除易混淆字符
    if (excludeSimilar) {
      charset = charset.replace(/[ilLI|`oO0]/g, '');
    }

    if (charset.length === 0) {
      message.error('请至少选择一种字符类型');
      return;
    }

    let newPassword = '';
    for (let i = 0; i < passwordLength; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      newPassword += charset[randomIndex];
    }

    // 确保密码包含所有所需的字符类型
    let validPassword = true;

    if (includeLowercase && !/[a-z]/.test(newPassword)) validPassword = false;
    if (includeUppercase && !/[A-Z]/.test(newPassword)) validPassword = false;
    if (includeNumbers && !/[0-9]/.test(newPassword)) validPassword = false;
    if (includeSymbols && !/[^A-Za-z0-9]/.test(newPassword)) validPassword = false;

    if (!validPassword) {
      // 如果生成的密码不满足条件，重新生成
      generatePassword();
      return;
    }

    // 将新密码添加到历史记录
    if (password) {
      setPasswordHistory(prev => [password, ...prev].slice(0, 5));
    }

    setPassword(newPassword);
    setCopied(false);
  };

  // 复制密码到剪贴板
  const copyToClipboard = () => {
    if (!password) return;

    navigator.clipboard
      .writeText(password)
      .then(() => {
        setCopied(true);
        message.success('密码已复制到剪贴板');
      })
      .catch(() => {
        message.error('复制失败，请手动复制');
      });
  };

  // 使用历史密码
  const useHistoryPassword = (historyPassword: string) => {
    setPassword(historyPassword);
    setCopied(false);
  };

  // 计算密码估算破解时间
  const getCrackTime = (strength: number): string => {
    if (strength < 30) return '几秒内';
    if (strength < 50) return '几分钟内';
    if (strength < 70) return '几天内';
    if (strength < 90) return '几年内';
    return '几百年以上';
  };

  return (
    <div className="password-generator-page">
      <Breadcrumb>
        <Breadcrumb.Item>
          <Link to="/">
            <HomeOutlined /> 首页
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/category/generator">
            <KeyOutlined /> 生成器
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <LockOutlined /> 密码生成器
        </Breadcrumb.Item>
      </Breadcrumb>

      <Title level={2} style={{ marginTop: 16 }}>
        随机密码生成器
      </Title>
      <Paragraph>生成安全、强壮的随机密码，提高您的账户安全性。</Paragraph>

      <Row gutter={24}>
        <Col span={16}>
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                <Input.Password
                  value={password}
                  placeholder="生成的密码将在这里显示"
                  readOnly
                  size="large"
                  style={{ flex: 1 }}
                />
                <Space style={{ marginLeft: 16 }}>
                  <Tooltip title="复制密码">
                    <Button
                      type="primary"
                      icon={copied ? <CheckOutlined /> : <CopyOutlined />}
                      onClick={copyToClipboard}
                      disabled={!password}
                    />
                  </Tooltip>
                  <Tooltip title="重新生成">
                    <Button icon={<ReloadOutlined />} onClick={generatePassword} />
                  </Tooltip>
                </Space>
              </div>

              {password && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ marginRight: 16 }}>密码强度:</span>
                    <Progress
                      percent={passwordStrength}
                      status={passwordStrength < 40 ? 'exception' : 'active'}
                      strokeColor={getStrengthLevel(passwordStrength).color}
                      style={{ flex: 1, marginRight: 16 }}
                    />
                    <Tag color={getStrengthLevel(passwordStrength).color}>
                      {getStrengthLevel(passwordStrength).text}
                    </Tag>
                  </div>
                  <Text type="secondary">估计破解时间: {getCrackTime(passwordStrength)}</Text>
                </div>
              )}

              <Divider>密码选项</Divider>

              <Form layout="vertical">
                <Form.Item label="密码长度">
                  <Row align="middle">
                    <Col span={18}>
                      <Slider
                        min={4}
                        max={32}
                        onChange={value => setPasswordLength(value)}
                        value={passwordLength}
                      />
                    </Col>
                    <Col span={6}>
                      <InputNumber
                        min={4}
                        max={32}
                        value={passwordLength}
                        onChange={value => setPasswordLength(value as number)}
                        style={{ marginLeft: 16, width: '100%' }}
                      />
                    </Col>
                  </Row>
                </Form.Item>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="包含大写字母 (A-Z)">
                      <Switch checked={includeUppercase} onChange={setIncludeUppercase} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="包含小写字母 (a-z)">
                      <Switch checked={includeLowercase} onChange={setIncludeLowercase} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="包含数字 (0-9)">
                      <Switch checked={includeNumbers} onChange={setIncludeNumbers} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="包含特殊符号 (!@#$%^&*)">
                      <Switch checked={includeSymbols} onChange={setIncludeSymbols} />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item label="排除易混淆字符 (l, I, 1, O, 0, etc.)">
                  <Switch checked={excludeSimilar} onChange={setExcludeSimilar} />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" size="large" block onClick={generatePassword}>
                    生成随机密码
                  </Button>
                </Form.Item>
              </Form>
            </Space>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="密码历史记录" style={{ marginBottom: 24 }}>
            {passwordHistory.length > 0 ? (
              <ul style={{ listStyleType: 'none', padding: 0 }}>
                {passwordHistory.map((historyPassword, index) => (
                  <li key={index} style={{ marginBottom: 8 }}>
                    <Button
                      type="text"
                      block
                      onClick={() => useHistoryPassword(historyPassword)}
                      style={{ textAlign: 'left', height: 'auto', padding: '8px' }}
                    >
                      <Text ellipsis style={{ width: '100%' }}>
                        {historyPassword}
                      </Text>
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <Text type="secondary">生成的密码会显示在这里</Text>
            )}
          </Card>

          <Card title="密码使用提示">
            <ul>
              <li>使用不同网站不同的密码</li>
              <li>定期更换密码以提高安全性</li>
              <li>考虑使用密码管理器保存复杂密码</li>
              <li>密码长度至少12位以上最为安全</li>
              <li>混合使用大小写字母、数字和符号</li>
            </ul>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PasswordGenerator;
