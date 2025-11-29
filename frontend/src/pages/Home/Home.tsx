/// <reference types="vite-plugin-svgr/client" />

import PingPanel from '@/components/PingPanel.tsx'
import Logo from '@/assets/tip-tap-logo.svg?react'
import { useContext, useId } from 'react';
import LinkButton from '@/components/LinkButton.tsx'
import Toggle from "@/components/Toggle.tsx";
import '@/index.css';
import styles from './Home.module.css';
import { ThemeContext } from '@/utils/theme.tsx';

export default function App() {
  const { theme, setTheme } = useContext(ThemeContext);
  const setActive = () => { setTheme(theme == 'dark' ? 'light' : 'dark') }
  const toggleId = useId();

  return (
    <div className={styles.app_container}>
      <div className={styles.header}>
        <label htmlFor={toggleId} className='pr-2'> Tryb ciemny </label>
        <Toggle callback={setActive} isOn={theme == 'dark'} id={toggleId} />
      </div>
      <div className={styles.app_panel}>
        <Logo className={`${styles.logo} mb-3`} />
        <div>
          <LinkButton to="/login" className="mx-4"> Zaloguj się </LinkButton>
          <LinkButton to="/login" className="mx-4"> Zarejestruj się </LinkButton>
        </div>
      </div>
      <div className={styles.footer}>
        <PingPanel />
      </div>
    </div >
  )
}

