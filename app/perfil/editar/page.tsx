"use client";
import { useEffect, useState } from 'react';
import { auth, db, storage } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'next/navigation';

export default function EditarPerfil() {
  const [usuario, setUsuario] = useState<any>({
    nombre: '', fotoPerfil: '', peliculas: '', series: '', cortos: '', musica: '', arte: '', libros: '', categoriaFavorita: 'Cine'
  });
  const [cargando, setCargando] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docSnap = await getDoc(doc(db, "usuarios", user.uid));
        if (docSnap.exists()) setUsuario({ ...usuario, ...docSnap.data() });
      } else {
        router.push('/login');
      }
      setCargando(false);
    });
    return () => unsubscribe();
  }, [router]);

  // OPTIMIZACIÓN Y SUBIDA DE IMAGEN
  const manejarImagen = async (e: any) => {
    const archivo = e.target.files[0];
    if (!archivo || !auth.currentUser) return;

    if (archivo.size > 2 * 1024 * 1024) {
      alert("La imagen es muy pesada. Máximo 2MB.");
      return;
    }

    setSubiendo(true);
    const storageRef = ref(storage, `perfiles/${auth.currentUser.uid}`);
    const uploadTask = uploadBytesResumable(storageRef, archivo);

    uploadTask.on('state_changed', 
      (snapshot) => setProgreso((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
      (error) => { console.error(error); setSubiendo(false); },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        setUsuario({ ...usuario, fotoPerfil: url });
        setSubiendo(false);
        setProgreso(0);
      }
    );
  };

  const guardarCambios = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    try {
      await updateDoc(doc(db, "usuarios", auth.currentUser.uid), usuario);
      alert("Perfil actualizado correctamente.");
      router.push('/dashboard');
    } catch (e) { alert("Error al guardar."); }
  };

  if (cargando) return <div className="h-screen bg-black flex items-center justify-center text-white font-black text-[10px] uppercase">Cargando Datos...</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6">
      <div className="max-w-2xl mx-auto">
        
        <header className="flex justify-between items-center mb-12">
          <button onClick={() => router.back()} className="text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-white transition-colors">← Volver</button>
          <h1 className="text-xl font-black italic uppercase tracking-tighter">Configurar Perfil</h1>
        </header>

        <form onSubmit={guardarCambios} className="space-y-12">
          
          {/* SECCIÓN FOTO */}
          <div className="flex flex-col items-center gap-6">
            <div className="relative group w-32 h-32 rounded-[2rem] overflow-hidden border-2 border-dashed border-white/10 hover:border-indigo-500 transition-all">
              {usuario.fotoPerfil ? (
                <img src={usuario.fotoPerfil} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/5 text-[10px] font-black text-white/20">SIN FOTO</div>
              )}
              {subiendo && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-[10px] font-bold text-indigo-500">
                  {Math.round(progreso)}%
                </div>
              )}
              <label className="absolute inset-0 cursor-pointer bg-indigo-600/0 group-hover:bg-indigo-600/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                <span className="text-[8px] font-black uppercase">Cambiar</span>
                <input type="file" className="hidden" accept="image/*" onChange={manejarImagen} />
              </label>
            </div>
            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Retrato Profesional</p>
          </div>

          {/* CAMPOS DE TEXTO - ESTILO ESTUDIO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest border-b border-white/5 pb-2">Intereses y Cultura</h3>
              
              <div className="space-y-1">
                <label className="text-[8px] font-black text-white/40 uppercase">Películas Favoritas</label>
                <input className="w-full bg-white/5 border-b border-white/10 p-2 text-xs focus:border-indigo-500 outline-none transition-colors" value={usuario.peliculas} onChange={(e) => setUsuario({...usuario, peliculas: e.target.value})} placeholder="Ej: Pulp Fiction, Parasite..." />
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-black text-white/40 uppercase">Series que te marcaron</label>
                <input className="w-full bg-white/5 border-b border-white/10 p-2 text-xs focus:border-indigo-500 outline-none transition-colors" value={usuario.series} onChange={(e) => setUsuario({...usuario, series: e.target.value})} placeholder="Ej: Succession, Breaking Bad..." />
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-black text-white/40 uppercase">Libros y Literatura</label>
                <input className="w-full bg-white/5 border-b border-white/10 p-2 text-xs focus:border-indigo-500 outline-none transition-colors" value={usuario.libros} onChange={(e) => setUsuario({...usuario, libros: e.target.value})} placeholder="Ej: Hamlet, Rayuela..." />
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-purple-500 uppercase tracking-widest border-b border-white/5 pb-2">Arte y Escenario</h3>

              <div className="space-y-1">
                <label className="text-[8px] font-black text-white/40 uppercase">Música / Influencias</label>
                <input className="w-full bg-white/5 border-b border-white/10 p-2 text-xs focus:border-purple-500 outline-none transition-colors" value={usuario.musica} onChange={(e) => setUsuario({...usuario, musica: e.target.value})} placeholder="Ej: Jazz, Rock, Ópera..." />
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-black text-white/40 uppercase">Categoría preferida para actuar</label>
                <select className="w-full bg-white/5 border-b border-white/10 p-2 text-xs font-bold focus:border-purple-500 outline-none" value={usuario.categoriaFavorita} onChange={(e) => setUsuario({...usuario, categoriaFavorita: e.target.value})}>
                  <option className="bg-[#111]">Cine de Terror</option>
                  <option className="bg-[#111]">Drama</option>
                  <option className="bg-[#111]">Comedia</option>
                  <option className="bg-[#111]">Teatro Clásico</option>
                  <option className="bg-[#111]">Publicidad</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-black text-white/40 uppercase">Otras formas de Arte</label>
                <input className="w-full bg-white/5 border-b border-white/10 p-2 text-xs focus:border-purple-500 outline-none transition-colors" value={usuario.arte} onChange={(e) => setUsuario({...usuario, arte: e.target.value})} placeholder="Ej: Pintura, Fotografía, Danza..." />
              </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-white text-black py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-indigo-500 hover:text-white transition-all shadow-xl active:scale-95">
            Guardar mi Perfil Artístico
          </button>
        </form>
      </div>
    </div>
  );
}