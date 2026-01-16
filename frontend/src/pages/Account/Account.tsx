import { useState, useEffect } from "react";
import Button from "@/components/Button.tsx";
import LinkButton from "@/components/LinkButton.tsx";
import Table from "@/components/Table.tsx";
import type { TableRow } from "@/components/Table.tsx";
import "@/index.css";
import styles from "./Account.module.css";
import tablestyles from "@/styles/simpleTable.module.css";
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
      ["Data urodzenia", student.date_of_birth?.toDateString() ?? "—"],
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
   const rows = attrs.map(a => ({ key: a[0], fields: a } as TableRow))
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
            <Table className={`${tablestyles.simpleTable} mb-5`} rows={rows} />
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
