import React from 'react';
import { Loader } from 'lucide-react';

const LoadingSpinner: React.FC<{ text?: string }> = ({ text = "Carregando..."}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-cyan-400">
      <Loader className="animate-spin" size={48} />
      <p className="mt-4 text-lg">{text}</p>
    </div>
  );
};

export default LoadingSpinner;