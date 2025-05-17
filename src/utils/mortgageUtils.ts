import { MortgageResult, PaymentScheduleItem, PrepaymentOption, PrepaymentResult } from 'types';

/**
 * 计算等额本息月供金额
 * @param principal 贷款本金
 * @param ratePerMonth 月利率
 * @param months 贷款月数
 * @returns 每月月供金额
 */
export const calculateEqualPayment = (
  principal: number,
  ratePerMonth: number,
  months: number
): number => {
  if (ratePerMonth === 0) return principal / months;
  const x = Math.pow(1 + ratePerMonth, months);
  return (principal * ratePerMonth * x) / (x - 1);
};

/**
 * 计算等额本金首月月供
 * @param principal 贷款本金
 * @param ratePerMonth 月利率
 * @param months 贷款月数
 * @returns 首月月供金额
 */
export const calculateEqualPrincipalFirstPayment = (
  principal: number,
  ratePerMonth: number,
  months: number
): number => {
  return principal / months + principal * ratePerMonth;
};

/**
 * 计算房贷
 * @param loanAmount 贷款金额
 * @param interestRate 年利率(%)
 * @param loanTermMonths 贷款期限(月)
 * @param paymentType 还款方式 ('equal-principal-interest'|'equal-principal')
 * @returns 房贷计算结果
 */
export const calculateMortgage = (
  loanAmount: number,
  interestRate: number,
  loanTermMonths: number,
  paymentType: 'equal-principal-interest' | 'equal-principal'
): MortgageResult => {
  const principal = loanAmount;
  const monthlyRate = interestRate / 100 / 12;
  const totalMonths = loanTermMonths;

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

  return {
    monthlyPayment,
    totalPayment,
    totalInterest,
    loanAmount: principal,
    schedule,
  };
};

/**
 * 计算提前还款结果
 * @param originalResult 原始贷款计算结果
 * @param prepaymentOption 提前还款选项
 * @param interestRate 年利率(%)
 * @param paymentType 还款方式
 * @returns 提前还款计算结果
 */
