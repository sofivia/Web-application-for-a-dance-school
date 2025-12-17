import { Link, NavLink } from "react-router-dom";
import DarkModeToggle from "@/components/DarkModeToggle";
import styles from "./Navigation.module.css";
import UserButton from "./UserButton";
import Logo from "@/assets/tip-tap-logo.svg?react";
import { useAuth } from "@/utils/auth/useAuth";

export default function Navigation() {
   const { isLoggedIn } = useAuth();
   return (
      <div className={`${styles.navbar}`}>
         <Link to="/" className="mr-2">
            <Logo className={`${styles.logo}`} aria-label="Logo TipTap" />
         </Link>

         {isLoggedIn && (
            <nav className={styles.nav}>
               <NavLink to="/attendance" className={({ isActive }) => (isActive ? styles.active : styles.link)}>
                  Dziennik obecności
               </NavLink>

               <NavLink to="/payments" className={({ isActive }) => (isActive ? styles.active : styles.link)}>
                  Płatności
               </NavLink>

               <NavLink to="/classReg" className={({ isActive }) => (isActive ? styles.active : styles.link)}>
                  Zapis&nbsp;na zajęcia
               </NavLink>
            </nav>
         )}

         <div className={styles.right}>
            <DarkModeToggle />

            {isLoggedIn && <NavLink to="me/" className={({ isActive }) => (isActive ? styles.active : styles.link)}>
               <div>
                  <UserButton />
               </div>
            </NavLink>}
         </div>
      </div>
   );
}
