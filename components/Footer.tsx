import React from 'react';
import { Wind } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-700 mt-12">
      <div className="container mx-auto px-4 py-6 text-center text-gray-500">
        <div className="flex justify-center items-center space-x-2 mb-2">
            <Wind className="text-cyan-500" />
            <p className="font-bold text-lg text-gray-400">AeroLog</p>
        </div>
        <p>&copy; {new Date().getFullYear()} AeroLog. Todos os direitos reservados. O céu está esperando.</p>
      </div>
    </footer>
  );
};

export default Footer;