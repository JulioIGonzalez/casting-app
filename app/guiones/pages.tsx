"use client";
import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function ListaGuiones() {
  const [guiones, setGuiones] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const obtenerGuiones = async () => {
      try {
        const q = query(
          collection(db, "publicaciones"), 
          where("tipo", "==", "guion"),
          orderBy("fecha", "desc")
        );
        const snap = await getDocs(q);
        setGuiones(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error(e); }
      setCargando(false);
    };
    obtenerGuiones();
  }, []);

  if (cargando) return <div className="h-screen bg-black flex items-center justify-center text-white font-black text-xs uppercase italic">Abriendo Biblioteca...</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6">
      <nav className="max-w-5xl mx-auto mb-12 flex justify-between items-center">
        <button onClick={() => router.back()} className="text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-white transition-colors">← Volver</button>
        <h1 className="text-xl font-black italic uppercase tracking-tighter">Biblioteca de Guiones</h1>
        <div className="w-10"></div>
      </nav>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {guiones.map((guion) => (
          <div key={guion.id} className="bg-[#0f0f0f] border border-white/5 p-8 rounded-[2rem] hover:border-purple-500/30 transition-all">
            <div className="flex justify-between items-start mb-6">
              <span className="bg-purple-500/10 text-purple-400 text-[8px] font-black px-3 py-1 rounded-full border border-purple-500/20 uppercase tracking-widest">Script Original</span>
              <span className="text-[8px] text-white/20 font-bold uppercase">{new Date(guion.fecha?.seconds * 1000).toLocaleDateString()}</span>
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-4">{guion.titulo}</h2>
            <div className="h-px w-12 bg-purple-500 mb-6"></div>
            <p className="text-sm text-slate-400 leading-relaxed italic mb-8">"{guion.contenido}"</p>
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
              <span className="text-white/40">Autor: <span className="text-white">{guion.autor}</span></span>
              <button className="text-purple-400 hover:text-white transition-colors">Solicitar Libreto →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}