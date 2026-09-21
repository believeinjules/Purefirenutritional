import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
  applyActionCode,
  User,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { getEmailVerificationActionCodeSettings } from "@/lib/emailVerification";

export type SignUpResult = {
  error: any;
  /** True only when Firebase accepted sendEmailVerification. */
  verificationEmailSent?: boolean;
  /** Set when account was created but verification email failed to send. */
  verificationEmailError?: any;
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    birthday?: string
  ) => Promise<SignUpResult>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  /** Resend verification for the currently signed-in unverified user. */
  resendVerificationEmail: () => Promise<{ error: any; sent: boolean }>;
  /** Apply oobCode from the email link, then refresh the local user. */
  completeEmailVerification: (oobCode: string) => Promise<{ error: any }>;
  /** Reload Firebase user so emailVerified reflects server state. */
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function sendVerificationToUser(target: User) {
  const actionCodeSettings = getEmailVerificationActionCodeSettings();
  await sendEmailVerification(target, actionCodeSettings);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const refreshUser = useCallback(async (): Promise<User | null> => {
    if (!auth?.currentUser) {
      setUser(null);
      return null;
    }
    await auth.currentUser.reload();
    const refreshed = auth.currentUser;
    setUser(refreshed);
    return refreshed;
  }, []);

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      fullName: string,
      birthday?: string
    ): Promise<SignUpResult> => {
      try {
        const { user: newUser } = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        await updateProfile(newUser, { displayName: fullName });

        await setDoc(doc(db, "profiles", newUser.uid), {
          uid: newUser.uid,
          fullName,
          email,
          birthday: birthday || null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        // Account exists even if verification email fails — surface that separately.
        try {
          await sendVerificationToUser(newUser);
          return { error: null, verificationEmailSent: true };
        } catch (verifyErr: any) {
          return {
            error: null,
            verificationEmailSent: false,
            verificationEmailError: verifyErr,
          };
        }
      } catch (err: any) {
        return { error: err };
      }
    },
    []
  );

  const signIn = useCallback(
    async (email: string, password: string): Promise<{ error: any }> => {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        return { error: null };
      } catch (err: any) {
        return { error: err };
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
  }, []);

  const resendVerificationEmail = useCallback(async (): Promise<{
    error: any;
    sent: boolean;
  }> => {
    try {
      const current = auth?.currentUser;
      if (!current) {
        return {
          error: new Error("You must be signed in to resend verification."),
          sent: false,
        };
      }
      if (current.emailVerified) {
        return { error: null, sent: false };
      }
      await sendVerificationToUser(current);
      return { error: null, sent: true };
    } catch (err: any) {
      return { error: err, sent: false };
    }
  }, []);

  const completeEmailVerification = useCallback(
    async (oobCode: string): Promise<{ error: any }> => {
      try {
        await applyActionCode(auth, oobCode);
        await refreshUser();
        return { error: null };
      } catch (err: any) {
        return { error: err };
      }
    },
    [refreshUser]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
        signOut,
        resendVerificationEmail,
        completeEmailVerification,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
