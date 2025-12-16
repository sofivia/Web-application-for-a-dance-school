import { createContext, useState, useEffect, type ReactNode } from "react";
import { getMe } from "../api";

interface AuthContextType {
   isLoggedIn: boolean;
   loading: boolean;
   refreshAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
   const [isLoggedIn, setIsLoggedIn] = useState(false);
   const [loading, setLoading] = useState(true);

   const checkAuth = async () => {
      setLoading(true);
      try {
         await getMe();
         setIsLoggedIn(true);
      } catch {
         setIsLoggedIn(false);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      checkAuth();
   }, []);

   return (
      <AuthContext.Provider value={{ isLoggedIn, loading, refreshAuth: checkAuth }}>{children}</AuthContext.Provider>
   );
};
