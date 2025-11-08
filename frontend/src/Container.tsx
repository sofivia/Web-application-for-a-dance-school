import './index.css';
import { useState } from 'react';
import { Outlet } from "react-router";
import { ThemeContext } from "./utils/theme.tsx";
import type { Theme } from "./utils/theme.tsx";


export default function Container() {
    let initialIsDark = true;
    const savedTheme = window.localStorage.getItem("theme")
    if (savedTheme == null) {
        initialIsDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    } else
        initialIsDark = savedTheme === "dark";
    const [theme, setTheme] = useState<Theme>(initialIsDark ? 'dark' : 'light');
    const saveTheme = (theme: Theme) => {
        window.localStorage.setItem("theme", theme);
        setTheme(theme);
    }

    return (
        <ThemeContext value={{ theme: theme, setTheme: saveTheme }}>
            <div className={`root_container ${theme}`}>
                <Outlet />
            </div >
        </ThemeContext>
    )
}
