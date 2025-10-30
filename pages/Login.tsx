
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Wind, Lock, User, AlertCircle } from 'lucide-react';

const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.617-3.276-11.283-7.943l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.018,35.189,44,30.023,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);


const Login: React.FC = () => {
    const [cpf, setCpf] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const auth = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || "/";

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const user = await auth.login(cpf, password);
            if (user) {
                navigate(from, { replace: true });
            } else {
                setError('CPF ou senha inválidos.');
            }
        } catch (err) {
            setError('Ocorreu um erro ao tentar fazer login.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setError('');
        try {
            const user = await auth.loginWithGoogle();
             if (user) {
                navigate(from, { replace: true });
            } else {
                setError('Falha ao autenticar com o Google.');
            }
        } catch (err) {
            setError('Ocorreu um erro ao tentar fazer login com o Google.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center py-12">
            <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl shadow-cyan-500/10 p-8 space-y-6">
                <div className="text-center">
                    <Link to="/" className="flex items-center justify-center space-x-2 text-3xl font-bold text-white hover:text-cyan-400 transition-colors">
                        <Wind className="text-cyan-400" size={32} />
                        <span>AeroLog</span>
                    </Link>
                    <p className="mt-2 text-gray-400">Entre para continuar</p>
                </div>

                {error && (
                    <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg flex items-center space-x-2" role="alert">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleLogin}>
                    <div>
                        <label htmlFor="cpf" className="sr-only">CPF</label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <User className="h-5 w-5 text-gray-500" />
                            </div>
                            <input
                                id="cpf"
                                name="cpf"
                                type="text"
                                value={cpf}
                                onChange={(e) => setCpf(e.target.value)}
                                required
                                className="block w-full rounded-md border-0 bg-gray-700 py-3 pl-10 pr-3 text-white ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-cyan-500 sm:text-sm"
                                placeholder="CPF (e.g., 111.222.333-44)"
                                aria-label="CPF"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="password"  className="sr-only">Senha</label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Lock className="h-5 w-5 text-gray-500" />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="block w-full rounded-md border-0 bg-gray-700 py-3 pl-10 pr-3 text-white ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-cyan-500 sm:text-sm"
                                placeholder="Senha"
                                aria-label="Senha"
                            />
                        </div>
                    </div>
                    
                    <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-cyan-500 hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors">
                        {isLoading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="bg-gray-800 px-2 text-gray-500">Ou continue com</span>
                    </div>
                </div>

                <button onClick={handleGoogleLogin} disabled={isLoading} className="w-full flex items-center justify-center py-3 px-4 border border-gray-600 rounded-lg shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors">
                    <GoogleIcon />
                    Google
                </button>
                
                <div className="text-sm text-center">
                    <a href="#" className="font-medium text-cyan-400 hover:text-cyan-300">
                        Esqueceu sua senha?
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Login;
