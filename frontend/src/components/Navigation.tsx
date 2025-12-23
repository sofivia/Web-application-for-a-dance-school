import { Link, NavLink, type NavLinkRenderProps } from "react-router-dom";
import DarkModeToggle from "@/components/DarkModeToggle";
import styles from "./Navigation.module.css";
import UserButton from "./UserButton";
import Logo from "@/assets/tip-tap-logo.svg?react";
import { useAuth } from "@/utils/auth/useAuth";
import type { Role } from "@/api";

type NamedLink = [string, string];

const links: Record<Role, NamedLink[]> = {
   student: [
      ["Dziennik obecności", "/attendance"],
      ["Płatności", "/payments"],
      ["Zapisy na zajęcia", "/group-reg"]],
   instructor: [
      ["Grupy zajęciowe", "/classes"]
   ],
   admin: [
      ["Płatności", "/studPayments"]
   ]
};

export default function Navigation() {
   const { isLoggedIn, roles } = useAuth();
   const styl = ({ isActive }: NavLinkRenderProps) => (isActive ? styles.active : styles.link);
   return (
      <div className={`${styles.navbar}`}>
         <Link to="/" className="mr-2">
            <Logo className={`${styles.logo}`} aria-label="Logo TipTap" />
         </Link>

         {isLoggedIn &&
            <nav className={styles.nav}>
               {roles.length == 0 ? <></> : links[roles[0]].map((link, i) => <NavLink key={i} to={link[1]} className={styl}>
                  {link[0]}
               </NavLink>)}
            </nav>
         }

         <div className={styles.right}>
            <DarkModeToggle />

            {isLoggedIn &&
               <NavLink to="me/" className={({ isActive }) => (isActive ? styles.active : styles.link)}>
                  <UserButton />
               </NavLink>}
         </div>
      </div>
   );
}
