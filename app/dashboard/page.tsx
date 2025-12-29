"use client";
import { useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  doc, getDoc, collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp 
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [usuario, setUsuario] = useState<any>(null);
  const [publicaciones, setPublicaciones] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  
  // Estados para creación y visualización
  const [mostrarCrear, setMostrarCrear] = useState<'anuncio' | 'guion' | null>(null);
  const [postSeleccionado, setPostSeleccionado] = useState<any>(null);
  const [nuevoPost, setNuevoPost] = useState({ titulo: '', contenido: '' });
  const [enviando, setEnviando] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "usuarios", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setUsuario(docSnap.data());
        cargarFeed();
      } else {
        router.push('/login');
      }
      setCargando(false);
    });
    return () => unsubscribe();
  }, [router]);

  const cargarFeed = async () => {
    try {
      const q = query(collection(db, "publicaciones"), orderBy("fecha", "desc"), limit(20));
      const snap = await getDocs(q);
      setPublicaciones(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
  };

  const manejarPublicacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !nuevoPost.titulo || !nuevoPost.contenido) return;
    setEnviando(true);
    try {
      await addDoc(collection(db, "publicaciones"), {
        titulo: nuevoPost.titulo,
        contenido: nuevoPost.contenido,
        tipo: mostrarCrear,
        autor: usuario?.nombre || "Usuario",
        autorId: auth.currentUser.uid,
        fecha: serverTimestamp(),
      });
      setNuevoPost({ titulo: '', contenido: '' });
      setMostrarCrear(null);
      cargarFeed();
    } catch (error) { alert("Error al publicar"); }
    setEnviando(false);
  };

  if (cargando) return <div className="h-screen bg-black flex items-center justify-center text-white font-black italic animate-pulse tracking-tighter text-[10px] uppercase">Cargando Studio...</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500">
      
      {/* BARRA DE NAVEGACIÓN COMPACTA */}
      <nav className="bg-black/40 backdrop-blur-xl border-b border-white/5 sticky top-0 z-[100] px-4 py-2">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <button onClick={() => router.push('/')} className="text-sm font-black italic tracking-tighter text-white hover:text-indigo-500 transition-colors uppercase">Presencia Actoral</button>
            <div className="hidden md:flex gap-4 text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
              <button onClick={() => router.push('/talento')} className="hover:text-white transition-colors">Actores</button>
              <button onClick={() => router.push('/guiones')} className="hover:text-white transition-colors">Guiones</button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/perfil/editar')} 
              className="relative group w-8 h-8 rounded-lg overflow-hidden border border-white/10 hover:border-indigo-500 transition-all"
            >
              {usuario?.fotoPerfil ? (
                <img src={usuario.fotoPerfil} alt="Perfil" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold">{usuario?.nombre?.charAt(0)}</div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-[6px] font-black">EDIT</span>
              </div>
            </button>
            <button onClick={() => signOut(auth)} className="text-[9px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors">Salir</button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-8 px-4">
        
        <header className="mb-8">
          <h2 className="text-xl font-black italic tracking-tighter uppercase leading-none">Hola, {usuario?.nombre}</h2>
        </header>

        <div className="grid grid-cols-2 gap-3 mb-12">
          <button onClick={() => setMostrarCrear('anuncio')} className="p-6 bg-[#0f0f0f] border border-white/5 rounded-2xl hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all text-left">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Publicar</span>
            <h3 className="text-sm font-bold uppercase mt-1">Anuncio de Actor</h3>
          </button>
          <button onClick={() => setMostrarCrear('guion')} className="p-6 bg-[#0f0f0f] border border-white/5 rounded-2xl hover:border-purple-500/50 hover:bg-purple-500/5 transition-all text-left">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-500">Publicar</span>
            <h3 className="text-sm font-bold uppercase mt-1">Nuevo Guion</h3>
          </button>
        </div>

        {/* FEED INTERACTIVO */}
        <div className="space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-6">Actividad Reciente</h2>
          
          <div className="grid grid-cols-1 gap-3">
            {publicaciones.map((post) => (
              <div 
                key={post.id} 
                onClick={() => setPostSeleccionado(post)}
                className="bg-[#0f0f0f] border border-white/5 p-5 rounded-2xl hover:border-white/20 transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${post.tipo === 'anuncio' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'}`}>
                    {post.tipo}
                  </span>
                  <span className="text-[7px] font-black text-indigo-500 opacity-0 group-hover:opacity-100 uppercase transition-opacity">Expandir +</span>
                </div>
                <h4 className="text-sm font-black uppercase tracking-tight text-white/90 mb-1">{post.titulo}</h4>
                <p className="text-xs text-white/50 leading-relaxed italic mb-4 line-clamp-2">"{post.contenido}"</p>
                <div className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Studio: {post.autor}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL DE PUBLICACIÓN EXPANDIDA */}
      {postSeleccionado && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] w-full max-w-xl rounded-[2.5rem] border border-white/10 p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => setPostSeleccionado(null)} className="absolute top-6 right-6 text-white/20 hover:text-white font-black text-[9px] uppercase tracking-widest">Cerrar</button>
            <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest inline-block mb-4 ${postSeleccionado.tipo === 'anuncio' ? 'bg-indigo-600' : 'bg-purple-600'}`}>
              {postSeleccionado.tipo}
            </span>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-6">{postSeleccionado.titulo}</h3>
            <div className="bg-white/5 rounded-2xl p-6 mb-8 max-h-60 overflow-y-auto">
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap italic">"{postSeleccionado.contenido}"</p>
            </div>
            <div className="flex items-center justify-between pt-6 border-t border-white/5">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Autor: <span className="text-white">{postSeleccionado.autor}</span></p>
              <button className="bg-white text-black px-5 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all">Contactar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CREACIÓN */}
      {mostrarCrear && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] w-full max-w-sm rounded-3xl p-8 border border-white/10 relative">
            <button onClick={() => setMostrarCrear(null)} className="absolute top-6 right-6 text-white/20 hover:text-white font-black text-[9px] uppercase tracking-widest transition-colors">Cerrar</button>
            <h3 className="text-lg font-black mb-6 italic uppercase tracking-tighter text-indigo-500">{mostrarCrear}</h3>
            <form onSubmit={manejarPublicacion} className="space-y-4">
              <input required className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-indigo-500 text-xs text-white font-bold" placeholder="Título del proyecto" value={nuevoPost.titulo} onChange={(e) => setNuevoPost({...nuevoPost, titulo: e.target.value})} />
              <textarea required className="w-full bg-white/5 border border-white/10 p-3 rounded-xl h-32 outline-none focus:border-indigo-500 text-xs text-white resize-none" placeholder="Descripción breve..." value={nuevoPost.contenido} onChange={(e) => setNuevoPost({...nuevoPost, contenido: e.target.value})} />
              <button disabled={enviando} type="submit" className="w-full py-3 rounded-xl font-black bg-white text-black hover:bg-indigo-500 hover:text-white transition-all text-[10px] uppercase tracking-widest">
                {enviando ? "Lanzando..." : "Publicar"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}