import { useState, useEffect } from "react";
import Button from "@/components/Button.tsx";
import LinkButton from "@/components/LinkButton.tsx";
import "@/index.css";
import styles from "./Account.module.css";
import global from "@/global.module.css";
import { getInstructor, getMe, getStudent, logout } from "@/api.ts";
import { useAuth } from "@/utils/auth/useAuth";

type Attribute = [string, string];

async function fetchUser(): Promise<Attribute[]> {
   const user = await getMe()
      .then((user) => user)
      .catch((_error) => undefined);
   return user === undefined ? [] : [
      ["Email", user.email]
   ];
}

async function fetchStudent(): Promise<Attribute[]> {
   const userAttrs = await fetchUser();
   const student = await getStudent()
      .then((user) => user)
      .catch((_error) => undefined);
   return student === undefined ? userAttrs : [
      ...userAttrs,
      ["Imię", student.first_name],
      ["Nazwisko", student.last_name],
      ["Data urodzenia", student.date_of_birth],
      ["Numer telefonu", student.phone ?? ""]
   ];
}

async function fetchInstructor(): Promise<Attribute[]> {
   const userAttrs = await fetchUser();
   const instructor = await getInstructor()
      .then((user) => user)
      .catch((_error) => undefined);
   return instructor === undefined ? userAttrs : [
      ...userAttrs,
      ["Imię", instructor.first_name],
      ["Nazwisko", instructor.last_name],
      ["Bio", instructor.short_bio],
      ["Numer telefonu", instructor.phone]
   ];
}


export default function Account() {
   const [attrs, setAttrs] = useState<Attribute[]>([]);
   const { roles } = useAuth();

   useEffect(() => {
      async function fetchUser() {
         if (roles.includes("student"))
            setAttrs(await fetchStudent());
         else if (roles.includes("instructor"))
            setAttrs(await fetchInstructor());
      }
      fetchUser();
   }, [roles]);

   const handleLogout = () => {
      logout();
      window.location.href = "/";
   };

   return (
      <div className={global.app_container}>
         <div className={global.header}></div>
         <div className={styles.accountPane}>
            <table className="mb-5">
               <tbody>
                  {attrs.map((a, i) =>
                     <tr key={i}>
                        <td> {a[0]}: </td>
                        <td> {a[1]} </td>
                     </tr>
                  )}
               </tbody>
            </table>
            {attrs.length == 1 && (
               <div className="mb-3">
                  <div className="mb-1"> Aby móc korzystać ze strony musisz dokończyć rejestrację. </div>
                  <LinkButton to="/me/finish-registration" className="block">
                     Dokończ rejestrację
                  </LinkButton>
               </div>
            )}
            <Button onClick={handleLogout} className="block">
               Wyloguj się
            </Button>
         </div>
         <div className={styles.footer} />
      </div>
   );
}