export const calculatePrepayment = (
  originalResult: MortgageResult,
  prepaymentOption: PrepaymentOption,
  interestRate: number,
  paymentType: 'equal-principal-interest' | 'equal-principal'
): PrepaymentResult => {
  const { timing, amount, adjustmentType } = prepaymentOption;
  const monthlyRate = interestRate / 100 / 12;

  // 获取提前还款时刻的剩余本金
  const prepaymentMonth = originalResult.schedule.find(item => item.month === timing);
  if (!prepaymentMonth) {
    throw new Error('提前还款时间超出贷款期限');
  }

  // 计算剩余本金和已还期数
  const remainingPrincipal = prepaymentMonth.remainingPrincipal;
  const paidMonths = timing;
  const remainingPrincipalAfterPrepayment = remainingPrincipal - amount;

  // 提前还款后剩余期限
  const newTermMonths = originalResult.schedule.length - paidMonths;

  // 如果选择减少月供方式
  if (adjustmentType === 'reduce-payment') {
    let targetTerm = newTermMonths;
    // 如果设置了目标月供
    if (prepaymentOption.targetPayment) {
      // 根据目标月供反推期限，适用于等额本息
      if (paymentType === 'equal-principal-interest') {
        const monthlyPayment = prepaymentOption.targetPayment;
        // 使用二分法求解期限
        let left = 1;
        let right = 30 * 12; // 最大30年

        while (left <= right) {
          const mid = Math.floor((left + right) / 2);
          const payment = calculateEqualPayment(
            remainingPrincipalAfterPrepayment,
            monthlyRate,
            mid
          );

          if (Math.abs(payment - monthlyPayment) < 0.01) {
            targetTerm = mid;
            break;
          }

          if (payment > monthlyPayment) {
            left = mid + 1;
          } else {
            right = mid - 1;
          }
        }
      }
    }

    // 计算新的还款计划
    const newSchedule: PaymentScheduleItem[] = [];

    // 复制已还部分的计划
    for (let i = 0; i < paidMonths; i++) {
      newSchedule.push({ ...originalResult.schedule[i] });
    }

    // 计算新的剩余还款计划
    const newRemainingSchedule = calculateMortgage(
      remainingPrincipalAfterPrepayment,
      interestRate,
      targetTerm,
      paymentType
    ).schedule;

    // 添加新的剩余还款计划，并调整月份
    for (let i = 0; i < newRemainingSchedule.length; i++) {
      newSchedule.push({
        ...newRemainingSchedule[i],
        month: paidMonths + newRemainingSchedule[i].month,
      });
    }

    // 计算新的总还款和总利息
    const originalPartPayment = originalResult.schedule
      .slice(0, paidMonths)
      .reduce((sum, item) => sum + item.payment, 0);

    const newPartPayment = newRemainingSchedule.reduce((sum, item) => sum + item.payment, 0);
    const newTotalPayment = originalPartPayment + newPartPayment + amount;
    const newTotalInterest = newTotalPayment - originalResult.loanAmount;

    return {
      originalMonthlyPayment: originalResult.monthlyPayment,
      originalTotalPayment: originalResult.totalPayment,
      originalTotalInterest: originalResult.totalInterest,
      originalTerm: originalResult.schedule.length,

      newMonthlyPayment: newRemainingSchedule[0].payment,
      newTotalPayment,
      newTotalInterest,
      newTerm: newSchedule.length,

      savedInterest: originalResult.totalInterest - newTotalInterest,
      savedTerm: originalResult.schedule.length - newSchedule.length,

      schedule: newSchedule,
    };
  }
  // 如果选择减少期限方式
  else {
    // 计算新的还款期限
    let newTerm = newTermMonths;
    if (prepaymentOption.targetTerm) {
      // 如果设置了目标期限，确保不超过剩余期限
      newTerm = Math.min(prepaymentOption.targetTerm, newTermMonths);
    } else {
      // 否则，使用公式计算新的期限
      if (paymentType === 'equal-principal-interest') {
        // 保持月供不变，计算新的期限
        const monthlyPayment = originalResult.monthlyPayment;

        // 使用二分法求解期限
        let left = 1;
        let right = newTermMonths;

        while (left <= right) {
          const mid = Math.floor((left + right) / 2);
          const payment = calculateEqualPayment(
            remainingPrincipalAfterPrepayment,
            monthlyRate,
            mid
          );

          if (Math.abs(payment - monthlyPayment) < 0.01) {
            newTerm = mid;
            break;
          }

          if (payment < monthlyPayment) {
            right = mid - 1;
          } else {
            left = mid + 1;
          }
        }

        // 如果二分法无法找到精确匹配，使用最接近的值
        if (left > right) {
          newTerm = Math.floor(
            remainingPrincipalAfterPrepayment /
              (monthlyPayment - remainingPrincipalAfterPrepayment * monthlyRate)
          );
          newTerm = Math.max(1, Math.min(newTerm, newTermMonths));
        }
      }
    }

    // 计算新的还款计划
    const newSchedule: PaymentScheduleItem[] = [];

    // 复制已还部分的计划
    for (let i = 0; i < paidMonths; i++) {
      newSchedule.push({ ...originalResult.schedule[i] });
    }

    // 计算新的剩余还款计划
    const newRemainingSchedule = calculateMortgage(
      remainingPrincipalAfterPrepayment,
      interestRate,
      newTerm,
      paymentType
    ).schedule;

    // 添加新的剩余还款计划，并调整月份
    for (let i = 0; i < newRemainingSchedule.length; i++) {
      newSchedule.push({
        ...newRemainingSchedule[i],
        month: paidMonths + newRemainingSchedule[i].month,
      });
    }

    // 计算新的总还款和总利息
    const originalPartPayment = originalResult.schedule
      .slice(0, paidMonths)
      .reduce((sum, item) => sum + item.payment, 0);

    const newPartPayment = newRemainingSchedule.reduce((sum, item) => sum + item.payment, 0);
    const newTotalPayment = originalPartPayment + newPartPayment + amount;
    const newTotalInterest = newTotalPayment - originalResult.loanAmount;

    return {
      originalMonthlyPayment: originalResult.monthlyPayment,
      originalTotalPayment: originalResult.totalPayment,
      originalTotalInterest: originalResult.totalInterest,
      originalTerm: originalResult.schedule.length,

      newMonthlyPayment: newRemainingSchedule[0].payment,
      newTotalPayment,
      newTotalInterest,
      newTerm: newSchedule.length,

      savedInterest: originalResult.totalInterest - newTotalInterest,
      savedTerm: originalResult.schedule.length - newSchedule.length,

      schedule: newSchedule,
    };
  }
};

/**
 * 根据月供金额计算可贷款金额
 * @param monthlyPayment 月供金额
 * @param interestRate 年利率(%)
 * @param loanTermMonths 贷款期限(月)
 * @param paymentType 还款方式
 * @returns 可贷款金额
 */
export const calculateLoanAmountByPayment = (
  monthlyPayment: number,
  interestRate: number,
  loanTermMonths: number,
  paymentType: 'equal-principal-interest' | 'equal-principal'
): number => {
  const monthlyRate = interestRate / 100 / 12;

  if (paymentType === 'equal-principal-interest') {
    // 等额本息
    if (monthlyRate === 0) return monthlyPayment * loanTermMonths;
    const x = Math.pow(1 + monthlyRate, loanTermMonths);
    return (monthlyPayment * (x - 1)) / (monthlyRate * x);
  } else {
    // 等额本金，按首月月供计算
    const principalPerMonth = monthlyPayment / (1 + loanTermMonths * monthlyRate);
    return principalPerMonth * loanTermMonths;
  }
};

/**
 * 月份转换为文本（例如：12 -> "1年"，15 -> "1年3个月"）
 * @param months 月份数
 * @returns 格式化的时间文本
 */
export const formatMonthsToYearMonth = (months: number): string => {
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) {
    return `${remainingMonths}个月`;
  } else if (remainingMonths === 0) {
    return `${years}年`;
  } else {
    return `${years}年${remainingMonths}个月`;
  }
};
