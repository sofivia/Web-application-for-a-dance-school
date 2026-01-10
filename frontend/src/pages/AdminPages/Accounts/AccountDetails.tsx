import { useState, useEffect, useCallback } from "react";
import { useParams, Navigate } from "react-router";
import Button from "@/components/Button";
import global from "@/global.module.css";
import liststyles from "@/styles/list.module.css";
import { getErrors, handlePost } from "@/utils/apiutils";
import inputstyles from "@/components/forms/Input.module.css";
import tablestyles from "@/styles/simpleTable.module.css";
import { getAccount, removeAccount } from "@/api";
import { useNavigate } from "react-router-dom";
import Table from "@/components/Table.tsx";
import type { TableRow } from "@/components/Table.tsx";
import { transformAccount, roleToPL, type AccountData } from "@/utils/apiutils";


type Errors = Record<string, string>;

export default function AccountDetails() {
   const { id } = useParams();
   const nav = useNavigate();

   const [account, setAccount] = useState<AccountData>();
   const [errors, setErrors] = useState<Errors>({});
   const [isLoading, setLoading] = useState(false);

   if (!id) return <Navigate to="/" replace />;

   const fetchAccount = useCallback(async () => {
      setAccount(transformAccount(await getAccount(id)));
   }, [id]);

   useEffect(() => {
      fetchAccount();
   }, [fetchAccount]);

   const handleRemove = async () => {
      setLoading(true);
      const msg = await handlePost(() => removeAccount(id));
      setLoading(false);

      if (msg !== undefined)
         setErrors(getErrors(msg));
      else
         nav("/userManage");
   };

   if (!account)
      return <> ładowanie </>

   const rows: TableRow[] = [
      { key: "pk", fields: ["PK", account.pk] },
      { key: "email", fields: ["email", account.email] },
      { key: "name", fields: ["Imię i nazwisko", `${account.first_name} ${account.last_name}`] },
      { key: "phone", fields: ["Numer telefonu", account?.phone ?? "-"] },
      { key: "role", fields: ["Rola", roleToPL(account.role)] },
      { key: "active", fields: ["Czy konto aktywne", account.is_active ? "Tak" : "Nie"] },
   ].concat(
      account.role == "student" ?
         [{ key: "date_of_birth", fields: ["Data urodzenia", account.date_of_birth?.toDateString() ?? "-"] },]
         : [{ key: "short_bio", fields: ["Krótka biografia", account.short_bio ?? ""] },]
   )

   return (
      <div className={global.app_container}>
         <div className={liststyles.listPane}>
            {errors.account && <p className={`${inputstyles.error} mb-1`}>{errors.account}</p>}
            <Table rows={rows} className={`${tablestyles.simpleTable} mb-3`} style={{ overflowWrap: "anywhere" }} />
            <div className="space-x-3">
               <Button onClick={() => nav(`../edit/${account.pk}`)}> {isLoading ? "Przetwarzanie" : "Edytuj"} </Button>
               {account.is_active && <Button onClick={handleRemove} className="bg-red-500!"> {isLoading ? "Przetwarzanie" : "Usuń"} </Button>}
            </div>
         </div>
      </div>
   );
}
