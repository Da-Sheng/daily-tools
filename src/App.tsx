import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/Home/index';
import CategoryPage from './pages/Category';
import MortgageCalculatorPage from './pages/tools/MortgageCalculator';
import LoanCalculatorPage from './pages/tools/LoanCalculator';
import UnitConverterPage from './pages/tools/UnitConverter';
import DateCalculatorPage from './pages/tools/DateCalculator';
import RandomGeneratorPage from './pages/tools/RandomGenerator';
import NotFoundPage from './pages/NotFound';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/category/:categoryId" element={<CategoryPage />} />

          {/* 金融工具 */}
          <Route path="/tools/mortgage-calculator" element={<MortgageCalculatorPage />} />
          <Route path="/tools/loan-calculator" element={<LoanCalculatorPage />} />

          {/* 转换工具 */}
          <Route path="/tools/unit-converter" element={<UnitConverterPage />} />

          {/* 日常工具 */}
          <Route path="/tools/date-calculator" element={<DateCalculatorPage />} />

          {/* 生成器 */}
          <Route path="/tools/random-generator" element={<RandomGeneratorPage />} />

          {/* 404页面 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
};

export default App;
