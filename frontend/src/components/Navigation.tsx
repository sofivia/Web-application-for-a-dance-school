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
         <div className={styles.left}>
            <Link to="/">
               <Logo className={`${styles.logo} mb-3`} aria-label="Logo TipTap" />
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
                     Zapis na zajęcia
                  </NavLink>
               </nav>
            )}
         </div>

         <div className={styles.right}>
            <DarkModeToggle />

            {!isLoggedIn ? (
               <></>
            ) : (
               <NavLink to="me/" className={({ isActive }) => (isActive ? styles.active : styles.link)}>
                  <div>
                     <UserButton />
                  </div>
               </NavLink>
            )}
         </div>
      </div>
   );
}
