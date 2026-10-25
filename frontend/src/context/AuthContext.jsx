import { createContext, useContext, useEffect, useState } from 'react';
import authApi from '../api/authApi';
import patientApi from '../api/patientApi';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile
} from '../config/firebase';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('medibook_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('medibook_access_token'));
  const [loading, setLoading] = useState(true);
  const [pendingGoogleUser, setPendingGoogleUser] = useState(() => {
    const saved = sessionStorage.getItem('medibook_pending_google');
    return saved ? JSON.parse(saved) : null;
  });

  // Sync session on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('medibook_access_token');
      if (storedToken) {
        try {
          const res = await authApi.getMe();
          const meData = res?.data || res;
          if (meData && meData.email) {
            setUser(meData);
            localStorage.setItem('medibook_user', JSON.stringify(meData));
          }
        } catch {
          // If token expired, try silent refresh
          try {
            const refreshRes = await authApi.refreshToken();
            const refreshPayload = refreshRes?.data || refreshRes;
            if (refreshPayload?.accessToken) {
              localStorage.setItem('medibook_access_token', refreshPayload.accessToken);
              setToken(refreshPayload.accessToken);
              const meRes = await authApi.getMe();
              const meData = meRes?.data || meRes;
              setUser(meData);
              localStorage.setItem('medibook_user', JSON.stringify(meData));
            }
          } catch {
            localStorage.removeItem('medibook_access_token');
            localStorage.removeItem('medibook_user');
            setUser(null);
            setToken(null);
          }
        }
      }
      setLoading(false);
    };

    initAuth();

    const handleAutoLogout = () => {
      setUser(null);
      setToken(null);
      toast.error('Session expired. Please log in again.');
    };

    window.addEventListener('medibook_logout', handleAutoLogout);
    return () => window.removeEventListener('medibook_logout', handleAutoLogout);
  }, []);

  /**
   * Fast, reliable Login with Firebase & Neon PostgreSQL
   */
  const login = async (email, password) => {
    // 1. Authenticate with Firebase in background
    signInWithEmailAndPassword(auth, email, password).catch((e) => {
      console.log('[Firebase Auth] Notice:', e.code);
    });

    // 2. Authenticate with Backend to get JWT token
    const backendRes = await authApi.login({ email, password });
    const payload = backendRes?.data || backendRes;
    const accessToken = payload.accessToken;
    const userData = payload.user;

    if (accessToken) {
      localStorage.setItem('medibook_access_token', accessToken);
      setToken(accessToken);
    }
    if (userData) {
      localStorage.setItem('medibook_user', JSON.stringify(userData));
      setUser(userData);
    }

    return userData;
  };

  /**
   * Google Sign In - authenticates with Google, then checks if details are needed
   */
  const loginWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    const fbUser = cred.user;

    const email = fbUser.email;
    const fullName = fbUser.displayName || email.split('@')[0];

    // Authenticate with backend /auth/firebase-login
    try {
      const loginRes = await authApi.firebaseLogin({
        email,
        fullName,
        photoUrl: fbUser.photoURL,
        firebaseUid: fbUser.uid
      });
      const payload = loginRes?.data || loginRes;
      const isNew = payload?.isNewUser === true || payload?.newUser === true;

      if (!isNew && payload?.user) {
        // User ALREADY exists in database & has completed profile -> login directly!
        if (payload.accessToken) {
          localStorage.setItem('medibook_access_token', payload.accessToken);
          setToken(payload.accessToken);
        }
        localStorage.setItem('medibook_user', JSON.stringify(payload.user));
        setUser(payload.user);

        sessionStorage.removeItem('medibook_pending_google');
        setPendingGoogleUser(null);
        return { isNewUser: false, user: payload.user };
      }
    } catch (e) {
      console.warn('Backend firebase login notice:', e.message);
    }

    // User is new OR hasn't filled profile details yet -> save pending and prompt CompleteProfilePage
    const pendingData = {
      uid: fbUser.uid,
      email,
      fullName,
      photoURL: fbUser.photoURL,
    };
    sessionStorage.setItem('medibook_pending_google', JSON.stringify(pendingData));
    setPendingGoogleUser(pendingData);
    return { isNewUser: true, user: pendingData };
  };

  /**
   * Complete Registration for Google User with Collected Details
   */
  const completeGoogleRegistration = async (details) => {
    const pending = pendingGoogleUser || JSON.parse(sessionStorage.getItem('medibook_pending_google') || '{}');
    if (!pending.email) {
      throw new Error('Google authentication session expired. Please sign in with Google again.');
    }

    // Call firebaseLogin which creates or updates the user and returns JWT tokens without 409!
    const loginRes = await authApi.firebaseLogin({
      email: pending.email,
      fullName: details.fullName || pending.fullName,
      photoUrl: pending.photoURL,
      firebaseUid: pending.uid,
      phoneNumber: details.phoneNumber || '',
      dateOfBirth: details.dateOfBirth || null,
      gender: details.gender || 'OTHER',
      bloodGroup: details.bloodGroup || 'O_POSITIVE',
      emergencyContact: details.emergencyContact || '',
      address: details.address || ''
    });

    const payload = loginRes?.data || loginRes;

    if (payload.accessToken) {
      localStorage.setItem('medibook_access_token', payload.accessToken);
      setToken(payload.accessToken);
    }

    const finalUser = payload.user || {
      email: pending.email,
      fullName: details.fullName || pending.fullName,
      role: 'ROLE_PATIENT'
    };

    localStorage.setItem('medibook_user', JSON.stringify(finalUser));
    setUser(finalUser);

    sessionStorage.removeItem('medibook_pending_google');
    setPendingGoogleUser(null);

    return finalUser;
  };

  /**
   * Real-time Firebase Signup with Real Verification Email & Instant Neon Registration
   */
  const signup = async (payload) => {
    // 1. Create in Firebase Authentication
    try {
      const cred = await createUserWithEmailAndPassword(auth, payload.email, payload.password);
      if (payload.fullName) {
        updateProfile(cred.user, { displayName: payload.fullName }).catch(() => {});
      }
      // Send REAL EMAIL Verification directly from Google servers
      sendEmailVerification(cred.user).catch((e) => {
        console.log('[Firebase Verification Email] Notice:', e.message);
      });
    } catch (fbErr) {
      if (fbErr.code !== 'auth/email-already-in-use') {
        console.warn('[Firebase Auth] Note:', fbErr.message);
      }
    }

    // 2. Save account in Neon PostgreSQL database
    const backendRes = await authApi.signup({
      fullName: payload.fullName,
      email: payload.email,
      password: payload.password,
      phoneNumber: payload.phoneNumber || ''
    });

    return backendRes;
  };

  /**
   * Real Email Password Reset
   */
  const forgotPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
    return { success: true, message: 'Password reset email sent to your real inbox!' };
  };

  /**
   * Logout
   */
  const logout = async () => {
    try {
      await signOut(auth);
      await authApi.logout();
    } catch {
      // Ignore network errors
    } finally {
      localStorage.removeItem('medibook_access_token');
      localStorage.removeItem('medibook_user');
      sessionStorage.removeItem('medibook_pending_google');
      setUser(null);
      setToken(null);
      setPendingGoogleUser(null);
      toast.success('You have been logged out.');
    }
  };

  const updateUserProfile = (updatedData) => {
    setUser((prev) => {
      const next = { ...prev, ...updatedData };
      localStorage.setItem('medibook_user', JSON.stringify(next));
      return next;
    });
  };

  const role = user?.role?.replace('ROLE_', '') || '';
  const isPatient = role === 'PATIENT';
  const isDoctor = role === 'DOCTOR';
  const isAdmin = role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        role,
        isPatient,
        isDoctor,
        isAdmin,
        pendingGoogleUser,
        login,
        loginWithGoogle,
        completeGoogleRegistration,
        signup,
        forgotPassword,
        logout,
        updateUserProfile,
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
