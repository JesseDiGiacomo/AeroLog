
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wind, BarChart2, BarChart3, UploadCloud, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-gray-800/50 backdrop-blur-sm sticky top-0 z-50 shadow-lg shadow-cyan-500/10">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 text-2xl font-bold text-white hover:text-cyan-400 transition-colors">
          <Wind className="text-cyan-400" size={28} />
          <span>XCBrasil</span>
        </Link>
        <div className="flex items-center space-x-4 md:space-x-6">
          <Link to="/ranking" className="flex items-center space-x-2 text-gray-300 hover:text-cyan-400 transition-colors">
            <BarChart2 size={20} />
            <span className="hidden md:inline">Rankings</span>
          </Link>
          <Link to="/statistics" className="flex items-center space-x-2 text-gray-300 hover:text-cyan-400 transition-colors">
            <BarChart3 size={20} />
            <span className="hidden md:inline">Estatísticas</span>
          </Link>

          {isAuthenticated && currentUser ? (
            <>
              <Link to={`/profile/${currentUser.id}`} className="flex items-center space-x-2 text-gray-300 hover:text-cyan-400 transition-colors group">
                 <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-8 h-8 rounded-full border-2 border-gray-600 group-hover:border-cyan-400 transition-colors" />
                <span className="hidden md:inline">Perfil</span>
              </Link>
              <button onClick={handleLogout} className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors">
                <LogOut size={20} />
                <span className="hidden md:inline">Sair</span>
              </button>
            </>
          ) : (
            <Link to="/login" className="flex items-center space-x-2 text-gray-300 hover:text-cyan-400 transition-colors">
              <LogIn size={20} />
              <span className="hidden md:inline">Login</span>
            </Link>
          )}

          <Link to="/upload" className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-2 md:px-4 px-2 rounded-lg flex items-center md:space-x-2 transition-transform transform hover:scale-105">
            <UploadCloud size={20} />
            <span className="hidden md:inline">Enviar Voo</span>
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;