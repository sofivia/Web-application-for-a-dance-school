import { getMe, type Role } from "@/api";
import { type ReactNode, useState, useEffect } from "react";
import { AuthContext } from "./authContext";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
   const [isLoggedIn, setIsLoggedIn] = useState(false);
   const [loading, setLoading] = useState(true);
   const [roles, setRole] = useState<Role[]>([]);
   const [userId, setUserId] = useState<string>("");

   const checkAuth = async () => {
      setLoading(true);
      try {
         await getMe().then(user => { setRole(user.roles); setUserId(user.id) });
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
      <AuthContext.Provider value={
         { isLoggedIn, loading, roles, refreshAuth: checkAuth, userId: userId }}
      >{children}</AuthContext.Provider>
   );
};
