import PingPanel from './components/PingPanel.tsx'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import { useContext, useState } from 'react';
import { Link } from "react-router";
import Toggle from "./components/Toggle.tsx";
import Button from "./components/Button.tsx";
import './index.css';
import styles from './App.module.css';
import { ThemeContext } from './utils/theme.tsx';

export default function App() {
  const [count, setCount] = useState(0)
  const { theme, setTheme } = useContext(ThemeContext);
  const setActive = () => { setTheme(theme == 'dark' ? 'light' : 'dark') }

  return (
    <div className={styles.app_container}>
      <div className={styles.app_panel}>
        <div className="mb-3">
          <a className={styles.logolink} href="https://vite.dev" target="_blank">
            <img src={viteLogo} className={styles.logo} alt="Vite logo" />
          </a>
          <a className={styles.logolink} href="/other/" target="_blank">
            <img src={reactLogo} className={`${styles.logo} ${styles.react}`} alt="React logo" />
          </a>
        </div>

        <h1 className="mb-1">Vite + React</h1>
        <div className="mb-1"> <Link to="/other/">test</Link> </div>

        <Toggle callback={setActive} isOn={theme == 'dark'} />

        <div className="mt-5">

          <Button className="mb-2" onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </Button>

          <p>
            Edit <code>src/App.tsx</code> and save to test HMR
          </p>
        </div>
      </div>
      <PingPanel />

      <p className={styles.read_the_docs}>
        Click on the Vite and React logos to learn more
      </p>
    </div >
  )
}
