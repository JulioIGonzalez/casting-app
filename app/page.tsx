"use client";
import { useEffect, useState } from 'react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [usuario, setUsuario] = useState<any>(null);
  const [estaLogueado, setEstaLogueado] = useState(false);
  const [ultimosCastings, setUltimosCastings] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setEstaLogueado(true);
        const docRef = doc(db, "usuarios", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setUsuario(docSnap.data());
        
        // Cargar solo los 3 últimos castings para la vista rápida
        const q = query(collection(db, "publicaciones"), orderBy("fecha", "desc"), limit(3));
        const snap = await getDocs(q);
        setUltimosCastings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } else {
        setEstaLogueado(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // VISTA PARA USUARIO NO LOGUEADO (Tu video original)
  if (!estaLogueado) {
    return (
      <div className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-black">
        <video autoPlay loop muted playsInline className="absolute z-0 w-auto min-w-full min-h-full object-cover opacity-60">
          <source src="/1.mp4" type="video/mp4" />
        </video>
        <div className="relative z-10 text-center">
          <h1 className="text-7xl font-black text-white italic mb-6">PRESENCIA <span className="text-indigo-500">ACTORAL</span></h1>
          <div className="flex gap-4 justify-center">
            <button onClick={() => router.push('/registro')} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black">REGISTRARME</button>
            <button onClick={() => router.push('/login')} className="bg-white text-black px-8 py-4 rounded-2xl font-black">INICIAR SESIÓN</button>
          </div>
        </div>
      </div>
    );
  }

  // VISTA PARA USUARIO LOGUEADO (La nueva idea)
  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        <header className="flex justify-between items-center mb-16">
          <div>
            <h1 className="text-sm font-black text-indigo-500 uppercase tracking-[0.5em] mb-2">Studio Dashboard</h1>
            <h2 className="text-5xl font-black italic uppercase tracking-tighter">Bienvenido, {usuario?.nombre}</h2>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-2xl font-black shadow-[0_0_20px_rgba(79,70,229,0.4)]">
              {usuario?.nombre?.charAt(0)}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUMNA DE ACCESO RÁPIDO */}
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => router.push('/talento')}
                className="h-64 bg-[#111] border border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center hover:bg-indigo-600 transition-all group"
              >
                <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">👥</span>
                <span className="font-black uppercase tracking-widest italic">Explorar Talento</span>
              </button>
              
              <button 
                onClick={() => router.push('/dashboard')}
                className="h-64 bg-[#111] border border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center hover:bg-purple-600 transition-all group"
              >
                <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">🎬</span>
                <span className="font-black uppercase tracking-widest italic">Mi Studio</span>
              </button>
            </div>

            {/* FRASE INSPIRADORA DINÁMICA */}
            <div className="p-10 bg-gradient-to-r from-indigo-900/20 to-transparent border-l-4 border-indigo-500 rounded-r-3xl">
              <p className="text-2xl font-light italic text-slate-300">
                "El cine no es un trozo de vida, sino un trozo de pastel."
              </p>
              <footer className="mt-2 text-indigo-400 font-bold">— Alfred Hitchcock</footer>
            </div>
          </div>

          {/* COLUMNA DE ÚLTIMOS MOVIMIENTOS */}
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Últimos Castings</h3>
            {ultimosCastings.map(post => (
              <div key={post.id} className="p-6 bg-white/5 border border-white/5 rounded-3xl hover:border-indigo-500/50 transition-colors">
                <h4 className="font-black text-sm uppercase mb-1 truncate">{post.titulo}</h4>
                <p className="text-[10px] text-slate-500 mb-4 line-clamp-2">{post.contenido}</p>
                <button 
                  onClick={() => router.push('/dashboard')}
                  className="text-[9px] font-black text-indigo-400 hover:text-white uppercase tracking-tighter"
                >
                  Ver más →
                </button>
              </div>
            ))}
          </div>

        </div>

        <footer className="mt-20 pt-8 border-t border-white/5 flex justify-between items-center text-slate-600">
          <p className="text-[10px] font-black uppercase tracking-[0.3em]">Presencia Actoral © 2025</p>
          <button onClick={() => auth.signOut()} className="text-[10px] font-black hover:text-red-500 transition-colors uppercase">Cerrar Sesión</button>
        </footer>

      </div>
    </div>
  );
}