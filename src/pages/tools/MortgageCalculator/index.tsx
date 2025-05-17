import React, { useState, useEffect } from 'react';
import {
  Typography,
  Form,
  InputNumber,
  Select,
  Button,
  Card,
  Divider,
  Table,
  Breadcrumb,
  Row,
  Col,
  Statistic,
  Tabs,
  Radio,
  Switch,
  Space,
  Input,
  Alert,
  Empty,
  Tag,
  Tooltip,
  List,
} from 'antd';
import {
  HomeOutlined,
  BankOutlined,
  CalculatorOutlined,
  PlusOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  SwapOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { MortgageResult, PaymentScheduleItem, PrepaymentOption, PrepaymentResult } from 'types';
import { formatCurrency } from 'utils/formatters';
import {
  calculateMortgage,
  calculatePrepayment,
  formatMonthsToYearMonth,
  calculateLoanAmountByPayment,
} from 'utils/mortgageUtils';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Group: RadioGroup } = Radio;

// 提前还款方案对比表格列
const comparisonColumns = [
  {
    title: '方案',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '提前还款金额',
    dataIndex: 'prepaymentAmount',
    key: 'prepaymentAmount',
    render: (text: number) => formatCurrency(text),
  },
  {
    title: '还款方式',
    dataIndex: 'adjustmentType',
    key: 'adjustmentType',
    render: (text: string) => (text === 'reduce-term' ? '缩短期限' : '减少月供'),
  },
  {
    title: '新月供',
    dataIndex: 'newMonthlyPayment',
    key: 'newMonthlyPayment',
    render: (text: number) => formatCurrency(text),
  },
  {
    title: '新贷款期限',
    dataIndex: 'newTerm',
    key: 'newTerm',
    render: (text: number) => formatMonthsToYearMonth(text),
  },
  {
    title: '节省利息',
    dataIndex: 'savedInterest',
    key: 'savedInterest',
    render: (text: number) => formatCurrency(text),
    sorter: (a: any, b: any) => a.savedInterest - b.savedInterest,
  },
  {
    title: '节省期限',
    dataIndex: 'savedTerm',
    key: 'savedTerm',
    render: (text: number) => formatMonthsToYearMonth(text),
    sorter: (a: any, b: any) => a.savedTerm - b.savedTerm,
  },
];

