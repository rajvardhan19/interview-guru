import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Interview from './pages/Interview';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-xl p-6">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/interview" element={<Interview />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </div>
        </main>
        <Toaster position="bottom-right" />
      </div>
    </Router>
  );
}

export default App;