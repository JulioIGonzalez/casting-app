"use client";
import { useState } from 'react';
import { auth, db } from '../lib/firebase'; 
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'; // Agregamos Google
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function RegistroTalento() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [rol, setRol] = useState('Actor/Actriz');
  const [cargando, setCargando] = useState(false);

  // --- LÓGICA DE GOOGLE ---
  const manejarGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Verificamos si el usuario ya existe para no sobreescribir sus datos
      const docRef = doc(db, "usuarios", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await setDoc(docRef, {
          uid: user.uid,
          nombre: user.displayName,
          email: user.email,
          rol: "Actor/Actriz", // Rol por defecto
          fotoPerfil: user.photoURL,
          tipo: 'usuario_talento',
          fechaRegistro: new Date().toISOString()
        });
      }
      router.push('/dashboard');
    } catch (error) {
      console.error("Error con Google", error);
    }
  };

  const manejarRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "usuarios", userCredential.user.uid), {
        uid: userCredential.user.uid,
        nombre, email, rol,
        tipo: 'usuario_talento',
        fechaRegistro: new Date().toISOString()
      });
      router.push('/dashboard'); 
    } catch (error: any) { alert(error.message); }
    setCargando(false);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col items-center md:items-start justify-center p-4 md:pl-20">
      <video autoPlay loop muted playsInline className="absolute z-0 w-auto min-w-full min-h-full max-w-none object-cover opacity-50">
        <source src="/1.mp4" type="video/mp4" />
      </video>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center md:items-start">
        <button onClick={() => router.push('/')} className="mb-4 text-indigo-400 font-black uppercase text-[9px] tracking-[0.2em] bg-black/60 p-2 rounded-lg backdrop-blur-sm">← Volver</button>
        
        <div className="w-full bg-[#111]/90 rounded-[2rem] shadow-2xl overflow-hidden border border-white/10 backdrop-blur-xl p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-black uppercase italic italic text-white leading-none">Nuevo <span className="text-indigo-500">Perfil</span></h1>
          </div>

          {/* BOTÓN DE GOOGLE */}
          <button 
            onClick={manejarGoogle}
            className="w-full mb-6 flex items-center justify-center gap-3 bg-white/10 border border-white/20 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all"
          >
            <img src="https://www.gstatic.com/firebase/hub/sdk/impl/auth/light-google.svg" className="w-4 h-4" alt="Google" />
            Continuar con Google
          </button>

          <div className="relative flex items-center mb-6">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink mx-4 text-[9px] font-black text-white/30 uppercase">O registra tu email</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <form onSubmit={manejarRegistro} className="space-y-4">
            <input required placeholder="Nombre Artístico" className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-bold outline-none focus:border-indigo-500 transition-all" onChange={(e) => setNombre(e.target.value)} />
            <input required type="email" placeholder="Email" className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-bold outline-none focus:border-indigo-500 transition-all" onChange={(e) => setEmail(e.target.value)} />
            <input required type="password" placeholder="Contraseña" className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-bold outline-none focus:border-indigo-500 transition-all" onChange={(e) => setPassword(e.target.value)} />
            <select className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-black outline-none" value={rol} onChange={(e) => setRol(e.target.value)}>
              <option className="bg-[#111]">Actor/Actriz</option>
              <option className="bg-[#111]">Guionista</option>
              <option className="bg-[#111]">Director</option>
            </select>
            <button disabled={cargando} type="submit" className="w-full bg-white text-black font-black py-4 rounded-xl hover:bg-indigo-500 hover:text-white uppercase text-xs tracking-widest transition-all">
              {cargando ? "..." : "Registrarme"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}