import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle, XCircle } from 'lucide-react';

const Upload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setUploadStatus('idle');
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadStatus('idle');
    // Simulate upload process
    setTimeout(() => {
      // Randomly succeed or fail for demo purposes
      if (Math.random() > 0.2) {
        setUploadStatus('success');
      } else {
        setUploadStatus('error');
      }
      setIsUploading(false);
      setSelectedFile(null);
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold text-white mb-6 text-center">Envie Seu Voo</h1>
      <div className="bg-gray-800 rounded-lg shadow-lg p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="flight-file" className="block text-sm font-medium text-gray-300 mb-2">Arquivo de Log de Voo (.igc)</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-gray-500" />
                <div className="flex text-sm text-gray-400">
                  <label htmlFor="flight-file" className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-cyan-400 hover:text-cyan-300 focus-within:outline-none">
                    <span>Selecione um arquivo</span>
                    <input id="flight-file" name="flight-file" type="file" className="sr-only" onChange={handleFileChange} accept=".igc" />
                  </label>
                  <p className="pl-1">ou arraste e solte</p>
                </div>
                <p className="text-xs text-gray-500">Arquivos IGC de até 10MB</p>
              </div>
            </div>
            {selectedFile && (
              <div className="mt-4 flex items-center text-sm text-gray-300">
                <FileText className="mr-2 text-cyan-400"/>
                <span>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}
          </div>
          
          <button 
            type="submit" 
            disabled={!selectedFile || isUploading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-cyan-500 hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            {isUploading ? 'Enviando...' : 'Enviar Voo'}
          </button>
        </form>
        
        {uploadStatus === 'success' && (
          <div className="mt-6 p-4 bg-green-900/50 border border-green-500 rounded-md flex items-center space-x-3">
            <CheckCircle className="text-green-400" />
            <p className="text-green-300">Voo enviado com sucesso! Ele será processado em breve.</p>
          </div>
        )}
        {uploadStatus === 'error' && (
          <div className="mt-6 p-4 bg-red-900/50 border border-red-500 rounded-md flex items-center space-x-3">
            <XCircle className="text-red-400" />
            <p className="text-red-300">Falha no envio. Por favor, tente um arquivo diferente ou tente novamente mais tarde.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;