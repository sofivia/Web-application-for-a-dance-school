import "@/index.css";
import { useEffect, useState } from "react";

import global from "@/global.module.css";
import Button from "@/components/Button";
import { Payment, paymentAPI } from "@/api";
import { useAuth } from "@/utils/auth/useAuth";
import styles from "../GroupRegistration/ClassReg.module.css";

export default function StudentPayments() {
   const { isLoggedIn, loading } = useAuth();

   const [tableLoading, setTableLoading] = useState(false);
   const [rows, setRows] = useState<Payment[]>([]);
   const [count, setCount] = useState(0);

   const pageSize = 10;
   const [page, setPage] = useState(1);

   const pageCount = Math.max(1, Math.ceil(count / pageSize));

   useEffect(() => {
      async function loadTable(p: number) {
         setTableLoading(true);
         try {
            const res = await paymentAPI.getMany(p, { status: "pending" });
            setRows(res.results);
            setCount(res.count);
         } finally {
            setTableLoading(false);
         }
      }

      if (loading || !isLoggedIn) return;
      loadTable(page);
   }, [loading, isLoggedIn, page]);

   return (
      <div className={global.app_container}>
         <div className={styles.page}>
            <h1 className={`text-base font-bold mb-5  `}>Załegle płatności</h1>

            <div className={styles.tableWrap}>
               <table className={styles.table}>
                  <thead>
                     <tr>
                        <th> Data załegłości </th>
                        <th> Kwota </th>
                        <th> Karnet </th>
                     </tr>
                  </thead>
                  <tbody>
                     {!tableLoading &&
                        rows.map((g) => (
                           <tr key={g.id}>
                              {/* @ts-expect-error */}
                              <td> {g.period_start} </td>
                              <td> {g.amount_cents} zł </td>
                              <td>{g.product_name}</td>
                           </tr>
                        ))}
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
                              Brak załegłości.
                           </td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>

            <div className="mt-3">
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
