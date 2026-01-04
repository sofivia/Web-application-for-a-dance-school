import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router";
import Button from "@/components/Button";
import global from "@/global.module.css";
import liststyles from "@/styles/list.module.css";
import { getErrors, handlePost } from "@/utils/apiutils";
import inputstyles from "@/components/forms/Input.module.css";
import { getAccount, removeAccount, type AccountView } from "@/api";
import { useNavigate } from "react-router-dom";

type Errors = Record<string, string>;
export default function AccountRemove() {
   const { id } = useParams();

   const [account, setAccount] = useState<AccountView>();
   const [errors, setErrors] = useState<Errors>({});
   const [isLoading, setLoading] = useState(false);
   const fetchAccount = useCallback(async () => {
      if (!id) return;

      const fetchedAccount = await getAccount(id);
      setAccount(fetchedAccount);
   }, [id]);

   useEffect(() => {
      fetchAccount();
   }, [fetchAccount]);

   const nav = useNavigate();

   const handleRemove = async () => {
      if (!id) return;
      setLoading(true);

      const msg = await handlePost(() => removeAccount(id));

      setLoading(false);

      if (msg !== undefined) {
         setErrors(getErrors(msg));
         return;
      }

      nav("/userManage");
   };

   let name = "-";
   let role = "Admin";
   if (account?.studentInfo) {
      name = `${account.studentInfo.first_name} ${account.studentInfo.last_name}`;
      role = "Student";
   } else if (account?.instructorInfo) {
      name = `${account.instructorInfo.first_name} ${account.instructorInfo.last_name}`;
      role = "Instruktor";
   }

   return (
      <div className={global.app_container}>
         <div className={liststyles.listPane}>
            {errors.account && <p className={`${inputstyles.error} mb-1`}>{errors.account}</p>}
            {account && (
               <table className="mb-3">
                  <tbody>
                     <tr>
                        <td> PK: </td>
                        <td> {account.pk} </td>
                     </tr>
                     <tr>
                        <td> Imię i nazwisko: </td>
                        <td> {name} </td>
                     </tr>
                     <tr>
                        <td> Email: </td>
                        <td>{account.email}</td>
                     </tr>
                     <tr>
                        <td> Rola: </td>
                        <td>{role}</td>
                     </tr>
                     <tr>
                        <td> Czy aktywny: </td>
                        <td> {account.isActive ? "Tak" : "Nie"} </td>
                     </tr>
                  </tbody>
               </table>
            )}
            {account && <Button onClick={handleRemove}> {isLoading ? "Przetwarzanie" : "Usuń"}</Button>}
         </div>
      </div>
   );
}
