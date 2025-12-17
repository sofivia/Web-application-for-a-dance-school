import { createContext } from "react";

interface AuthContextType {
   isLoggedIn: boolean;
   loading: boolean;
   refreshAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
