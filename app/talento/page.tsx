"use client";
import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export default function GaleriaTalento() {
  const [talentos, setTalentos] = useState<any[]>([]);
  const [filtroRol, setFiltroRol] = useState('Todos');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerTalentos = async () => {
      try {
        console.log("Intentando conectar a Firestore...");
        const usuariosRef = collection(db, "usuarios");
        const querySnapshot = await getDocs(usuariosRef);
        
        const lista = querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        }));

        console.log("Usuarios encontrados:", lista);
        setTalentos(lista);
      } catch (error) {
        console.error("Error detallado de Firestore:", error);
      } finally {
        setCargando(false);
      }
    };
    obtenerTalentos();
  }, []);

  const talentosFiltrados = filtroRol === 'Todos' 
    ? talentos 
    : talentos.filter(t => t.rol === filtroRol);

  // Función para limpiar el número y crear el link de WhatsApp
  const crearLinkWhatsApp = (num: string, nombre: string) => {
    const numeroLimpio = num.replace(/\D/g, ''); // Quita todo lo que no sea número
    const mensaje = encodeURIComponent(`Hola ${nombre}, vi tu perfil en la App de Casting y me gustaría contactarte.`);
    return `https://wa.me/${numeroLimpio}?text=${mensaje}`;
  };

  if (cargando) return <div className="text-center py-20 text-black font-bold">Conectando con la base de datos...</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 text-black">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-black text-indigo-900 mb-4">Galería de Talento</h1>
          <div className="flex flex-wrap justify-center gap-2">
            {['Todos', 'Actor/Actriz', 'Guionista', 'Camarógrafo', 'Director', 'Editor'].map(rol => (
              <button
                key={rol}
                onClick={() => setFiltroRol(rol)}
                className={`px-4 py-2 rounded-full font-bold text-sm transition ${
                  filtroRol === rol ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-300 shadow-sm'
                }`}
              >
                {rol}
              </button>
            ))}
          </div>
        </header>

        {talentosFiltrados.length === 0 ? (
          <div className="bg-white p-10 rounded-3xl shadow-inner text-center border-2 border-dashed border-slate-200">
             <p className="text-slate-500 font-bold text-xl">No hay registros visibles.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {talentosFiltrados.map((talento) => (
              <div key={talento.id} className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden p-6 flex flex-col hover:shadow-2xl transition-shadow">
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-700 font-black text-2xl mb-4">
                  {talento.nombre?.charAt(0) || "?"}
                </div>
                
                <h2 className="text-xl font-black text-black leading-tight">{talento.nombre || "Sin Nombre"}</h2>
                <p className="text-indigo-600 font-bold text-xs uppercase mb-3">{talento.rol || "Sin Rol"}</p>
                
                <p className="text-slate-600 text-sm line-clamp-3 mb-6 flex-grow">
                  {talento.experiencia || "Sin biografía disponible."}
                </p>

                {/* BOTÓN DE WHATSAPP */}
                {talento.telefono ? (
                  <a 
                    href={crearLinkWhatsApp(talento.telefono, talento.nombre)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-black py-3 rounded-2xl transition-transform active:scale-95 shadow-md"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WHATSAPP
                  </a>
                ) : (
                  <div className="text-center py-2 bg-slate-100 rounded-xl text-slate-400 text-xs font-bold">
                    SIN TELÉFONO
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}