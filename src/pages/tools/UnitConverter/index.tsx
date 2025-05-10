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
  Tabs,
} from 'antd';
import { HomeOutlined, SwapOutlined, TableOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

// 定义转换类型接口
interface ConversionUnit {
  name: string;
  ratio: number;
}

interface ConversionType {
  name: string;
  units: {
    [key: string]: ConversionUnit;
  };
  convert?: (value: number, from: string, to: string) => number;
}

// 单位转换配置
const conversionTypes: { [key: string]: ConversionType } = {
  length: {
    name: '长度转换',
    units: {
      meter: { name: '米 (m)', ratio: 1 },
      kilometer: { name: '千米 (km)', ratio: 0.001 },
      centimeter: { name: '厘米 (cm)', ratio: 100 },
      millimeter: { name: '毫米 (mm)', ratio: 1000 },
      mile: { name: '英里 (mi)', ratio: 0.000621371 },
      yard: { name: '码 (yd)', ratio: 1.09361 },
      foot: { name: '英尺 (ft)', ratio: 3.28084 },
      inch: { name: '英寸 (in)', ratio: 39.3701 },
    },
  },
  weight: {
    name: '重量转换',
    units: {
      kilogram: { name: '千克 (kg)', ratio: 1 },
      gram: { name: '克 (g)', ratio: 1000 },
      milligram: { name: '毫克 (mg)', ratio: 1000000 },
      ton: { name: '吨 (t)', ratio: 0.001 },
      pound: { name: '磅 (lb)', ratio: 2.20462 },
      ounce: { name: '盎司 (oz)', ratio: 35.274 },
    },
  },
  area: {
    name: '面积转换',
    units: {
      squareMeter: { name: '平方米 (m²)', ratio: 1 },
      squareKilometer: { name: '平方千米 (km²)', ratio: 0.000001 },
      squareCentimeter: { name: '平方厘米 (cm²)', ratio: 10000 },
      hectare: { name: '公顷 (ha)', ratio: 0.0001 },
      squareFoot: { name: '平方英尺 (ft²)', ratio: 10.7639 },
      acre: { name: '英亩 (acre)', ratio: 0.000247105 },
    },
  },
  temperature: {
    name: '温度转换',
    units: {
      celsius: { name: '摄氏度 (°C)', ratio: 1 },
      fahrenheit: { name: '华氏度 (°F)', ratio: 1 },
      kelvin: { name: '开尔文 (K)', ratio: 1 },
    },
    // 温度转换需要特殊处理
    convert: (value: number, from: string, to: string): number => {
      if (from === to) return value;

      // 先转为摄氏度
      let celsius;
      if (from === 'celsius') {
        celsius = value;
      } else if (from === 'fahrenheit') {
        celsius = (value - 32) * (5 / 9);
      } else if (from === 'kelvin') {
        celsius = value - 273.15;
      } else {
        return 0;
      }

      // 从摄氏度转为目标单位
      if (to === 'celsius') {
        return celsius;
      } else if (to === 'fahrenheit') {
        return celsius * (9 / 5) + 32;
      } else if (to === 'kelvin') {
        return celsius + 273.15;
      } else {
        return 0;
      }
    },
  },
  volume: {
    name: '体积转换',
    units: {
      liter: { name: '升 (L)', ratio: 1 },
      milliliter: { name: '毫升 (mL)', ratio: 1000 },
      cubicMeter: { name: '立方米 (m³)', ratio: 0.001 },
      gallon: { name: '加仑 (gal)', ratio: 0.264172 },
      quart: { name: '夸脱 (qt)', ratio: 1.05669 },
      pint: { name: '品脱 (pt)', ratio: 2.11338 },
      cup: { name: '杯 (cup)', ratio: 4.22675 },
    },
  },
};

const UnitConverter: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('length');
  const [fromUnit, setFromUnit] = useState<string>(Object.keys(conversionTypes.length.units)[0]);
  const [toUnit, setToUnit] = useState<string>(Object.keys(conversionTypes.length.units)[1]);
  const [fromValue, setFromValue] = useState<number>(1);
  const [toValue, setToValue] = useState<number>(0);

  // 当输入值或单位改变时转换值
  const convert = (value: number, from: string, to: string, type: string) => {
    const conversion = conversionTypes[type];

    // 温度特殊处理
    if (type === 'temperature' && conversion.convert) {
      return conversion.convert(value, from, to);
    }

    // 其他单位的通用转换逻辑
    const fromRatio = conversion.units[from]?.ratio || 1;
    const toRatio = conversion.units[to]?.ratio || 1;

    // 转换到基本单位，再转换到目标单位
    return (value / fromRatio) * toRatio;
  };

  // 处理输入值变化
  const handleFromValueChange = (value: number | null) => {
    if (value !== null) {
      setFromValue(value);
      const converted = convert(value, fromUnit, toUnit, selectedType);
      setToValue(Number(converted.toFixed(6)));
    }
  };

  // 处理类型变化
  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    const units = Object.keys(conversionTypes[type].units);
    setFromUnit(units[0]);
    setToUnit(units[1]);
    handleFromValueChange(fromValue);
  };

  // 处理单位变化
  const handleUnitChange = (value: string, field: 'from' | 'to') => {
    if (field === 'from') {
      setFromUnit(value);
    } else {
      setToUnit(value);
    }
    handleFromValueChange(fromValue);
  };

  // 交换单位
  const handleSwapUnits = () => {
    const tempUnit = fromUnit;
    setFromUnit(toUnit);
    setToUnit(tempUnit);

    const tempValue = fromValue;
    setFromValue(toValue);
    setToValue(tempValue);
  };

  return (
    <div className="unit-converter-page">
      <Breadcrumb>
        <Breadcrumb.Item>
          <Link to="/">
            <HomeOutlined /> 首页
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/category/converter">
            <TableOutlined /> 转换工具
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <SwapOutlined /> 单位转换器
        </Breadcrumb.Item>
      </Breadcrumb>

      <Title level={2} style={{ marginTop: 16 }}>
        单位转换器
      </Title>
      <Paragraph>快速转换不同单位之间的值，包括长度、重量、面积、温度和体积等。</Paragraph>

      <Card>
        <Tabs activeKey={selectedType} onChange={handleTypeChange}>
          {Object.entries(conversionTypes).map(([key, value]) => (
            <TabPane tab={value.name} key={key} />
          ))}
        </Tabs>

        <Divider />

        <Form layout="vertical">
          <Row gutter={16} align="middle">
            <Col span={9}>
              <Form.Item label="输入值">
                <InputNumber
                  style={{ width: '100%' }}
                  value={fromValue}
                  onChange={handleFromValueChange}
                  min={0}
                  precision={6}
                />
              </Form.Item>
            </Col>

            <Col span={7}>
              <Form.Item label="从">
                <Select value={fromUnit} onChange={value => handleUnitChange(value, 'from')}>
                  {Object.entries(conversionTypes[selectedType].units).map(([key, unit]) => (
                    <Option key={key} value={key}>
                      {unit.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col
              span={1}
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 20,
              }}
            >
              <SwapOutlined
                style={{ fontSize: '20px', cursor: 'pointer' }}
                onClick={handleSwapUnits}
              />
            </Col>

            <Col span={7}>
              <Form.Item label="到">
                <Select value={toUnit} onChange={value => handleUnitChange(value, 'to')}>
                  {Object.entries(conversionTypes[selectedType].units).map(([key, unit]) => (
                    <Option key={key} value={key}>
                      {unit.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col span={24}>
              <Card style={{ background: '#f5f5f5' }}>
                <Title level={4} style={{ margin: 0, textAlign: 'center' }}>
                  {toValue} {conversionTypes[selectedType].units[toUnit]?.name.split(' ')[0]}
                </Title>
              </Card>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default UnitConverter;
