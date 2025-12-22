/// <reference types="vite-plugin-svgr/client" />

import { useEffect, useState } from "react";
import Logo from "@/assets/tip-tap-logo.svg?react";
import "@/index.css";
import styles from "./Home.module.css";
import global from "@/global.module.css";
import { useAuth } from "@/utils/auth/useAuth";
import LinkButton from "@/components/LinkButton";
import { getMe, type AuthUser } from "@/api";
import StudentDashboard from "./StudentDashboard";

export default function Home() {
  const { isLoggedIn, loading } = useAuth();
  const [me, setMe] = useState<AuthUser | null>(null);
  const [meLoading, setMeLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      setMe(null);
      return;
    }

    setMeLoading(true);
    getMe()
      .then(setMe)
      .catch(() => setMe(null))
      .finally(() => setMeLoading(false));
  }, [isLoggedIn]);

  if (loading || meLoading) {
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

  if (!me) {
    return (
      <div className={global.app_container}>
        <div className="opacity-80">Nie udało się pobrać profilu użytkownika.</div>
      </div>
    );
  }

  if (me.roles?.includes("student")) {
    return <StudentDashboard />;
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
