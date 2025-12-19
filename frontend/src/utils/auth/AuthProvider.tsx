import { getMe, type Role } from "@/api";
import { type ReactNode, useState, useEffect } from "react";
import { AuthContext } from "./authContext";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
   const [isLoggedIn, setIsLoggedIn] = useState(false);
   const [loading, setLoading] = useState(true);
   const [role, setRole] = useState<Role>();

   const checkAuth = async () => {
      setLoading(true);
      try {
         await getMe().then(user => { setRole(user.roles[0]); });
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
      <AuthContext.Provider value={{ isLoggedIn, loading, role, refreshAuth: checkAuth }}>{children}</AuthContext.Provider>
   );
};
