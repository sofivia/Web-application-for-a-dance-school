/// <reference types="vite-plugin-svgr/client" />

import Logo from "@/assets/tip-tap-logo.svg?react";
import "@/index.css";
import styles from "./Home.module.css";
import global from "@/global.module.css";
import { useAuth } from "@/utils/auth/useAuth";
import LinkButton from "@/components/LinkButton";

export default function Home() {
   const { isLoggedIn } = useAuth();
   return (
      <div className={global.app_container}>
         <div className={styles.app_panel}>
            <Logo className={`${styles.logo} mb-3`} aria-label="Logo TipTap" />
            {!isLoggedIn && <div>
               <LinkButton to="/login" className="mx-4">
                  {" "}
                  Zaloguj się{" "}
               </LinkButton>
               <LinkButton to="/register" className="mx-4 mt-2">
                  {" "}
                  Zarejestruj się{" "}
               </LinkButton>
            </div>}
         </div>
         <div className={styles.footer}></div>
      </div >
   );
}
