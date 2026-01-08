import { useEffect, useState } from "react";

import global from "@/global.module.css";
import Button from "@/components/Button";
import formstyles from "@/styles/forms.module.css";
import tablestyles from "@/styles/listTable.module.css";
import { Link } from "react-router-dom";

import type { ReactSelectWithLabelProps } from "@/components/forms/SelectWithLabel";
import type { Option } from "@/components/forms/Select";
import styles from "./AccountList.module.css";
import type { ReactInputWithLabelProps } from "@/components/forms/InputWithLabel.tsx";
import { getAccounts, type AccountParams, type AccountView } from "@/api";
import { roleToPL } from "@/utils/apiutils";
import { InputList } from "@/components/forms/InputList";


export default function AccountList() {
   const [filter, provokeFilters] = useState(false);
   const [applied, setApplied] = useState({ name: "", surname: "", accountType: "", email: "", is_active: "true" });

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

            params.name = a.name?.trim();
            params.surname = a.surname?.trim();
            params.accountType = a.accountType;
            params.email = a.email?.trim();
            params.is_active = a.is_active === "true";

            const data = await getAccounts(params);
            setRows(data.results);
            setCount(data.count);
         } finally {
            setTableLoading(false);
         }
      }

      loadTable(page, applied);
   }, [page, filter, applied]);

   const accData = rows.map(r => {
      let name = "-";
      if (r.studentInfo)
         name = `${r.studentInfo.first_name} ${r.studentInfo.last_name}`;
      else if (r.instructorInfo)
         name = `${r.instructorInfo.first_name} ${r.instructorInfo.last_name}`;
      return { ...r, name, role: roleToPL(r.role) }
   });

   const optionsAccType: Option[] = [
      { key: "student", value: "student", label: "Student" },
      { key: "admin", value: "admin", label: "Admin" },
      { key: "instructor", value: "instructor", label: "Instruktor" },
   ];
   const optionsActive: Option[] = [
      { key: "true", value: "true", label: "tak" },
      { key: "false", value: "false", label: "nie" },
   ];

   const fields = [
      {
         name: "name", kind: "input-react", type: "text", label: "Imię i Nazwisko",
         values: {
            placeholder: "Wpisz imię i nazwisko", value: applied.name,
            setValue: e => setApplied({ ...applied, name: e.target.value })
         }
      } as ReactInputWithLabelProps,
      {
         name: "accountType", kind: "select-react", label: "Imię i Nazwisko", prompt: "Wybierz typ konta", options: optionsAccType,
         values: {
            value: applied.accountType,
            setValue: (e) => setApplied({ ...applied, accountType: e.target.value })
         }
      } as ReactSelectWithLabelProps,
      {
         name: "email", kind: 'input-react', type: "text", label: "Email", values: {
            placeholder: "Wpisz email", value: applied.email,
            setValue: (e) => setApplied({ ...applied, email: e.target.value }),
         }
      } as ReactInputWithLabelProps,
      {
         name: "is_active", kind: "select-react", label: "Czy konto jest aktywne", prompt: "Wybierz opcję", options: optionsActive,
         values: {
            value: applied.is_active,
            setValue: (e) => setApplied({ ...applied, is_active: e.target.value })
         }
      } as ReactSelectWithLabelProps,
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
               <InputList fields={fields} />

               <Button onClick={applyFilters} className={styles.filterBtn}>
                  Filtruj
               </Button>
            </div>

            <div className={styles.tableWrap}>
               <table className={`${styles.table} ${tablestyles.listTable}`}>
                  <thead>
                     <tr>
                        <th> Imię Nazwisko </th>
                        <th> Typ Konta </th>
                        <th> Email </th>
                     </tr>
                  </thead>
                  <tbody>
                     {!tableLoading &&
                        accData.map((g) =>
                           <tr key={g.pk}>
                              <td>{g.name}</td>
                              <td>{g.role}</td>
                              <td>
                                 <Link to={`details/${g.pk}`} className={formstyles.link}>
                                    {g.email}
                                 </Link>
                              </td>
                           </tr>
                        )}

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
                     className={`${styles.filterBtn} ${p + 1 === page ? "bg-main!" : ""}`}
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
