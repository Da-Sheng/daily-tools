// 工具分类
export interface ToolCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
}

// 工具项
export interface ToolItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  path: string;
  categoryId: string;
  category?: ToolCategory;
}

// 房贷计算结果
export interface MortgageResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  loanAmount: number;
  schedule: PaymentScheduleItem[];
}

// 还款计划项
export interface PaymentScheduleItem {
  month: number;
  payment: number;
  principalPayment: number;
  interestPayment: number;
  remainingPrincipal: number;
}

// 提前还款选项
export interface PrepaymentOption {
  id: string; // 唯一标识
  name: string; // 方案名称
  timing: number; // 提前还款时间点（第几个月）
  amount: number; // 提前还款金额
  adjustmentType: 'reduce-term' | 'reduce-payment'; // 调整方式：减少期限 or 减少月供
  targetPayment?: number; // 目标月供（当adjustmentType为reduce-payment时有效）
  targetTerm?: number; // 目标期限（当adjustmentType为reduce-term时有效）
}

// 提前还款计算结果
export interface PrepaymentResult {
  originalMonthlyPayment: number; // 原始月供
  originalTotalPayment: number; // 原始总还款
  originalTotalInterest: number; // 原始总利息
  originalTerm: number; // 原始期限

  newMonthlyPayment: number; // 新月供
  newTotalPayment: number; // 新总还款
  newTotalInterest: number; // 新总利息
  newTerm: number; // 新期限

  savedInterest: number; // 节省的利息
  savedTerm: number; // 节省的期限（月）

  schedule: PaymentScheduleItem[]; // 新的还款计划
}

// 提前还款方案比较
export interface PrepaymentComparison {
  originalPlan: MortgageResult; // 原始方案
  prepaymentPlans: PrepaymentResult[]; // 提前还款方案结果列表
}
