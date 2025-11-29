import styles from './Toggle.module.css';
import { useId } from 'react';

type ToggleProps = {
    callback: () => void;
    isOn: boolean;
};

function Toggle({ callback, isOn }: ToggleProps) {
    const id = useId();
    return (
        <>
            <label htmlFor={id}>Tryb ciemny</label>
            <button id={id} className={styles.toggle} aria-pressed={isOn} onClick={callback}>
                <div className={`${styles.slider} ${styles.round}`}></div>
            </button>
        </>
    );
}

export default Toggle;