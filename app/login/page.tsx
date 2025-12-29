"use client";
import { useState } from 'react';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  const manejarLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (error: any) {
      alert("Error al iniciar sesión: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
        <div className="bg-indigo-700 p-8 text-white text-center">
          <h1 className="text-3xl font-bold">Bienvenido</h1>
          <p className="opacity-90">Ingresa a tu cuenta de talento</p>
        </div>

        <form onSubmit={manejarLogin} className="p-8 space-y-6">
          <div className="flex flex-col">
            <label className="text-black font-bold mb-1">Correo Electrónico</label>
            <input 
              type="email" 
              required 
              className="input-estilo" 
              placeholder="tu@email.com"
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>

          <div className="flex flex-col">
            <label className="text-black font-bold mb-1">Contraseña</label>
            <input 
              type="password" 
              required 
              className="input-estilo" 
              placeholder="******"
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>

          <button 
            type="submit" 
            disabled={cargando}
            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition disabled:bg-slate-400"
          >
            {cargando ? "Ingresando..." : "INICIAR SESIÓN"}
          </button>

          <p className="text-center text-black">
            ¿No tienes cuenta? <Link href="/registro" className="text-indigo-600 font-bold hover:underline">Regístrate aquí</Link>
          </p>
        </form>
      </div>

      <style jsx>{`
        .input-estilo {
          width: 100%;
          padding: 0.8rem;
          border-radius: 0.75rem;
          border: 1px solid #000000;
          color: #000000;
        }
        .input-estilo::placeholder { color: #000000; opacity: 0.5; }
      `}</style>
    </div>
  );
}