import React, { useState } from 'react';
import {
  Typography,
  Form,
  InputNumber,
  Select,
  Card,
  Divider,
  Breadcrumb,
  Row,
  Col,
  Button,
  Table,
  Slider,
} from 'antd';
import { HomeOutlined, DollarOutlined, BankOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Paragraph } = Typography;
const { Option } = Select;

interface LoanDetail {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  remainingPrincipal: number;
}

const LoanCalculator: React.FC = () => {
  const [loanAmount, setLoanAmount] = useState<number>(100000);
  const [loanTerm, setLoanTerm] = useState<number>(36); // 默认3年
  const [interestRate, setInterestRate] = useState<number>(4.35); // 默认年利率4.35%
  const [paymentMethod, setPaymentMethod] = useState<string>('equal');
  const [loanDetails, setLoanDetails] = useState<LoanDetail[]>([]);

  // 计算月供
  const calculateLoan = () => {
    if (!loanAmount || !loanTerm || !interestRate) {
      return;
    }

    const monthlyRate = interestRate / 100 / 12;
    const details: LoanDetail[] = [];

    if (paymentMethod === 'equal') {
      // 等额本息
      const monthlyPayment =
        (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) /
        (Math.pow(1 + monthlyRate, loanTerm) - 1);
      let remainingPrincipal = loanAmount;

      for (let i = 1; i <= loanTerm; i++) {
        const interest = remainingPrincipal * monthlyRate;
        const principal = monthlyPayment - interest;
        remainingPrincipal -= principal;

        details.push({
          month: i,
          payment: parseFloat(monthlyPayment.toFixed(2)),
          principal: parseFloat(principal.toFixed(2)),
          interest: parseFloat(interest.toFixed(2)),
          remainingPrincipal: parseFloat(remainingPrincipal.toFixed(2)),
        });
      }
    } else {
      // 等额本金
      const monthlyPrincipal = loanAmount / loanTerm;
      let remainingPrincipal = loanAmount;

      for (let i = 1; i <= loanTerm; i++) {
        const interest = remainingPrincipal * monthlyRate;
        const payment = monthlyPrincipal + interest;
        remainingPrincipal -= monthlyPrincipal;

        details.push({
          month: i,
          payment: parseFloat(payment.toFixed(2)),
          principal: parseFloat(monthlyPrincipal.toFixed(2)),
          interest: parseFloat(interest.toFixed(2)),
          remainingPrincipal: parseFloat(remainingPrincipal.toFixed(2)),
        });
      }
    }

    setLoanDetails(details);
  };

  // 计算总还款额
  const getTotalPayment = (): string => {
    if (loanDetails.length === 0) return '0.00';
    const totalPayment = loanDetails.reduce((sum, item) => sum + item.payment, 0);
    return totalPayment.toLocaleString('zh-CN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // 计算总利息
  const getTotalInterest = (): string => {
    if (loanDetails.length === 0) return '0.00';
    const totalInterest = loanDetails.reduce((sum, item) => sum + item.interest, 0);
    return totalInterest.toLocaleString('zh-CN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // 表格列定义
  const columns = [
    {
      title: '期数',
      dataIndex: 'month',
      key: 'month',
    },
    {
      title: '月供(元)',
      dataIndex: 'payment',
      key: 'payment',
      render: (text: number) => text.toLocaleString('zh-CN', { minimumFractionDigits: 2 }),
    },
    {
      title: '本金(元)',
      dataIndex: 'principal',
      key: 'principal',
      render: (text: number) => text.toLocaleString('zh-CN', { minimumFractionDigits: 2 }),
    },
    {
      title: '利息(元)',
      dataIndex: 'interest',
      key: 'interest',
      render: (text: number) => text.toLocaleString('zh-CN', { minimumFractionDigits: 2 }),
    },
    {
      title: '剩余本金(元)',
      dataIndex: 'remainingPrincipal',
      key: 'remainingPrincipal',
      render: (text: number) => text.toLocaleString('zh-CN', { minimumFractionDigits: 2 }),
    },
  ];

  return (
    <div className="loan-calculator-page">
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
          <DollarOutlined /> 贷款计算器
        </Breadcrumb.Item>
      </Breadcrumb>

      <Title level={2} style={{ marginTop: 16 }}>
        贷款计算器
      </Title>
      <Paragraph>计算各类贷款的还款信息，支持等额本息和等额本金两种计算方式。</Paragraph>

      <Card>
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="贷款金额(元)">
                <InputNumber
                  style={{ width: '100%' }}
                  min={1000}
                  step={1000}
                  value={loanAmount}
                  onChange={value => setLoanAmount(value || 0)}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => Number(value!.replace(/\$\s?|(,*)/g, ''))}
                />
              </Form.Item>
              <Slider
                min={10000}
                max={1000000}
                step={10000}
                value={loanAmount}
                onChange={value => setLoanAmount(value)}
              />
            </Col>

            <Col span={8}>
              <Form.Item label="贷款期限(月)">
                <InputNumber
                  style={{ width: '100%' }}
                  min={1}
                  max={360}
                  value={loanTerm}
                  onChange={value => setLoanTerm(value || 0)}
                />
              </Form.Item>
              <Slider
                min={12}
                max={360}
                step={12}
                value={loanTerm}
                onChange={value => setLoanTerm(value)}
                marks={{
                  12: '1年',
                  60: '5年',
                  120: '10年',
                  240: '20年',
                  360: '30年',
                }}
              />
            </Col>

            <Col span={8}>
              <Form.Item label="年利率(%)">
                <InputNumber
                  style={{ width: '100%' }}
                  min={0.1}
                  max={24}
                  step={0.01}
                  value={interestRate}
                  onChange={value => setInterestRate(value || 0)}
                />
              </Form.Item>
              <Slider
                min={1}
                max={24}
                step={0.01}
                value={interestRate}
                onChange={value => setInterestRate(value)}
              />
            </Col>
          </Row>

          <Form.Item label="还款方式">
            <Select value={paymentMethod} onChange={value => setPaymentMethod(value)}>
              <Option value="equal">等额本息</Option>
              <Option value="principal">等额本金</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" onClick={calculateLoan}>
              计算
            </Button>
          </Form.Item>
        </Form>

        {loanDetails.length > 0 && (
          <>
            <Divider orientation="left">计算结果</Divider>

            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={8}>
                <Card title="总贷款额" style={{ textAlign: 'center' }}>
                  <Title level={4}>
                    {loanAmount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}元
                  </Title>
                </Card>
              </Col>
              <Col span={8}>
                <Card title="总还款额" style={{ textAlign: 'center' }}>
                  <Title level={4}>{getTotalPayment()}元</Title>
                </Card>
              </Col>
              <Col span={8}>
                <Card title="总利息" style={{ textAlign: 'center' }}>
                  <Title level={4}>{getTotalInterest()}元</Title>
                </Card>
              </Col>
            </Row>

            <Table
              dataSource={loanDetails}
              columns={columns}
              rowKey="month"
              pagination={{
                pageSize: 12,
                showSizeChanger: true,
                pageSizeOptions: ['12', '24', '36', '60'],
              }}
            />
          </>
        )}
      </Card>
    </div>
  );
};

export default LoanCalculator;
