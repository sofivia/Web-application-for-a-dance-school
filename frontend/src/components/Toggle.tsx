import styles from './Toggle.module.css';
import { useId } from 'react';

type ToggleProps = {
    callback: () => void;
    isOn: boolean;
    id?: string;
};

function Toggle({ callback, isOn, id }: ToggleProps) {
    const autoId = useId();
    return (
        <>
            <button id={id || autoId} className={styles.toggle} aria-pressed={isOn} onClick={callback}>
                <div className={`${styles.slider} ${styles.round}`}></div>
            </button>
        </>
    );
}

export default Toggle;