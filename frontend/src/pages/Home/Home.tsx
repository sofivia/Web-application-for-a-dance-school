/// <reference types="vite-plugin-svgr/client" />

import { useState, useEffect } from 'react';
import PingPanel from '@/components/PingPanel.tsx'
import Logo from '@/assets/tip-tap-logo.svg?react'
import LinkButton from '@/components/LinkButton.tsx'
import UserButton from '@/components/UserButton'
import DarkModeToggle from "@/components/DarkModeToggle.tsx";
import '@/index.css';
import styles from './Home.module.css';
import global from '@/global.module.css';
import { getMe } from '@/api';


export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  useEffect(() => {
    async function fetchEmail() {
      const isLoggedIn = await getMe()
        .then(_response => true)
        .catch(_error => false);
      setIsLoggedIn(isLoggedIn)
    }
    fetchEmail();
  }, [])

  return (
    <div className={global.app_container}>
      <div className={global.header}>
        <DarkModeToggle />
        {isLoggedIn && <UserButton />}
      </div>
      <div className={styles.app_panel}>
        <Logo className={`${styles.logo} mb-3`} aria-label="Logo TipTap" />
        <div>
          {!isLoggedIn && <LinkButton to="/login" className="mx-4"> Zaloguj się </LinkButton>}
          {!isLoggedIn && <LinkButton to="/login" className="mx-4 mt-2"> Zarejestruj się </LinkButton>}
        </div>
      </div>
      <div className={styles.footer}>
        <PingPanel />
      </div>
    </div >
  )
}

