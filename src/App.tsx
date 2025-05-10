import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/Home';
import CategoryPage from './pages/Category';
import MortgageCalculatorPage from './pages/tools/MortgageCalculator';
import NotFoundPage from './pages/NotFound';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/category/:categoryId" element={<CategoryPage />} />
          <Route path="/tools/mortgage-calculator" element={<MortgageCalculatorPage />} />
          {/* 其他工具路径可以在这里添加 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
};

export default App;
