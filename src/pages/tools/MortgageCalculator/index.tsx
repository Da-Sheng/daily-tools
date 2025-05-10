import React, { useState } from 'react';
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
} from 'antd';
import { HomeOutlined, BankOutlined, CalculatorOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { MortgageResult, PaymentScheduleItem } from 'types';
import { formatCurrency } from 'utils/formatters';

const { Title, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const MortgageCalculator: React.FC = () => {
  const [form] = Form.useForm();
  const [results, setResults] = useState<MortgageResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // 计算等额本息月付款
  const calculateEqualPayment = (
    principal: number,
    ratePerMonth: number,
    months: number
  ): number => {
    if (ratePerMonth === 0) return principal / months;
    const x = Math.pow(1 + ratePerMonth, months);
    return (principal * ratePerMonth * x) / (x - 1);
  };

  // 计算房贷
  const calculateMortgage = (values: {
    loanAmount: number;
    downPayment: number;
    loanTerm: number;
    interestRate: number;
    paymentType: string;
  }): void => {
    const { loanAmount, downPayment, loanTerm, interestRate, paymentType } = values;

    setLoading(true);

    // 模拟计算延迟
    setTimeout(() => {
      const principal = loanAmount - downPayment;
      const monthlyRate = interestRate / 100 / 12;
      const totalMonths = loanTerm * 12;

      let monthlyPayment: number, totalPayment: number, totalInterest: number;
      const schedule: PaymentScheduleItem[] = [];

      if (paymentType === 'equal-principal-interest') {
        // 等额本息
        monthlyPayment = calculateEqualPayment(principal, monthlyRate, totalMonths);
        totalPayment = monthlyPayment * totalMonths;
        totalInterest = totalPayment - principal;

        let remainingPrincipal = principal;

        for (let month = 1; month <= totalMonths; month++) {
          const interestPayment = remainingPrincipal * monthlyRate;
          const principalPayment = monthlyPayment - interestPayment;
          remainingPrincipal -= principalPayment;

          schedule.push({
            month,
            payment: monthlyPayment,
            principalPayment,
            interestPayment,
            remainingPrincipal: Math.max(0, remainingPrincipal),
          });
        }
      } else {
        // 等额本金
        const principalPaymentPerMonth = principal / totalMonths;
        totalPayment = 0;
        let firstMonthPayment = 0;

        let remainingPrincipal = principal;

        for (let month = 1; month <= totalMonths; month++) {
          const interestPayment = remainingPrincipal * monthlyRate;
          const payment = principalPaymentPerMonth + interestPayment;

          if (month === 1) firstMonthPayment = payment;

          totalPayment += payment;
          remainingPrincipal -= principalPaymentPerMonth;

          schedule.push({
            month,
            payment,
            principalPayment: principalPaymentPerMonth,
            interestPayment,
            remainingPrincipal: Math.max(0, remainingPrincipal),
          });
        }

        monthlyPayment = firstMonthPayment;
        totalInterest = totalPayment - principal;
      }

      setResults({
        monthlyPayment,
        totalPayment,
        totalInterest,
        loanAmount: principal,
        schedule,
      });

      setLoading(false);
    }, 500);
  };

  const handleReset = (): void => {
    form.resetFields();
    setResults(null);
  };

  const columns = [
    {
      title: '月份',
      dataIndex: 'month',
      key: 'month',
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
        房贷计算器
      </Title>
      <Paragraph>计算房贷月供、总还款额和利息，支持等额本息和等额本金两种还款方式。</Paragraph>

      <Tabs defaultActiveKey="calculator">
        <TabPane tab="计算器" key="calculator">
          <Card>
            <Form
              form={form}
              layout="vertical"
              onFinish={calculateMortgage}
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

              <Title level={4}>还款计划表</Title>
              <Table
                dataSource={results.schedule.slice(0, 24)}
                columns={columns}
                rowKey="month"
                pagination={{
                  defaultPageSize: 12,
                  showSizeChanger: true,
                  pageSizeOptions: ['12', '24', '36', '60'],
                }}
                size="middle"
                scroll={{ x: 800 }}
              />
            </Card>
          )}
        </TabPane>

        <TabPane tab="使用说明" key="guide">
          <Card>
            <Title level={4}>房贷计算器使用指南</Title>
            <Paragraph>
              本工具可帮助您计算房贷的月供、总还款额和利息。支持等额本息和等额本金两种还款方式。
            </Paragraph>

            <Divider />

            <Title level={5}>参数说明</Title>
            <ul>
              <li>
                <strong>贷款总额：</strong>房屋总价或需要贷款的金额，单位为元。
              </li>
              <li>
                <strong>首付金额：</strong>购房时的首付款金额，单位为元。
              </li>
              <li>
                <strong>贷款期限：</strong>贷款的年限，可选5-30年。
              </li>
              <li>
                <strong>年利率：</strong>贷款的年利率，以百分比表示。
              </li>
              <li>
                <strong>还款方式：</strong>可选等额本息或等额本金。
              </li>
            </ul>

            <Divider />

            <Title level={5}>还款方式说明</Title>
            <Paragraph>
              <strong>等额本息：</strong>每月还款金额相同，前期还款利息占比较大，后期本金占比增加。
            </Paragraph>
            <Paragraph>
              <strong>等额本金：</strong>
              每月归还相同数额的本金，但每月还款总金额不同，呈现逐月递减趋势。
            </Paragraph>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default MortgageCalculator;
