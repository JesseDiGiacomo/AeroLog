
import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load pages for code splitting (production optimization)
const Dashboard = lazy(() => import('./pages/Dashboard'));
const FlightDetail = lazy(() => import('./pages/FlightDetail'));
const Upload = lazy(() => import('./pages/Upload'));
const Ranking = lazy(() => import('./pages/Ranking'));
const Profile = lazy(() => import('./pages/Profile'));
const Login = lazy(() => import('./pages/Login'));
const Statistics = lazy(() => import('./pages/Statistics'));

function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col font-sans">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Suspense fallback={<LoadingSpinner text="Carregando página..." />}>
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
          </Suspense>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
}

export default App;
