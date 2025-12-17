import { ThemeContext } from '@/utils/theme.tsx';
import Toggle from '@/components/Toggle.tsx'
import { useContext, useId } from 'react';

export default function DarkModeToggle() {
    const { theme, setTheme } = useContext(ThemeContext);
    const setActive = () => { setTheme(theme == 'dark' ? 'light' : 'dark') }
    const toggleId = useId();

    return (<div>
        <label htmlFor={toggleId} className='text-nowrap pr-2 mb-1'> Tryb ciemny </label>
        <Toggle callback={setActive} isOn={theme == 'dark'} id={toggleId} />
    </div>)
}