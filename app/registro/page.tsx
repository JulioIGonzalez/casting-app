"use client";
import { useState } from 'react';
import { auth, db } from '../lib/firebase'; 
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function RegistroTalento() {
  const router = useRouter();
  
  // Estados básicos
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [rol, setRol] = useState('Actor/Actriz');
  const [especialidad, setEspecialidad] = useState('Cine');
  
  // CONTACTO Y REDES
  const [telefono, setTelefono] = useState('');
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [youtube, setYoutube] = useState('');

  const [experiencia, setExperiencia] = useState('');
  const [habilidades, setHabilidades] = useState('');
  const [categorias, setCategorias] = useState<string[]>([]);
  const [cargando, setCargando] = useState(false);

  const opcionesCategorias = ["Largometrajes", "Cortometrajes", "Comerciales", "Series TV", "Documentales", "Teatro"];

  const manejarCheckbox = (cat: string) => {
    setCategorias(prev => 
      prev.includes(cat) ? prev.filter(i => i !== cat) : [...prev, cat]
    );
  };

  const manejarRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Guardamos todos los datos en Firestore
      await setDoc(doc(db, "usuarios", user.uid), {
        uid: user.uid,
        nombre,
        email,
        rol,
        especialidad,
        telefono, // Este campo es el que usará el botón de WhatsApp
        redes: {
          facebook,
          instagram,
          youtube
        },
        experiencia,
        habilidadesArtisticas: habilidades,
        categoriasInteres: categorias,
        tipo: 'usuario_talento',
        fechaRegistro: new Date().toISOString()
      });

      alert(`¡Bienvenido/a, ${nombre}! Perfil creado exitosamente.`);
      router.push('/dashboard'); 

    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        
        <div className="bg-indigo-700 p-8 text-white text-center">
          <h1 className="text-3xl font-bold">Registro de Talento</h1>
          <p className="opacity-90">Completa tu perfil profesional para ser contactado</p>
        </div>

        <form onSubmit={manejarRegistro} className="p-8 space-y-8">
          
          {/* SECCIÓN 1: DATOS PERSONALES */}
          <section className="space-y-4">
            <h2 className="text-indigo-700 font-black uppercase text-sm tracking-widest border-b pb-2">Información Básica</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label className="text-black font-bold mb-1">Nombre Completo</label>
                <input type="text" required className="input-estilo" onChange={(e) => setNombre(e.target.value)} />
              </div>
              <div className="flex flex-col">
                <label className="text-black font-bold mb-1">Correo Electrónico</label>
                <input type="email" required className="input-estilo" onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="flex flex-col">
                <label className="text-black font-bold mb-1">Teléfono (Con código de país)</label>
                <input type="tel" placeholder="Ej: 5491112345678" className="input-estilo" onChange={(e) => setTelefono(e.target.value)} />
              </div>
              <div className="flex flex-col">
                <label className="text-black font-bold mb-1">Contraseña</label>
                <input type="password" required className="input-estilo" onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>
          </section>

          {/* SECCIÓN 2: ROL Y REDES SOCIALES */}
          <section className="space-y-4">
            <h2 className="text-indigo-700 font-black uppercase text-sm tracking-widest border-b pb-2">Perfil y Redes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label className="text-black font-bold mb-1">¿Cuál es tu Rol?</label>
                <select className="input-estilo font-bold" value={rol} onChange={(e) => setRol(e.target.value)}>
                  <option>Actor/Actriz</option>
                  <option>Guionista</option>
                  <option>Camarógrafo</option>
                  <option>Director</option>
                  <option>Editor</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-black font-bold mb-1 text-pink-600">Instagram (URL)</label>
                <input type="text" placeholder="instagram.com/tu_usuario" className="input-estilo" onChange={(e) => setInstagram(e.target.value)} />
              </div>
              <div className="flex flex-col">
                <label className="text-black font-bold mb-1 text-blue-700">Facebook (URL)</label>
                <input type="text" placeholder="facebook.com/tu_perfil" className="input-estilo" onChange={(e) => setFacebook(e.target.value)} />
              </div>
              <div className="flex flex-col">
                <label className="text-black font-bold mb-1 text-red-600">YouTube / Reel (URL)</label>
                <input type="text" placeholder="youtube.com/@tu_canal" className="input-estilo" onChange={(e) => setYoutube(e.target.value)} />
              </div>
            </div>
          </section>

          {/* SECCIÓN 3: EXPERIENCIA */}
          <section className="space-y-4">
            <h2 className="text-indigo-700 font-black uppercase text-sm tracking-widest border-b pb-2">Trayectoria</h2>
            <div className="flex flex-col">
              <label className="text-black font-bold mb-1">Resumen de Experiencia</label>
              <textarea placeholder="Trabajos anteriores, formación..." className="input-estilo h-24" onChange={(e) => setExperiencia(e.target.value)} />
            </div>
            <div className="flex flex-col">
              <label className="text-black font-bold mb-1">Habilidades / Equipamiento</label>
              <input type="text" placeholder="Ej: Inglés fluido, cámara 4K, movilidad propia..." className="input-estilo" onChange={(e) => setHabilidades(e.target.value)} />
            </div>
          </section>

          <button 
            type="submit" 
            disabled={cargando}
            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition shadow-lg disabled:bg-slate-400 text-lg"
          >
            {cargando ? "Registrando..." : "CREAR MI PERFIL PROFESIONAL"}
          </button>
        </form>
      </div>

      <style jsx>{`
        .input-estilo {
          width: 100%;
          padding: 0.8rem;
          border-radius: 0.75rem;
          border: 2px solid #e2e8f0;
          background-color: #ffffff;
          color: #000000;
          font-size: 1rem;
          transition: border-color 0.2s;
        }
        .input-estilo:focus {
          border-color: #4f46e5;
          outline: none;
        }
      `}</style>
    </div>
  );
}