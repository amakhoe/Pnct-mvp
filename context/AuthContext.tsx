'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, getDocFromServer } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '@/lib/firebase';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: 'medico' | 'enfermeiro' | 'tecnico_tb' | 'administrador';
  createdAt: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isFirebaseConnected: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string, role?: UserProfile['role']) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Test connection to Firestore on initialization
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
        setIsFirebaseConnected(true);
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.warn('Firebase connection: client appears offline.');
          setIsFirebaseConnected(false);
        } else {
          // Normal if the document doesn't exist yet, but server answered
          setIsFirebaseConnected(true);
        }
      }
    }
    testConnection();
  }, []);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            setProfile(snap.data() as UserProfile);
          } else {
            // Create user profile document if not present
            const newProfile: UserProfile = {
              id: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Profissional TB',
              role: 'tecnico_tb',
              createdAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newProfile);
            setProfile(newProfile);
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
          handleFirestoreError(err, OperationType.GET, `users/${currentUser.uid}`);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
    } catch (err: any) {
      console.error('Login error:', err);
      let message = 'Falha ao autenticar. Verifique o seu e-mail e palavra-passe.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        message = 'E-mail ou palavra-passe incorretos.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Formato de e-mail inválido.';
      } else if (err.code === 'auth/operation-not-allowed') {
        message = 'O provedor Email/Password não está ativo na consola do Firebase. Ative-o em Authentication > Sign-in method.';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'Muitas tentativas falhadas. Aguarde alguns minutos antes de tentar novamente.';
      }
      setAuthError(message);
      throw new Error(message);
    }
  };

  const register = async (
    email: string,
    pass: string,
    name: string,
    role: UserProfile['role'] = 'tecnico_tb'
  ) => {
    setAuthError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (name.trim()) {
        await updateProfile(cred.user, { displayName: name.trim() });
      }

      const newProfile: UserProfile = {
        id: cred.user.uid,
        email: email.trim(),
        displayName: name.trim() || 'Profissional de Saúde',
        role,
        createdAt: new Date().toISOString(),
      };

      try {
        await setDoc(doc(db, 'users', cred.user.uid), newProfile);
        setProfile(newProfile);
      } catch (dbErr) {
        console.error('Error creating user profile in Firestore:', dbErr);
        handleFirestoreError(dbErr, OperationType.CREATE, `users/${cred.user.uid}`);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      let message = 'Não foi possível registar o utilizador.';
      if (err.code === 'auth/email-already-in-use') {
        message = 'Este endereço de e-mail já está registado no sistema.';
      } else if (err.code === 'auth/weak-password') {
        message = 'A palavra-passe deve conter pelo menos 6 caracteres.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Endereço de e-mail inválido.';
      } else if (err.code === 'auth/operation-not-allowed') {
        message = 'O provedor Email/Password precisa de ser ativado no Firebase Console (Authentication > Sign-in method).';
      }
      setAuthError(message);
      throw new Error(message);
    }
  };

  const resetPassword = async (email: string) => {
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err: any) {
      console.error('Password reset error:', err);
      let message = 'Erro ao enviar e-mail de recuperação.';
      if (err.code === 'auth/user-not-found') {
        message = 'Nenhum utilizador encontrado com este endereço de e-mail.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Endereço de e-mail inválido.';
      }
      setAuthError(message);
      throw new Error(message);
    }
  };

  const logout = async () => {
    setAuthError(null);
    await signOut(auth);
    setProfile(null);
  };

  const clearAuthError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isFirebaseConnected,
        login,
        register,
        resetPassword,
        logout,
        authError,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