const MortgageCalculator: React.FC = () => {
  const [form] = Form.useForm();
  const [prepaymentForm] = Form.useForm();
  const [results, setResults] = useState<MortgageResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [prepaymentMode, setPrepaymentMode] = useState<'amount' | 'term'>('amount');
  const [prepaymentOptions, setPrepaymentOptions] = useState<PrepaymentOption[]>([]);
  const [prepaymentResults, setPrepaymentResults] = useState<PrepaymentResult[]>([]);
  const [currentTab, setCurrentTab] = useState<string>('calculator');
  const [timeUnit, setTimeUnit] = useState<'month' | 'year'>('year');
  const [prepaymentUnit, setPrepaymentUnit] = useState<'month' | 'year'>('year');

  // 监听表单值变化，自动转换单位
  useEffect(() => {
    const unsubscribe = prepaymentForm.getFieldsValue(['prepaymentTiming']);
    if (unsubscribe?.prepaymentTiming && prepaymentUnit === 'year') {
      prepaymentForm.setFieldsValue({
        prepaymentTimingText:
          Math.floor(unsubscribe.prepaymentTiming / 12) +
          '年' +
          (unsubscribe.prepaymentTiming % 12) +
          '个月',
      });
    }
  }, [prepaymentForm.getFieldValue('prepaymentTiming'), prepaymentUnit]);

  // 计算房贷
  const handleCalculateMortgage = (values: {
    loanAmount: number;
    downPayment: number;
    loanTerm: number;
    interestRate: number;
    paymentType: 'equal-principal-interest' | 'equal-principal';
  }): void => {
    const { loanAmount, downPayment, loanTerm, interestRate, paymentType } = values;

    setLoading(true);

    // 模拟计算延迟
    setTimeout(() => {
      // 计算实际贷款金额
      const principal = loanAmount - downPayment;
      // 计算贷款期限（月）
      const loanTermMonths = loanTerm * 12;

      // 使用工具函数计算房贷结果
      const result = calculateMortgage(principal, interestRate, loanTermMonths, paymentType);

      setResults(result);
      // 清空提前还款选项和结果
      setPrepaymentOptions([]);
      setPrepaymentResults([]);

      setLoading(false);

      // 计算完成后切换到提前还款选项卡
      if (currentTab === 'calculator') {
        setCurrentTab('prepayment');
      }
    }, 300);
  };

  // 添加提前还款方案
  const handleAddPrepaymentOption = () => {
    prepaymentForm.validateFields().then(values => {
      // 提前还款时间（转换为月）
      let timing = values.prepaymentTiming;
      if (prepaymentUnit === 'year') {
        timing = Math.floor(values.prepaymentTiming / 12) * 12 + (values.prepaymentTiming % 12);
      }

      // 创建新的提前还款选项
      const newOption: PrepaymentOption = {
        id: uuidv4(),
        name: values.name || `方案${prepaymentOptions.length + 1}`,
        timing,
        amount: values.prepaymentAmount,
        adjustmentType: values.adjustmentType,
        targetPayment: values.targetPayment,
        targetTerm: values.targetTerm ? values.targetTerm * 12 : undefined,
      };

      const newOptions = [...prepaymentOptions, newOption];
      setPrepaymentOptions(newOptions);

      // 如果已有原始贷款计算结果，则计算提前还款结果
      if (results) {
        calculatePrepaymentResults(newOptions);
      }

      // 重置表单，但保留某些字段值
      const preservedValues = {
        adjustmentType: values.adjustmentType,
        prepaymentTiming: values.prepaymentTiming,
        prepaymentTimingText: values.prepaymentTimingText,
      };
      prepaymentForm.resetFields();
      prepaymentForm.setFieldsValue(preservedValues);
    });
  };

  // 删除提前还款方案
  const handleDeletePrepaymentOption = (id: string) => {
    const newOptions = prepaymentOptions.filter(option => option.id !== id);
    setPrepaymentOptions(newOptions);

    // 重新计算结果
    if (results && newOptions.length > 0) {
      calculatePrepaymentResults(newOptions);
    } else {
      setPrepaymentResults([]);
    }
  };

  // 计算提前还款结果
  const calculatePrepaymentResults = (options: PrepaymentOption[]) => {
    if (!results) return;

    // 获取利率和还款方式
    const interestRate = form.getFieldValue('interestRate');
    const paymentType = form.getFieldValue('paymentType');

    // 计算每个选项的提前还款结果
    const newResults = options
      .map(option => {
        try {
          return calculatePrepayment(results, option, interestRate, paymentType);
        } catch (error) {
          console.error('计算提前还款方案出错:', error);
          return null;
        }
      })
      .filter(result => result !== null) as PrepaymentResult[];

    setPrepaymentResults(newResults);
  };

  // 重置房贷计算表单
  const handleReset = (): void => {
    form.resetFields();
    setResults(null);
    setPrepaymentOptions([]);
    setPrepaymentResults([]);
  };

  // 还款计划表格列
  const scheduleColumns = [
    {
      title: '月份',
      dataIndex: 'month',
      key: 'month',
      render: (text: number) =>
        timeUnit === 'year'
          ? `${Math.floor((text - 1) / 12) + 1}年${((text - 1) % 12) + 1}月`
          : text,
    },
    {
      title: '月供',
      dataIndex: 'payment',
      key: 'payment',
      render: (text: number) => formatCurrency(text),
    },
    {
      title: '本金',
      dataIndex: 'principalPayment',
      key: 'principalPayment',
      render: (text: number) => formatCurrency(text),
    },
    {
      title: '利息',
      dataIndex: 'interestPayment',
      key: 'interestPayment',
      render: (text: number) => formatCurrency(text),
    },
    {
      title: '剩余本金',
      dataIndex: 'remainingPrincipal',
      key: 'remainingPrincipal',
      render: (text: number) => formatCurrency(text),
    },
  ];

  // 格式化数字显示
  const numberFormatter = (value: number | undefined): string => {
    return value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';
  };

  // 解析数字输入
  const numberParser = (value: string | undefined): string => {
    return value ? value.replace(/,/g, '') : '';
  };

  // 根据调整方式显示不同的目标选项
  const renderTargetOptions = () => {
    const adjustmentType = prepaymentForm.getFieldValue('adjustmentType');

    if (adjustmentType === 'reduce-payment') {
      return (
        <Form.Item label="目标月供(元)" name="targetPayment">
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            step={100}
            placeholder="可选，不填则自动计算"
            formatter={numberFormatter}
            parser={value => parseFloat(numberParser(value || ''))}
          />
        </Form.Item>
      );
    } else if (adjustmentType === 'reduce-term') {
      return (
        <Form.Item label="目标期限(年)" name="targetTerm">
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            max={30}
            step={1}
            placeholder="可选，不填则自动计算"
          />
        </Form.Item>
      );
    }

    return null;
  };

  // 渲染提前还款方案列表
  const renderPrepaymentOptions = () => {
    if (prepaymentOptions.length === 0) {
      return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无提前还款方案" />;
    }

    return (
      <List
        itemLayout="horizontal"
        dataSource={prepaymentOptions}
        renderItem={option => {
          // 查找对应的计算结果
          const result = prepaymentResults.find(
            r =>
              r.newTerm === (option.adjustmentType === 'reduce-term' ? option.targetTerm || -1 : -1)
          );

          return (
            <List.Item
              actions={[
                <Button
                  key="delete"
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeletePrepaymentOption(option.id)}
                />,
              ]}
            >
              <List.Item.Meta
                title={
                  <Space>
                    <Text strong>{option.name}</Text>
                    <Tag color={option.adjustmentType === 'reduce-term' ? 'blue' : 'green'}>
                      {option.adjustmentType === 'reduce-term' ? '缩短期限' : '减少月供'}
                    </Tag>
                  </Space>
                }
                description={
                  <Space direction="vertical">
                    <Text>提前还款时间: {formatMonthsToYearMonth(option.timing)}</Text>
                    <Text>提前还款金额: {formatCurrency(option.amount)}</Text>
                    {option.adjustmentType === 'reduce-payment' && option.targetPayment && (
                      <Text>目标月供: {formatCurrency(option.targetPayment)}</Text>
                    )}
                    {option.adjustmentType === 'reduce-term' && option.targetTerm && (
                      <Text>目标期限: {formatMonthsToYearMonth(option.targetTerm)}</Text>
                    )}
                  </Space>
                }
              />
              {result && (
                <Space>
                  <Statistic
                    title="节省利息"
                    value={result.savedInterest}
                    precision={2}
                    valueStyle={{ color: '#3f8600', fontSize: '16px' }}
                    prefix="￥"
                    style={{ marginRight: 16 }}
                  />
                  <Statistic
                    title="节省期限"
                    value={formatMonthsToYearMonth(result.savedTerm)}
                    valueStyle={{ color: '#1890ff', fontSize: '16px' }}
                    style={{ marginRight: 16 }}
                  />
                </Space>
              )}
            </List.Item>
          );
        }}
      />
    );
  };

  // 渲染提前还款方案对比表格
  const renderComparisonTable = () => {
    if (prepaymentResults.length === 0) {
      return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无提前还款方案进行对比" />;
    }

    const dataSource = prepaymentResults.map((result, index) => {
      const option = prepaymentOptions[index];

      return {
        key: option.id,
        name: option.name,
        prepaymentAmount: option.amount,
        prepaymentTiming: option.timing,
        adjustmentType: option.adjustmentType,
        newMonthlyPayment: result.newMonthlyPayment,
        newTotalPayment: result.newTotalPayment,
        newTotalInterest: result.newTotalInterest,
        newTerm: result.newTerm,
        savedInterest: result.savedInterest,
        savedTerm: result.savedTerm,
      };
    });

    return (
      <Table
        dataSource={dataSource}
        columns={comparisonColumns}
        rowKey="key"
        pagination={false}
        size="middle"
        scroll={{ x: 1000 }}
      />
    );
  };

  // 渲染主界面
  return (
    <div className="mortgage-calculator-page">
      <Breadcrumb>
        <Breadcrumb.Item>
          <Link to="/">
            <HomeOutlined /> 首页
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/category/finance">
            <BankOutlined /> 金融工具
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <CalculatorOutlined /> 房贷计算器
        </Breadcrumb.Item>
      </Breadcrumb>

      <Title level={2} style={{ marginTop: 16 }}>
        房贷计算器{' '}
        <Text type="secondary" style={{ fontSize: '16px' }}>
          （支持提前还款规划）
        </Text>
      </Title>
      <Paragraph>
        计算房贷月供、总还款额和利息，支持等额本息和等额本金两种还款方式，可规划提前还款方案。
      </Paragraph>

      <Tabs activeKey={currentTab} onChange={setCurrentTab}>
        <TabPane tab="贷款计算" key="calculator">
          <Card>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleCalculateMortgage}
              initialValues={{
                loanAmount: 1000000,
                downPayment: 200000,
                loanTerm: 30,
                interestRate: 4.5,
                paymentType: 'equal-principal-interest',
              }}
            >
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    label="贷款总额 (元)"
                    name="loanAmount"
                    rules={[{ required: true, message: '请输入贷款总额' }]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      min={1}
                      step={10000}
                      formatter={numberFormatter}
                      parser={value => parseFloat(numberParser(value || ''))}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="首付金额 (元)"
                    name="downPayment"
                    rules={[{ required: true, message: '请输入首付金额' }]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      step={10000}
                      formatter={numberFormatter}
                      parser={value => parseFloat(numberParser(value || ''))}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col span={8}>
                  <Form.Item
                    label="贷款期限 (年)"
                    name="loanTerm"
                    rules={[{ required: true, message: '请选择贷款期限' }]}
                  >
                    <Select>
                      <Option value={5}>5 年</Option>
                      <Option value={10}>10 年</Option>
                      <Option value={15}>15 年</Option>
                      <Option value={20}>20 年</Option>
                      <Option value={25}>25 年</Option>
                      <Option value={30}>30 年</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="年利率 (%)"
                    name="interestRate"
                    rules={[{ required: true, message: '请输入年利率' }]}
                  >
                    <InputNumber style={{ width: '100%' }} min={0} step={0.1} precision={2} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="还款方式"
                    name="paymentType"
                    rules={[{ required: true, message: '请选择还款方式' }]}
                  >
                    <Select>
                      <Option value="equal-principal-interest">等额本息</Option>
                      <Option value="equal-principal">等额本金</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  计算
                </Button>
                <Button style={{ marginLeft: 8 }} onClick={handleReset}>
                  重置
                </Button>
              </Form.Item>
            </Form>
          </Card>

          {results && (
            <Card style={{ marginTop: 24 }}>
              <Title level={4}>计算结果</Title>
              <Row gutter={[24, 24]}>
                <Col span={6}>
                  <Statistic
                    title="贷款金额"
                    value={results.loanAmount}
                    precision={2}
                    prefix="￥"
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title={`月供金额${
                      form.getFieldValue('paymentType') === 'equal-principal' ? '(首月)' : ''
                    }`}
                    value={results.monthlyPayment}
                    precision={2}
                    prefix="￥"
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="总支付金额"
                    value={results.totalPayment}
                    precision={2}
                    prefix="￥"
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="总利息"
                    value={results.totalInterest}
                    precision={2}
                    prefix="￥"
                  />
                </Col>
              </Row>

              <Divider />

              <div
                style={{
                  marginBottom: 16,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Title level={4} style={{ margin: 0 }}>
                  还款计划表
                </Title>
                <RadioGroup value={timeUnit} onChange={e => setTimeUnit(e.target.value)}>
                  <Radio.Button value="month">按月</Radio.Button>
                  <Radio.Button value="year">按年</Radio.Button>
                </RadioGroup>
              </div>

              <Table
                dataSource={results.schedule.slice(0, 24)}
                columns={scheduleColumns}
                rowKey="month"
                pagination={{
                  showQuickJumper: true,
                  // pageSizeOptions: ['12', '24', '36', '60'],
                }}
                size="middle"
                scroll={{ x: 800 }}
              />
            </Card>
          )}
        </TabPane>

        <TabPane tab="提前还款规划" key="prepayment" disabled={!results}>
          <Row gutter={24}>
            <Col span={24} md={8}>
              <Card title="添加提前还款方案">
                <Form
                  form={prepaymentForm}
                  layout="vertical"
                  initialValues={{
                    adjustmentType: 'reduce-term',
                    prepaymentTiming: 60,
                    prepaymentTimingText: '5年0个月',
                  }}
                >
                  <Form.Item
                    label="方案名称"
                    name="name"
                    rules={[{ max: 20, message: '名称不能超过20个字符' }]}
                  >
                    <Input placeholder={`方案${prepaymentOptions.length + 1}`} />
                  </Form.Item>

                  <Form.Item
                    label={
                      <span>
                        提前还款时间
                        <Tooltip title="已还款多少时间后进行提前还款">
                          <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                        </Tooltip>
                      </span>
                    }
                    required
                  >
                    <Input.Group compact>
                      <Form.Item
                        name="prepaymentTiming"
                        noStyle
                        rules={[{ required: true, message: '请输入提前还款时间' }]}
                      >
                        <InputNumber
                          style={{ width: 'calc(100% - 80px)' }}
                          min={1}
                          max={form.getFieldValue('loanTerm') * 12}
                          onChange={(value: number | null) => {
                            if (value && prepaymentUnit === 'year') {
                              const years = Math.floor(value / 12);
                              const months = value % 12;
                              prepaymentForm.setFieldsValue({
                                prepaymentTimingText: `${years}年${months}个月`,
                              });
                            }
                          }}
                        />
                      </Form.Item>
                      <Select
                        style={{ width: '80px' }}
                        value={prepaymentUnit}
                        onChange={(value: string) => {
                          setPrepaymentUnit(value as 'month' | 'year');
                          const timing = prepaymentForm.getFieldValue('prepaymentTiming');
                          if (timing) {
                            if (value === 'year') {
                              const years = Math.floor(timing / 12);
                              const months = timing % 12;
                              prepaymentForm.setFieldsValue({
                                prepaymentTimingText: `${years}年${months}个月`,
                              });
                            } else {
                              prepaymentForm.setFieldsValue({
                                prepaymentTimingText: undefined,
                              });
                            }
                          }
                        }}
                      >
                        <Option value="month">月</Option>
                        <Option value="year">年月</Option>
                      </Select>
                    </Input.Group>
                    {prepaymentUnit === 'year' && (
                      <Form.Item name="prepaymentTimingText" noStyle>
                        <Input disabled style={{ marginTop: 8 }} />
                      </Form.Item>
                    )}
                  </Form.Item>

                  <Form.Item
                    label={
                      <span>
                        提前还款金额 (元)
                        <Tooltip title="一次性提前还款的金额">
                          <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                        </Tooltip>
                      </span>
                    }
                    name="prepaymentAmount"
                    rules={[{ required: true, message: '请输入提前还款金额' }]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      min={1}
                      step={10000}
                      formatter={numberFormatter}
                      parser={value => parseFloat(numberParser(value || ''))}
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <span>
                        调整方式
                        <Tooltip title="选择减少期限可以更快还清贷款；选择减少月供可以减轻每月负担">
                          <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                        </Tooltip>
                      </span>
                    }
                    name="adjustmentType"
                    rules={[{ required: true, message: '请选择调整方式' }]}
                  >
                    <RadioGroup>
                      <Radio value="reduce-term">缩短期限</Radio>
                      <Radio value="reduce-payment">减少月供</Radio>
                    </RadioGroup>
                  </Form.Item>

                  {renderTargetOptions()}

                  <Form.Item>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleAddPrepaymentOption}
                    >
                      添加方案
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>

            <Col span={24} md={16}>
              <Card title="提前还款方案">{renderPrepaymentOptions()}</Card>

              {prepaymentResults.length > 0 && (
                <Card title="方案对比" style={{ marginTop: 24 }}>
                  {renderComparisonTable()}
                </Card>
              )}
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="使用说明" key="guide">
          <Card>
            <Title level={4}>增强版房贷计算器使用指南</Title>
            <Paragraph>
              本工具可帮助您计算房贷并规划提前还款方案，支持多种提前还款场景的比较和分析。
            </Paragraph>

            <Divider />

            <Title level={5}>基本功能</Title>
            <ul>
              <li>
                <strong>贷款计算：</strong>根据贷款金额、首付、期限、利率等计算月供和总利息。
              </li>
              <li>
                <strong>提前还款规划：</strong>设置多种提前还款方案并进行比较。
              </li>
              <li>
                <strong>期限/月供调整：</strong>可选择提前还款后是缩短期限还是减少月供。
              </li>
              <li>
                <strong>方案对比：</strong>直观比较不同提前还款方案的效果。
              </li>
            </ul>

            <Divider />

            <Title level={5}>提前还款选项说明</Title>
            <Paragraph>
              <strong>缩短期限：</strong>提前还款后保持原月供不变，缩短还款期限，更快还清贷款。
            </Paragraph>
            <Paragraph>
              <strong>减少月供：</strong>提前还款后保持原还款期限不变，减少每月的月供金额。
            </Paragraph>

            <Alert
              type="info"
              message="小贴士：通常来说，选择缩短期限比减少月供能节省更多利息。"
              style={{ marginTop: 16, marginBottom: 16 }}
            />

            <Divider />

            <Title level={5}>如何选择最优提前还款方案</Title>
            <Paragraph>
              <ol>
                <li>根据您的实际情况，添加多个不同金额、不同时间点的提前还款方案</li>
                <li>观察对比表格中的&quot;节省利息&quot;和&quot;节省期限&quot;列</li>
                <li>通常来说，在相同金额下，越早提前还款越划算</li>
                <li>考虑您的资金流动性需求，选择性价比最高的方案</li>
              </ol>
            </Paragraph>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default MortgageCalculator;
