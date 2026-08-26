'use client';

import React, { useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface RegistroPonto {
  id: string;
  usuarioId: string;
  usuarioNome: string;
  usuarioEmail: string;
  tipo: 'entrada' | 'saida';
  localizacao: string | any;
  registro: any;
  criadoEm: any;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [isCadastro, setIsCadastro] = useState(false);
  const [pontos, setPontos] = useState<RegistroPonto[]>([]);
  const [authError, setAuthError] = useState('');

  // Sincroniza usuário e perfil
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'usuarios', currentUser.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
        } else {
          const newProf = {
            uid: currentUser.uid,
            nome: currentUser.displayName || 'Colaborador Web',
            email: currentUser.email,
            cargo: 'colaborador',
            criadoEm: serverTimestamp(),
          };
          await setDoc(doc(db, 'usuarios', currentUser.uid), newProf);
          setUserProfile(newProf);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Escuta pontos no Firestore
  useEffect(() => {
    if (!user) {
      setPontos([]);
      return;
    }

    const q = query(collection(db, 'pontos'), orderBy('registro', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as RegistroPonto[];
      setPontos(docs);
    });

    return () => unsubscribe();
  }, [user]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (isCadastro) {
        if (!nome) {
          setAuthError('Informe seu nome completo');
          return;
        }
        const res = await createUserWithEmailAndPassword(auth, email, senha);
        await setDoc(doc(db, 'usuarios', res.user.uid), {
          uid: res.user.uid,
          nome,
          email: res.user.email,
          cargo: 'colaborador',
          criadoEm: serverTimestamp(),
        });
      } else {
        await signInWithEmailAndPassword(auth, email, senha);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Erro na autenticação.');
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setAuthError(err.message || 'Erro ao entrar com Google.');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans p-6 sm:p-12">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center pb-6 mb-8 border-b border-gray-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
              Combogó Ponto ⏱️
            </h1>
            <p className="text-sm text-gray-400">Painel Web com Firebase Auth & Cloud Firestore</p>
          </div>

          {user && (
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="font-semibold text-sm">{userProfile?.nome || user.displayName || user.email}</p>
                <p className="text-xs text-orange-400 uppercase tracking-wider">{userProfile?.cargo || 'Colaborador'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm bg-red-500/10 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/20 transition"
              >
                Sair
              </button>
            </div>
          )}
        </header>

        {!user ? (
          <div className="max-w-md mx-auto bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-2xl">
            <h2 className="text-xl font-bold mb-2 text-center text-white">
              {isCadastro ? 'Criar Conta' : 'Acessar Painel'}
            </h2>
            <p className="text-sm text-gray-400 mb-6 text-center">
              Autenticação integrada com Firebase
            </p>

            {authError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                {authError}
              </div>
            )}

            <form onSubmit={handleEmailAuth} className="flex flex-col gap-4">
              {isCadastro && (
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">E-mail</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@empresa.com"
                  className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Senha</label>
                <input
                  type="password"
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 font-semibold rounded-xl text-white transition mt-2 shadow-lg shadow-orange-500/20"
              >
                {isCadastro ? 'Cadastrar' : 'Entrar'}
              </button>
            </form>

            <div className="flex items-center my-6 gap-3">
              <div className="flex-1 h-px bg-gray-800" />
              <span className="text-xs text-gray-500">OU</span>
              <div className="flex-1 h-px bg-gray-800" />
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full py-3 bg-gray-800 hover:bg-gray-750 border border-gray-700 font-medium rounded-xl flex items-center justify-center gap-3 transition"
            >
              <span>🌐</span>
              <span>Continuar com Google</span>
            </button>

            <button
              onClick={() => setIsCadastro(!isCadastro)}
              className="w-full mt-6 text-center text-xs text-orange-400 hover:underline"
            >
              {isCadastro ? 'Já possui conta? Faça login' : 'Novo por aqui? Crie uma conta'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span>📋</span>
                <span>Registros no Firestore em Tempo Real</span>
              </h2>

              {pontos.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  Nenhum registro de ponto encontrado no Cloud Firestore.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-300">
                    <thead className="bg-gray-950/50 text-gray-400 uppercase text-xs">
                      <tr>
                        <th className="px-4 py-3 rounded-l-lg">Tipo</th>
                        <th className="px-4 py-3">Colaborador</th>
                        <th className="px-4 py-3">Localização</th>
                        <th className="px-4 py-3 rounded-r-lg">Data & Hora</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                      {pontos.map((ponto) => {
                        const data = ponto.registro?.toDate ? ponto.registro.toDate() : new Date(ponto.registro);
                        return (
                          <tr key={ponto.id} className="hover:bg-gray-800/30 transition">
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                  ponto.tipo === 'entrada'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                }`}
                              >
                                {ponto.tipo === 'entrada' ? '🟢 Entrada' : '🔴 Saída'}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-medium text-white">
                              {ponto.usuarioNome || ponto.usuarioEmail}
                            </td>
                            <td className="px-4 py-3 text-gray-400">
                              {typeof ponto.localizacao === 'string' ? ponto.localizacao : 'Local registrado'}
                            </td>
                            <td className="px-4 py-3 font-mono text-xs text-gray-300">
                              {isNaN(data.getTime()) ? '-' : data.toLocaleString('pt-BR')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
