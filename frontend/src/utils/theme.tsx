import { createContext } from 'react';

export type Theme = 'dark' | 'light';

type UserContextType = {
    theme: Theme,
    setTheme: (_theme: Theme) => void
};

export const ThemeContext = createContext<UserContextType>({ theme: 'dark', setTheme: () => { } });
