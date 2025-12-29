"use client";
import { useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [usuario, setUsuario] = useState<any>(null);
  const [publicaciones, setPublicaciones] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // 1. Cargar datos del usuario
        const docRef = doc(db, "usuarios", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUsuario(docSnap.data());
        }

        // 2. Cargar Feed de Noticias/Busquedas (Simulado o desde Firestore)
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
      // Intento de cargar desde Firestore (Colección 'publicaciones')
      const q = query(collection(db, "publicaciones"), orderBy("fecha", "desc"), limit(10));
      const querySnapshot = await getDocs(q);
      const posts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (posts.length > 0) {
        setPublicaciones(posts);
      } else {
        // DATOS DE PRUEBA (Por si tu base de datos está vacía aún)
        setPublicaciones([
          {
            id: '1',
            autor: 'Productora CineLatino',
            titulo: 'BÚSQUEDA: Actor 25-30 años',
            contenido: 'Buscamos protagonista para cortometraje de suspenso. Rodaje en Febrero.',
            tipo: 'casting'
          },
          {
            id: '2',
            autor: 'Noticias Casting',
            titulo: 'Nueva Ley de Cine',
            contenido: 'Se aprueban nuevos incentivos para producciones locales. ¡Más trabajo para actores!',
            tipo: 'noticia'
          },
          {
            id: '3',
            autor: 'Agencia Talentos X',
            titulo: 'Casting Comerciales - Bebidas',
            contenido: 'Buscamos caras nuevas para campaña nacional de verano. Enviar portfolio.',
            tipo: 'casting'
          }
        ]);
      }
    } catch (e) {
      console.log("Cargando feed de prueba...");
    }
  };

  const manejarCerrarSesion = async () => {
    await signOut(auth);
    router.push('/login');
  };

  if (cargando) return <div className="min-h-screen flex items-center justify-center bg-slate-100 font-bold text-black">Cargando...</div>;

  return (
    <div className="min-h-screen bg-slate-100">
      {/* BARRA SUPERIOR NAV */}
      <nav className="bg-indigo-800 text-white p-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">CastingApp</h1>
          <div className="flex items-center gap-4">
            <span className="hidden md:inline font-medium">Hola, {usuario?.nombre}</span>
            <button onClick={manejarCerrarSesion} className="bg-red-500 px-3 py-1 rounded-lg text-sm font-bold">Salir</button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto py-8 px-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* COLUMNA IZQUIERDA: RESUMEN PERFIL */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl shadow p-6 border border-slate-200">
            <div className="w-20 h-20 bg-indigo-100 rounded-full mx-auto mb-4 flex items-center justify-center text-indigo-700 text-3xl font-bold border-2 border-indigo-700">
              {usuario?.nombre?.charAt(0)}
            </div>
            <h2 className="text-center font-bold text-black text-lg">{usuario?.nombre}</h2>
            <p className="text-center text-indigo-600 text-sm font-bold mb-4">{usuario?.especialidad}</p>
            <div className="border-t pt-4 text-sm text-slate-600">
              <p><strong>Email:</strong> {usuario?.email}</p>
            </div>
          </div>

          <button onClick={() => router.push('/talento')} className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition">
            Ver Galería Pública
          </button>
        </div>

        {/* COLUMNA CENTRAL: FEED DE NOTICIAS */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-4 rounded-2xl shadow border border-slate-200">
            <h3 className="text-black font-bold mb-2">Feed de Actividad</h3>
            <div className="flex gap-2">
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">Todos</span>
              <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">Castings</span>
              <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">Noticias</span>
            </div>
          </div>

          {publicaciones.map(post => (
            <div key={post.id} className="bg-white rounded-2xl shadow border border-slate-200 overflow-hidden">
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-[10px] uppercase font-black px-2 py-1 rounded ${post.tipo === 'casting' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                    {post.tipo}
                  </span>
                  <span className="text-slate-400 text-xs text-black">Hace un momento</span>
                </div>
                <h4 className="text-black font-extrabold text-xl mb-1">{post.titulo}</h4>
                <p className="text-slate-500 text-xs font-bold mb-4">Por: {post.autor}</p>
                <p className="text-slate-800 leading-relaxed mb-4">{post.contenido}</p>
                <button className="w-full border-2 border-indigo-600 text-indigo-600 py-2 rounded-xl font-bold hover:bg-indigo-600 hover:text-white transition">
                  {post.tipo === 'casting' ? 'Postularme ahora' : 'Leer noticia'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* COLUMNA DERECHA: SUGERENCIAS / CATEGORÍAS */}
        <div className="hidden lg:col-span-1 lg:block space-y-6">
          <div className="bg-white rounded-2xl shadow p-5 border border-slate-200">
            <h3 className="text-black font-bold mb-4">Tus Intereses</h3>
            <div className="flex flex-wrap gap-2">
              {usuario?.categoriasInteres?.map((cat: string) => (
                <span key={cat} className="bg-slate-100 text-black px-3 py-1 rounded-lg text-xs font-bold">
                  #{cat}
                </span>
              ))}
            </div>
          </div>
          
          <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
            <h3 className="text-indigo-900 font-bold text-sm mb-2">Tip de Casting</h3>
            <p className="text-indigo-800 text-xs">Mantén tus habilidades actualizadas para aparecer en más búsquedas.</p>
          </div>
        </div>

      </div>
    </div>
  );
}