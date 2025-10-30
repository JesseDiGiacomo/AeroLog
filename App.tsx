
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import FlightDetail from './pages/FlightDetail';
import Upload from './pages/Upload';
import Ranking from './pages/Ranking';
import Profile from './pages/Profile';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
import Statistics from './pages/Statistics';

function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col font-sans">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            
            <Route element={<PrivateRoute />}>
              <Route path="/flight/:id" element={<FlightDetail />} />
              <Route path="/ranking" element={<Ranking />} />
              <Route path="/statistics" element={<Statistics />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/upload" element={<Upload />} />
            </Route>

          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
}

export default App;
