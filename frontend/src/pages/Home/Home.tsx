/// <reference types="vite-plugin-svgr/client" />

import Logo from "@/assets/tip-tap-logo.svg?react";
import "@/index.css";
import styles from "./Home.module.css";
import global from "@/global.module.css";
import { useAuth } from "@/utils/auth/useAuth";
import LinkButton from "@/components/LinkButton";
import StudentDashboard from "./StudentDashboard";

export default function Home() {
  const { isLoggedIn, loading, userId, roles } = useAuth();

  if (loading) {
    return (
      <div className={global.app_container}>
        <div className="opacity-80">Ładowanie…</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className={global.app_container}>
        <div className={styles.app_panel}>
          <Logo className={`${styles.logo} mb-3`} aria-label="Logo TipTap" />
          <div>
            <LinkButton to="/login" className="mx-4">
              Zaloguj się
            </LinkButton>
            <LinkButton to="/register" className="mx-4 mt-2">
              Zarejestruj się
            </LinkButton>
          </div>
        </div>
        <div className={styles.footer}></div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className={global.app_container}>
        <div className="opacity-80">Nie udało się pobrać profilu użytkownika.</div>
      </div>
    );
  }

  if (roles.includes("student")) {
    return (<div className={global.app_container}>
      <StudentDashboard />
    </div>)
  }

  return (
    <div className={global.app_container}>
      <div className={styles.app_panel}>
        <Logo className={`${styles.logo} mb-3`} aria-label="Logo TipTap" />
        <div className="opacity-80">Panel dla tej roli jest jeszcze w przygotowaniu.</div>
      </div>
      <div className={styles.footer}></div>
    </div>
  );
}
