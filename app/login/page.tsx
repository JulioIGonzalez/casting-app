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
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center px-4">
      
      {/* BOTÓN VOLVER AL INICIO */}
      <button 
        onClick={() => router.push('/')} 
        className="mb-8 flex items-center gap-2 text-indigo-400 font-black hover:text-white uppercase text-[10px] tracking-[0.3em] transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
        </svg>
        Volver al Inicio
      </button>

      <div className="max-w-md w-full bg-[#111] rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden border border-white/10">
        
        {/* CABECERA ALTO CONTRASTE */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-10 text-white text-center">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none mb-2">
            Entrada <span className="text-black">Actoral</span>
          </h1>
          <p className="text-[10px] opacity-90 uppercase tracking-[0.4em] font-black">
            Acceso al Studio
          </p>
        </div>

        <form onSubmit={manejarLogin} className="p-10 space-y-6">
          
          {/* CAMPO EMAIL */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-indigo-500 uppercase ml-2 tracking-widest">Correo Electrónico</label>
            <input 
              type="email" 
              required 
              placeholder="tu@email.com"
              className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-indigo-500 text-white font-bold placeholder:text-white/20 transition-all"
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>

          {/* CAMPO PASSWORD */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-indigo-500 uppercase ml-2 tracking-widest">Contraseña</label>
            <input 
              type="password" 
              required 
              placeholder="••••••••"
              className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-indigo-500 text-white font-bold placeholder:text-white/20 transition-all"
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>

          {/* BOTÓN DE ACCIÓN */}
          <button 
            type="submit" 
            disabled={cargando}
            className="w-full bg-white text-black font-black py-5 rounded-2xl hover:bg-indigo-500 hover:text-white uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 disabled:bg-white/20"
          >
            {cargando ? "Cargando Studio..." : "Iniciar Sesión"}
          </button>

          {/* ENLACE AL REGISTRO */}
          <div className="pt-4 text-center">
            <p className="text-[11px] text-white/50 uppercase font-bold tracking-widest">
              ¿Aún no tienes cuenta?
            </p>
            <Link href="/registro" className="text-indigo-400 font-black uppercase text-xs hover:text-white transition-colors">
              Crea tu perfil aquí
            </Link>
          </div>
        </form>
      </div>
      
      {/* DECORACIÓN INFERIOR */}
      <p className="mt-8 text-[9px] text-white/20 uppercase font-black tracking-[0.5em]">
        Casting • Producción • Elenco
      </p>
    </div>
  );
}