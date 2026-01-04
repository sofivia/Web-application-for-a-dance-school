import { useEffect, useState } from "react";

import global from "@/global.module.css";
import Button from "@/components/Button";
import formstyles from "@/styles/forms.module.css";
import { useAuth } from "@/utils/auth/useAuth";
import { Link } from "react-router-dom";

import Select from "@/components/forms/SelectWithLabel";
import type { Option } from "@/components/forms/Select";
import styles from "./AccountList.module.css";
import InputWithLabel from "@/components/forms/InputWithLabel.tsx";
import { getAccounts, type AccountParams, type AccountView } from "@/api";

export default function AccountList() {
   const { isLoggedIn, loading } = useAuth();
   const [filter, provokeFilters] = useState(false);
   const [applied, setApplied] = useState({
      name: "",
      surname: "",
      accountType: "",
      email: "",
      isActive: "true",
   });

   const applyFilters = () => {
      setPage(1);
      provokeFilters(!filter);
   };

   const [tableLoading, setTableLoading] = useState(false);
   const [rows, setRows] = useState<AccountView[]>([]);
   const [count, setCount] = useState(0);

   const pageSize = 10;
   const [page, setPage] = useState(1);
   const pageCount = Math.max(1, Math.ceil(count / pageSize));

   useEffect(() => {
      async function loadTable(p: number, a = applied) {
         setTableLoading(true);
         try {
            const params: AccountParams = { page: p };

            if (a.name?.trim()) params.name = a.name.trim();
            if (a.surname?.trim()) params.surname = a.surname.trim();

            const t = a.accountType === "instruktor" ? "instructor" : a.accountType;
            if (t) params.accountType = t;

            if (a.email?.trim()) params.email = a.email.trim();

            if (a.isActive === "true" || a.isActive === "false") {
               params.isActive = a.isActive === "true";
            }

            const data = await getAccounts(params);
            setRows(data.results);
            setCount(data.count);
         } finally {
            setTableLoading(false);
         }
      }


      if (loading || !isLoggedIn) return;
      loadTable(page, applied);
   }, [loading, isLoggedIn, page, filter, applied]);

   const optionsAccType: Option[] = [
      {
         key: "student",
         value: "student",
         label: "Student",
      },
      {
         key: "admin",
         value: "admin",
         label: "Admin",
      },
      {
         key: "instruktor",
         value: "instruktor",
         label: "Instruktor",
      },
   ];
   const optionsActive: Option[] = [
      {
         key: "true",
         value: "true",
         label: "tak",
      },
      {
         key: "false",
         value: "false",
         label: "nie",
      },
   ];
   return (
      <div className={global.app_container}>
         <div className={styles.page}>
            <h1 className={`text-base font-bold mb-5`}>Użytkownicy</h1>
            <div className="flex mb-3 gap-3 justify-start">
               <Button key={1000} className={`${styles.addStudent}`} disabled={tableLoading}>
                  <Link to={"add/student"}>Dodaj nowego studenta</Link>
               </Button>
               <Button key={1001} className={`${styles.addInstructor}`} disabled={tableLoading}>
                  <Link to={"add/instructor"}>Dodaj nowego instruktora</Link>
               </Button>
            </div>
            <div className={`${styles.filtersBar} ${formstyles.panel} mb-5`}>
               <InputWithLabel
                  kind='react'
                  type="text"
                  label="Imię i Nazwisko"
                  values={{
                     placeholder: "Wpisz imię i nazwisko",
                     value: applied.name,
                     setValue: (e) =>
                        setApplied({
                           ...applied,
                           name: e.target.value,
                        }),
                  }}
               />
               <Select
                  kind='react'
                  label="Typ konta"
                  prompt="Wybierz typ"
                  options={optionsAccType}
                  values={{
                     value: applied.accountType,
                     setValue: (e) =>
                        setApplied({
                           ...applied,
                           accountType: e.target.value,
                        }),
                  }}
               />
               <InputWithLabel
                  kind='react'
                  type="text"
                  label="Email"
                  values={{
                     placeholder: "Wpisz email",
                     value: applied.email,
                     setValue: (e) =>
                        setApplied({
                           ...applied,
                           email: e.target.value,
                        }),
                  }}
               />
               <Select
                  kind='react'
                  label="Czy jest konto aktywne"
                  prompt="Wybierz opcje"
                  options={optionsActive}
                  values={{
                     value: applied.isActive,
                     setValue: (e) =>
                        setApplied({
                           ...applied,
                           isActive: e.target.value,
                        }),
                  }}
               />

               <Button onClick={applyFilters} className={styles.filterBtn}>
                  Filtruj
               </Button>
            </div>

            <div className={styles.tableWrap}>
               <table className={styles.table}>
                  <thead>
                     <tr>
                        <th> Imię Nazwisko </th>
                        <th> Typ Konta </th>
                        <th> Email </th>
                        <th> Jest aktywne </th>
                        <th> Akcje</th>
                     </tr>
                  </thead>
                  <tbody>
                     {!tableLoading &&
                        rows.map((g) => {
                           let name = "-";
                           let role = "-";

                           if (g.studentInfo) {
                              name = `${g.studentInfo.first_name} ${g.studentInfo.last_name}`;
                              role = "Student";
                           } else if (g.instructorInfo) {
                              name = `${g.instructorInfo.first_name} ${g.instructorInfo.last_name}`;
                              role = "Instruktor";
                           } else if (g.role == "admin")
                              role = "Admin";

                           return (
                              <tr key={g.pk}>
                                 <td>{name}</td>
                                 <td>{role}</td>
                                 <td>{g.email}</td>
                                 <td>{g.isActive ? "tak" : "nie"}</td>
                                 <td className="flex gap-5 justify-center">
                                    <Link to={`remove/${g.pk}`} className={formstyles.link}>
                                       Usuń
                                    </Link>
                                    <Link to={`edit/${g.pk}`} className={formstyles.link}>
                                       Edytuj
                                    </Link>
                                 </td>
                              </tr>
                           );
                        })}

                     {tableLoading && (
                        <tr>
                           <td colSpan={6} className={styles.emptyRow}>
                              Ładowanie...
                           </td>
                        </tr>
                     )}

                     {!tableLoading && rows.length === 0 && (
                        <tr>
                           <td colSpan={6} className={styles.emptyRow}>
                              Brak wyników dla wybranych filtrów.
                           </td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>

            <div className="mt-3 space-x-2">
               {[...Array(pageCount).keys()].map((p) => (
                  <Button
                     key={p + 1}
                     className={`${styles.filterBtn} ${p + 1 === page ? "!bg-main" : ""}`}
                     onClick={() => setPage(p + 1)}
                     disabled={tableLoading}>
                     {p + 1}
                  </Button>
               ))}
            </div>
         </div>
      </div>
   );
}
