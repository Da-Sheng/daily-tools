import React, { useState } from 'react';
import {
  Typography,
  Form,
  DatePicker,
  InputNumber,
  Select,
  Card,
  Divider,
  Breadcrumb,
  Row,
  Col,
  Tabs,
  Button,
  Statistic,
  Result,
  Space,
} from 'antd';
import { HomeOutlined, CalendarOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import moment, { Moment } from 'moment';
import 'moment/locale/zh-cn';

moment.locale('zh-cn');

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

enum DateCalcMode {
  DateDiff = 'date-diff',
  AddSubtract = 'add-subtract',
  Weekday = 'weekday',
}

const DateCalculator: React.FC = () => {
  const [mode, setMode] = useState<DateCalcMode>(DateCalcMode.DateDiff);

  // 日期差值状态
  const [startDate, setStartDate] = useState<Moment | null>(moment());
  const [endDate, setEndDate] = useState<Moment | null>(moment().add(1, 'month'));
  const [dateDiffResult, setDateDiffResult] = useState<{
    days: number;
    months: number;
    years: number;
    totalDays: number;
    workDays: number;
  } | null>(null);

  // 日期加减状态
  const [baseDate, setBaseDate] = useState<Moment | null>(moment());
  const [timeAmount, setTimeAmount] = useState<number>(1);
  const [timeUnit, setTimeUnit] = useState<string>('days');
  const [operation, setOperation] = useState<string>('add');
  const [addSubtractResult, setAddSubtractResult] = useState<Moment | null>(null);

  // 工作日状态
  const [checkDate, setCheckDate] = useState<Moment | null>(moment());
  const [weekdayResult, setWeekdayResult] = useState<{
    weekday: string;
    isWeekend: boolean;
    isWorkDay: boolean;
    message: string;
  } | null>(null);

  // 计算日期差值
  const calculateDateDiff = () => {
    if (!startDate || !endDate) return;

    const start = moment(startDate);
    const end = moment(endDate);

    // 确保结束日期不早于开始日期
    if (end.isBefore(start)) {
      setDateDiffResult(null);
      return;
    }

    const years = end.diff(start, 'years');
    const months = end.diff(start, 'months') % 12;
    const totalDays = end.diff(start, 'days');

    // 计算工作日数量（排除周六和周日）
    let workDays = 0;
    const tempDate = moment(start);

    while (tempDate.isSameOrBefore(end, 'day')) {
      const weekday = tempDate.day();
      if (weekday !== 0 && weekday !== 6) {
        workDays++;
      }
      tempDate.add(1, 'day');
    }

    setDateDiffResult({
      days: totalDays % 30,
      months,
      years,
      totalDays,
      workDays,
    });
  };

  // 计算日期加减
  const calculateAddSubtract = () => {
    if (!baseDate || !timeAmount) return;

    const date = moment(baseDate);
    const result =
      operation === 'add'
        ? date.clone().add(timeAmount, timeUnit as any)
        : date.clone().subtract(timeAmount, timeUnit as any);

    setAddSubtractResult(result);
  };

  // 计算工作日信息
  const calculateWeekday = () => {
    if (!checkDate) return;

    const date = moment(checkDate);
    const weekday = date.day();
    const weekdayName = date.format('dddd');
    const isWeekend = weekday === 0 || weekday === 6;

    setWeekdayResult({
      weekday: weekdayName,
      isWeekend,
      isWorkDay: !isWeekend,
      message: isWeekend ? '这一天是周末' : '这一天是工作日',
    });
  };

  // 处理模式切换
  const handleModeChange = (newMode: string) => {
    setMode(newMode as DateCalcMode);

    // 重置结果
    setDateDiffResult(null);
    setAddSubtractResult(null);
    setWeekdayResult(null);
  };

  return (
    <div className="date-calculator-page">
      <Breadcrumb>
        <Breadcrumb.Item>
          <Link to="/">
            <HomeOutlined /> 首页
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/category/daily">
            <CalendarOutlined /> 日常工具
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <CalendarOutlined /> 日期计算器
        </Breadcrumb.Item>
      </Breadcrumb>

      <Title level={2} style={{ marginTop: 16 }}>
        日期计算器
      </Title>
      <Paragraph>计算日期差值、日期加减和星期几/工作日信息。</Paragraph>

      <Card>
        <Tabs activeKey={mode} onChange={handleModeChange}>
          <TabPane tab="日期差值计算" key={DateCalcMode.DateDiff} />
          <TabPane tab="日期加减计算" key={DateCalcMode.AddSubtract} />
          <TabPane tab="星期几/工作日查询" key={DateCalcMode.Weekday} />
        </Tabs>

        <Divider />

        {mode === DateCalcMode.DateDiff && (
          <div>
            <Form layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="开始日期">
                    <DatePicker
                      style={{ width: '100%' }}
                      value={startDate}
                      onChange={setStartDate}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="结束日期">
                    <DatePicker style={{ width: '100%' }} value={endDate} onChange={setEndDate} />
                  </Form.Item>
                </Col>
              </Row>
              <Button type="primary" onClick={calculateDateDiff}>
                计算日期差值
              </Button>
            </Form>

            {dateDiffResult && (
              <div style={{ marginTop: 24 }}>
                <Card>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Statistic title="总计日期差" value={dateDiffResult.totalDays} suffix="天" />
                    </Col>
                    <Col span={8}>
                      <Statistic title="工作日天数" value={dateDiffResult.workDays} suffix="天" />
                    </Col>
                    <Col span={8}>
                      <div>
                        <Text>详细差值</Text>
                        <div>
                          {dateDiffResult.years > 0 && `${dateDiffResult.years}年 `}
                          {dateDiffResult.months > 0 && `${dateDiffResult.months}个月 `}
                          {dateDiffResult.days > 0 && `${dateDiffResult.days}天`}
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card>
              </div>
            )}
          </div>
        )}

        {mode === DateCalcMode.AddSubtract && (
          <div>
            <Form layout="vertical">
              <Row gutter={16} align="bottom">
                <Col span={8}>
                  <Form.Item label="基准日期">
                    <DatePicker style={{ width: '100%' }} value={baseDate} onChange={setBaseDate} />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item label="操作">
                    <Select value={operation} onChange={setOperation}>
                      <Option value="add">增加</Option>
                      <Option value="subtract">减少</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="数量">
                    <InputNumber
                      style={{ width: '100%' }}
                      min={1}
                      value={timeAmount}
                      onChange={value => setTimeAmount(value ?? 1)}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="单位">
                    <Select value={timeUnit} onChange={setTimeUnit}>
                      <Option value="days">天</Option>
                      <Option value="weeks">周</Option>
                      <Option value="months">月</Option>
                      <Option value="quarters">季度</Option>
                      <Option value="years">年</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Button type="primary" onClick={calculateAddSubtract}>
                计算结果日期
              </Button>
            </Form>

            {addSubtractResult && (
              <div style={{ marginTop: 24 }}>
                <Result
                  status="success"
                  title="计算结果"
                  subTitle={`${operation === 'add' ? '增加' : '减少'} ${timeAmount} ${
                    timeUnit === 'days'
                      ? '天'
                      : timeUnit === 'weeks'
                      ? '周'
                      : timeUnit === 'months'
                      ? '个月'
                      : timeUnit === 'quarters'
                      ? '个季度'
                      : '年'
                  } 后的日期是:`}
                  extra={
                    <Space direction="vertical" align="center">
                      <Title level={3}>{addSubtractResult.format('YYYY年MM月DD日')}</Title>
                      <Text>{addSubtractResult.format('dddd')}</Text>
                    </Space>
                  }
                />
              </div>
            )}
          </div>
        )}

        {mode === DateCalcMode.Weekday && (
          <div>
            <Form layout="vertical">
              <Row>
                <Col span={12}>
                  <Form.Item label="选择日期">
                    <DatePicker
                      style={{ width: '100%' }}
                      value={checkDate}
                      onChange={setCheckDate}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label=" " colon={false}>
                    <Button type="primary" onClick={calculateWeekday}>
                      查询信息
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>

            {weekdayResult && (
              <div style={{ marginTop: 24 }}>
                <Result
                  status={weekdayResult.isWeekend ? 'warning' : 'success'}
                  title={weekdayResult.weekday}
                  subTitle={weekdayResult.message}
                />
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default DateCalculator;
