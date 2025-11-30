/// <reference types="vite-plugin-svgr/client" />

import PingPanel from '@/components/PingPanel.tsx'
import Logo from '@/assets/tip-tap-logo.svg?react'
import LinkButton from '@/components/LinkButton.tsx'
import DarkModeToggle from "@/components/DarkModeToggle.tsx";
import '@/index.css';
import styles from './Home.module.css';
import global from '@/global.module.css';

export default function App() {
  return (
    <div className={global.app_container}>
      <div className={global.header}>
        <DarkModeToggle />
      </div>
      <div className={styles.app_panel}>
        <Logo className={`${styles.logo} mb-3`} />
        <div>
          <LinkButton to="/login" className="mx-4"> Zaloguj się </LinkButton>
          <LinkButton to="/login" className="mx-4 mt-2"> Zarejestruj się </LinkButton>
        </div>
      </div>
      <div className={styles.footer}>
        <PingPanel />
      </div>
    </div >
  )
}

