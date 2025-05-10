import React, { useState } from 'react';
import '../styles/MortgageCalculator.css';

const MortgageCalculator = () => {
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [loanTerm, setLoanTerm] = useState(30);
  const [interestRate, setInterestRate] = useState(4.5);
  const [downPayment, setDownPayment] = useState(200000);
  const [paymentType, setPaymentType] = useState('equal-principal-interest'); // 等额本息
  const [results, setResults] = useState(null);
  const [showSchedule, setShowSchedule] = useState(false);

  // 计算等额本息月付款
  const calculateEqualPayment = (principal, ratePerMonth, months) => {
    if (ratePerMonth === 0) return principal / months;
    const x = Math.pow(1 + ratePerMonth, months);
    return principal * ratePerMonth * x / (x - 1);
  };

  // 计算房贷
  const calculateMortgage = () => {
    const principal = loanAmount - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const totalMonths = loanTerm * 12;
    
    let monthlyPayment, totalPayment, totalInterest;
    let schedule = [];
    
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
          remainingPrincipal: Math.max(0, remainingPrincipal)
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
          remainingPrincipal: Math.max(0, remainingPrincipal)
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
      schedule
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    calculateMortgage();
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="mortgage-calculator">
      <h2>房贷计算器</h2>
      <form onSubmit={handleSubmit} className="calculator-form">
        <div>
          <div className="form-group">
            <label htmlFor="loanAmount">贷款总额 (元)</label>
            <input
              id="loanAmount"
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              min="0"
              step="10000"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="downPayment">首付金额 (元)</label>
            <input
              id="downPayment"
              type="number"
              value={downPayment}
              onChange={(e) => setDownPayment(Number(e.target.value))}
              min="0"
              step="10000"
              required
            />
          </div>
        </div>
        <div>
          <div className="form-group">
            <label htmlFor="loanTerm">贷款期限 (年)</label>
            <select
              id="loanTerm"
              value={loanTerm}
              onChange={(e) => setLoanTerm(Number(e.target.value))}
              required
            >
              <option value="5">5 年</option>
              <option value="10">10 年</option>
              <option value="15">15 年</option>
              <option value="20">20 年</option>
              <option value="25">25 年</option>
              <option value="30">30 年</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="interestRate">年利率 (%)</label>
            <input
              id="interestRate"
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              min="0"
              step="0.01"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="paymentType">还款方式</label>
            <select
              id="paymentType"
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              required
            >
              <option value="equal-principal-interest">等额本息</option>
              <option value="equal-principal">等额本金</option>
            </select>
          </div>
        </div>
        <div>
          <button type="submit">计算</button>
        </div>
      </form>

      {results && (
        <div className="calculator-results">
          <h3>计算结果</h3>
          <div className="result-item">
            <span>贷款金额:</span>
            <span>{formatCurrency(results.loanAmount)}</span>
          </div>
          <div className="result-item">
            <span>月供金额{paymentType === 'equal-principal' ? '(首月)' : ''}:</span>
            <span>{formatCurrency(results.monthlyPayment)}</span>
          </div>
          <div className="result-item">
            <span>总支付金额:</span>
            <span>{formatCurrency(results.totalPayment)}</span>
          </div>
          <div className="result-item">
            <span>总利息:</span>
            <span>{formatCurrency(results.totalInterest)}</span>
          </div>
          
          <div className="payment-schedule">
            <button 
              type="button" 
              onClick={() => setShowSchedule(!showSchedule)}
            >
              {showSchedule ? '隐藏还款计划' : '查看还款计划'}
            </button>
            
            {showSchedule && (
              <div className="schedule-table">
                <h4>还款计划表 (前12个月)</h4>
                <table className="payment-table">
                  <thead>
                    <tr>
                      <th>月份</th>
                      <th>月供</th>
                      <th>本金</th>
                      <th>利息</th>
                      <th>剩余本金</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.schedule.slice(0, 12).map((item) => (
                      <tr key={item.month}>
                        <td>{item.month}</td>
                        <td>{formatCurrency(item.payment)}</td>
                        <td>{formatCurrency(item.principalPayment)}</td>
                        <td>{formatCurrency(item.interestPayment)}</td>
                        <td>{formatCurrency(item.remainingPrincipal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MortgageCalculator; 