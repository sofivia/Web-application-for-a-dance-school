import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import InputWithLabel from "@/components/forms/InputWithLabel";
import Select from "@/components/forms/SelectWithLabel";
import Button from "@/components/Button";
import global from "@/global.module.css";
import TextArea from "@/components/forms/TextArea";
import { getErrors, handlePost, type ErrMsg, type GlobalErr } from "@/utils/apiutils";
import inputstyles from "@/components/forms/Input.module.css";
import { getAccount, editInstructor, editStudent, type AccountView, type BaseInstructor, type BaseStudent } from "@/api";

type Errors = Record<string, string>;
export default function AccountEdit() {
   const { id } = useParams();
   const [errors, setErrors] = useState<Errors>({});
   const [isLoading, setLoading] = useState(false);
   const [account, setAccount] = useState<AccountView | null>(null);
   const [formData, setFormData] = useState({
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      role: "admin",
      description: "",
      isActive: true,
      date: "",
   });

   const fetchAccount = useCallback(async () => {
      if (!id) return;

      const fetchedAccount = await getAccount(id);
      setAccount(fetchedAccount);

      const instructor = fetchedAccount.instructorInfo;
      const student = fetchedAccount.studentInfo;

      setFormData({
         firstName: instructor?.first_name ?? student?.first_name ?? "",
         lastName: instructor?.last_name ?? student?.last_name ?? "",
         phone: instructor?.phone ?? student?.phone ?? "",
         description: instructor?.short_bio ?? "",
         date: student?.date_of_birth ?? "",
         email: fetchedAccount.email ?? "",
         role: fetchedAccount.role ?? "admin",
         isActive: fetchedAccount.isActive ?? true,
      });
   }, [id]);

   useEffect(() => {
      fetchAccount();
   }, [fetchAccount]);

   const activeOptions = [
      { key: "true", value: "true", label: "Tak" },
      { key: "false", value: "false", label: "Nie" },
   ];
   if (!account) return <div>Ładowanie...</div>;

   const handleEdit = async () => {
      setLoading(true);
      let msg: ErrMsg | undefined | GlobalErr = {};
      if (account.role == "student") {
         const st: BaseStudent = {
            email: formData.email,
            is_active: formData.isActive,
            first_name: formData.firstName,
            last_name: formData.lastName,
            date_of_birth: formData.date,
            phone: formData.phone,
         };
         msg = await handlePost(() => editStudent(account.pk, st));
      } else if (account.role == "instructor") {
         const ins: BaseInstructor = {
            email: formData.email,
            is_active: formData.isActive,
            first_name: formData.firstName,
            last_name: formData.lastName,
            short_bio: formData.description,
            phone: formData.phone,
         };
         msg = await handlePost(() => editInstructor(account.pk, ins));
      } else return;
      if (msg != undefined) {
         setErrors(getErrors(msg));
      }
      setLoading(false);
   };

   return (
      <div className={global.app_container}>
         <div className={"flex flex-col w-3xl gap-3"}>
            <h1 className="mb-3 font-bold text-lg">Edytuj użytkownika</h1>
            {errors.account && <p className={`${inputstyles.error} mb-1`}>{errors.account}</p>}
            {(account.role == "student" || account.role == "instructor") && (
               <InputWithLabel
                  kind='react'
                  type="text"
                  label="Imię"
                  values={{
                     placeholder: "Wpisz imię",
                     value: formData.firstName,
                     setValue: (e) => setFormData({ ...formData, firstName: e.target.value }),
                  }}
               />
            )}
            {(account.role == "student" || account.role == "instructor") && (
               <InputWithLabel
                  kind='react'
                  type="text"
                  label="Nazwisko"
                  values={{
                     placeholder: "Wpisz nazwisko",
                     value: formData.lastName,
                     setValue: (e) => setFormData({ ...formData, lastName: e.target.value }),
                  }}
               />
            )}
            <InputWithLabel
               kind='react'
               type="email"
               label="Email"
               values={{
                  placeholder: "Wpisz email",
                  value: formData.email,
                  setValue: (e) => setFormData({ ...formData, email: e.target.value }),
               }}
            />
            {(account.role == "student" || account.role == "instructor") && (
               <InputWithLabel
                  kind='react'
                  type="phone"
                  label="Telefon"
                  values={{
                     placeholder: "Wpisz numer telefonu",
                     value: formData.phone,
                     setValue: (e) => setFormData({ ...formData, phone: e.target.value }),
                  }}
               />
            )}
            {account.role == "instructor" && (
               <div className="text-left">
                  {" "}
                  <label>{"Krótka biografia"}</label>
                  <TextArea
                     type="textarea"
                     rows={5}
                     values={{
                        placeholder: "Opis",
                        value: formData.description,
                        setValue: (e) => setFormData({ ...formData, description: e.target.value }),
                     }}
                  />
               </div>
            )}
            {account.role == "student" && (
               <InputWithLabel
                  kind='react'
                  type="date"
                  label="Data urodzenia"
                  values={{
                     placeholder: "Wpisz datę urodzenia",
                     value: formData.date,
                     setValue: (e) => setFormData({ ...formData, date: e.target.value }),
                  }}
               />
            )}

            <Select
               kind='react'
               label="Czy konto jest aktywne"
               prompt="Wybierz"
               options={activeOptions}
               values={{
                  value: formData.isActive ? "true" : "false",
                  setValue: (e) => setFormData({ ...formData, isActive: e.target.value === "true" }),
               }}
            />

            <div className="mt-5 flex gap-3">
               <Button onClick={handleEdit}>{isLoading ? "Przetwarzanie" : "Zapisz"}</Button>
            </div>
         </div>
      </div>
   );
}
