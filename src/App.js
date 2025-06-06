import React from 'react';
import MortgageCalculator from './components/MortgageCalculator';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>日常工具箱</h1>
      </header>
      <main>
        <MortgageCalculator />
      </main>
      <footer>
        <p>© {new Date().getFullYear()} Daily Tools</p>
      </footer>
    </div>
  );
}

export default App;
