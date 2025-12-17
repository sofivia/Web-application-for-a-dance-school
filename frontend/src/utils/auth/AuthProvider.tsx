import { getMe } from "@/api";
import { type ReactNode, useState, useEffect } from "react";
import { AuthContext } from "./authContext";

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
