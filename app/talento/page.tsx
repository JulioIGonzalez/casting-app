"use client";
import { useEffect, useState } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';

interface Talento { id: string; nombre?: string; rol?: string; fotoPerfil?: string; altura?: string; ojos?: string; pelo?: string; telefono?: string; }

export default function GaleriaTalento() {
  const [talentos, setTalentos] = useState<Talento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtroRol, setFiltroRol] = useState('Todos');
  const [filtroOjos, setFiltroOjos] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const obtenerTalentos = async () => {
      const querySnapshot = await getDocs(collection(db, "usuarios"));
      setTalentos(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Talento[]);
      setCargando(false);
    };
    obtenerTalentos();
  }, []);

  const talentosFiltrados = talentos.filter(t => (filtroRol === 'Todos' || t.rol === filtroRol) && (t.ojos?.toLowerCase().includes(filtroOjos.toLowerCase())));

  if (cargando) return <div className="min-h-screen flex items-center justify-center font-black bg-black text-white italic text-2xl animate-pulse">CARGANDO ELENCO...</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-black">
      {/* NAVBAR UNIVERSAL */}
      <nav className="bg-black text-white p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="hover:text-indigo-400">← Volver</button>
            <button onClick={() => router.push('/')} className="font-black italic text-indigo-500">HOME</button>
          </div>
          <button onClick={() => router.push('/dashboard')} className="text-[10px] font-black uppercase tracking-widest bg-white text-black px-4 py-2 rounded-xl">Dashboard</button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-12">
          <div className="flex gap-2">
            <button onClick={() => {setFiltroRol('Todos'); setFiltroOjos('');}} className="bg-black text-white px-6 py-2 rounded-full text-xs font-black uppercase">Ver todos</button>
            <button onClick={() => setMostrarFiltros(!mostrarFiltros)} className="bg-slate-200 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest">Filtros Avanzados</button>
          </div>
          <select value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)} className="bg-white border rounded-xl p-2 text-xs font-bold uppercase">
            {['Todos', 'Actor/Actriz', 'Guionista', 'Director'].map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {mostrarFiltros && (
          <div className="bg-white p-6 rounded-2xl mb-8 border-2 border-dashed border-indigo-200">
            <label className="text-[10px] font-black text-slate-400 uppercase">Buscar por color de ojos</label>
            <input placeholder="Ej: Verdes" className="w-full p-2 border-b-2 outline-none font-bold text-lg" value={filtroOjos} onChange={(e) => setFiltroOjos(e.target.value)} />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {talentosFiltrados.map((t) => (
            <div key={t.id} className="bg-white rounded-[2rem] shadow-xl overflow-hidden group hover:scale-105 transition-transform border border-slate-100">
              <div className="h-64 bg-slate-200 relative">
                {t.fotoPerfil ? <img src={t.fotoPerfil} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-indigo-600 text-4xl font-black">{t.nombre?.charAt(0)}</div>}
                <div className="absolute bottom-0 p-6 bg-gradient-to-t from-black w-full text-white"><h3 className="font-black text-xl uppercase italic">{t.nombre}</h3><p className="text-indigo-400 text-[10px] font-black uppercase">{t.rol}</p></div>
              </div>
              <div className="p-6">
                <div className="flex justify-between text-[10px] font-black uppercase text-slate-400"><span>Altura: {t.altura || '-'}</span><span>Ojos: {t.ojos || '-'}</span></div>
                {t.telefono && <a href={`https://wa.me/${t.telefono}`} target="_blank" className="block mt-4 bg-green-500 text-white text-center py-3 rounded-2xl font-black text-xs uppercase shadow-lg">Contactar</a>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}