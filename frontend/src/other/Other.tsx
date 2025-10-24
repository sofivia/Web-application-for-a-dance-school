import styles from '../App.module.css';

export default function App() {
  return (
    <div className={styles.app_container}>
      <div className={styles.app_panel}>
        <h1 className={'mb-6'}>Vite + React</h1>

        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
    </div >
  )
}
