import { useState } from 'react'
import PingPanel from './components/PingPanel.tsx'
import reactLogo from './assets/react.svg'
import './App.css'
import viteLogo from './assets/vite.svg'
import { Link } from "react-router";

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>

        <h1 className="mb-1">Vite + React</h1>
        <Link to="/other/">test</Link>

        <div className="mt-5">
          <button className="mb-2" onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>

          <p>
            Edit <code>src/App.tsx</code> and save to test HMR
          </p>
        </div>
      </div>
      <PingPanel />
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}
