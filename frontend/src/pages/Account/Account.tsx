import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Button from "@/components/Button.tsx";
import LinkButton from "@/components/LinkButton.tsx";
import DarkModeToggle from "@/components/DarkModeToggle.tsx";
import "@/index.css";
import styles from "./Account.module.css";
import global from "@/global.module.css";
import { getMe, getStudent, logout, type AuthUser, type Student } from "@/api";

export default function Account() {
   const navigate = useNavigate();
   const [user, setUser] = useState<AuthUser | null | undefined>(null);
   const [student, setStudent] = useState<Student | null | undefined>(null);

   useEffect(() => {
      async function fetchUser() {
         const user = await getMe()
            .then((user) => user)
            .catch((_error) => undefined);
         setUser(user);
         const student = await getStudent()
            .then((user) => user)
            .catch((_error) => undefined);
         setStudent(student);
      }
      fetchUser();
   }, []);

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
                  {user && (
                     <tr>
                        <td> Email: </td>
                        <td> {user.email} </td>
                     </tr>
                  )}
                  {student && (
                     <>
                        <tr>
                           <td> Imię: </td>
                           <td> {student.first_name} </td>
                        </tr>
                        <tr>
                           <td> Nazwisko: </td>
                           <td> {student.last_name} </td>
                        </tr>
                        <tr>
                           <td> Data urodzenia: </td>
                           <td> {student.date_of_birth} </td>
                        </tr>
                        <tr>
                           <td> Numer telefonu: </td>
                           <td> {student.phone} </td>
                        </tr>
                     </>
                  )}
               </tbody>
            </table>
            {!student && (
               <div className="mb-3">
                  <div className="mb-1"> Aby móc zapisać się na zajęcia, musisz dokończyć rejestrację. </div>
                  <LinkButton to="/me/finish-registration" className="block">
                     {" "}
                     Dokończ rejestrację{" "}
                  </LinkButton>
               </div>
            )}
            <Button onClick={handleLogout} className="block">
               {" "}
               Wyloguj się{" "}
            </Button>
         </div>
         <div className={styles.footer} />
      </div>
   );
}
