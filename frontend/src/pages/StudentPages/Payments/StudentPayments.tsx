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
            <div className="mb-8 p-6 rounded-lg border border-[var(--gray)] bg-bckg text-fnt ">
               <h2 className="text-4xl font-bold mb-3 text-[var(--main)]">Forma płatności</h2>

               <p className="text-base mb-3 text-xl">
                  Wszystkich płatności należy dokonywać w formie przelewu{" "}
                  <span className="font-semibold  text-red-500"> do 5 dnia każdego miesiąca</span>.
               </p>

               <div className="text-base space-y-1 text-xl">
                  <p className="font-semibold">Dane do przelewu:</p>

                  <p>
                     Anna Kołakowska-Kubicka Tip Tap
                     <br />
                     ul. Niewielka 29A/59
                     <br />
                     00-713 Warszawa
                  </p>

                  <p className="pt-2">
                     <span className="font-semibold">Nr konta:</span>{" "}
                     <span className="tracking-wide font-semibold">09 1160 2202 0000 0005 8644 0138</span>
                  </p>

                  <p className="pt-2">
                     <span className="font-semibold">Tytuł przelewu:</span> Imię i nazwisko / miesiąc, za który wnoszona
                     jest opłata
                  </p>
               </div>
            </div>

            <h2 className={`text-3xl  font-bold mb-5  `}>Załegle płatności</h2>

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
                              {/* @ts-expect-error date to string doesn't work, bcs it is string*/}
                              <td> {g.period_start} </td>
                              <td>
                                 {new Intl.NumberFormat("pl-PL", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                 }).format(g.amount_cents / 100)}{" "}
                                 zł
                              </td>
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
