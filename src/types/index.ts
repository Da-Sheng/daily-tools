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
