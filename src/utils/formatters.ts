/**
 * 将数字格式化为货币形式
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * 格式化数字
 */
export const formatNumber = (value: number, digits = 2): string => {
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
};

/**
 * 格式化百分比
 */
export const formatPercent = (value: number, digits = 2): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'percent',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value / 100);
};
