import { createContext } from "react";
import type { Role } from "@/api.ts";

interface AuthContextType {
   isLoggedIn: boolean;
   loading: boolean;
   role: Role | undefined;
   refreshAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
