import "./index.css";
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router";
import { ThemeContext } from "./utils/theme.tsx";
import type { Theme } from "./utils/theme.tsx";
import Navigation from "./components/Navigation.tsx";
import { getMe } from "./api.ts";

export default function Container() {
   let initialIsDark = true;
   const location = useLocation();

   const hideMenu = location.pathname === "/login" || location.pathname === "/register";
   const savedTheme = window.localStorage.getItem("theme");
   if (savedTheme == null) {
      initialIsDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
   } else initialIsDark = savedTheme === "dark";
   const [theme, setTheme] = useState<Theme>(initialIsDark ? "dark" : "light");
   const saveTheme = (theme: Theme) => {
      window.localStorage.setItem("theme", theme);
      setTheme(theme);
   };
   const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
   useEffect(() => {
      async function fetchEmail() {
         const isLoggedIn = await getMe()
            .then((_response) => true)
            .catch((_error) => false);
         setIsLoggedIn(isLoggedIn);
      }
      fetchEmail();
   }, []);
   return (
      <ThemeContext value={{ theme: theme, setTheme: saveTheme }}>
         <div className={`root_container ${theme}`}>
            {!hideMenu && <Navigation isAuthenticated={isLoggedIn} />}
            <Outlet />
         </div>
      </ThemeContext>
   );
}
