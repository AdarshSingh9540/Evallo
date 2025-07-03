import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { LogInspector } from './pages/LogInspector';
import { LogIngestion } from './pages/LogIngestion';
import { Analytics } from './pages/Analytics';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ingestion" element={<LogIngestion />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/inspector" element={<LogInspector />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;