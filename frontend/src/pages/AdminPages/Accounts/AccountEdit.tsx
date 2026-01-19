import { useState, useEffect, useCallback } from "react";
import { useParams, Navigate } from "react-router-dom";
import global from "@/global.module.css";
import {
   getAccount,
   editInstructor,
   editStudent,
   type AccountView,
   type BaseInstructor,
   type BaseStudent,
   passProductAPI,
} from "@/api";
import type { ClassicInputWithLabelProps } from "@/components/forms/InputWithLabel";
import FormTemplate from "@/components/FormTemplate.tsx";
import type { ClassicCheckboxProps } from "@/components/forms/classic/ClassicCheckbox";
import type { Option } from "@/components/forms/classic/ClassicSelect";
import type { ClassicTextAreaWithLabelProps } from "@/components/forms/TextAreaWithLabel";
import { transformAccount, type AccountData } from "@/utils/apiutils";
import type { ClassicSelectWithLabelProps } from "@/components/forms/SelectWithLabel";

function editStudentForm(pk: string, student: AccountData, options: Option[]) {
   const fields = [
      {
         name: "first_name",
         type: "text",
         label: "Imię",
         defaultValue: student.first_name,
         kind: "input-classic",
      } as ClassicInputWithLabelProps,
      {
         name: "last_name",
         type: "text",
         label: "Nazwisko",
         defaultValue: student.last_name,
         kind: "input-classic",
      } as ClassicInputWithLabelProps,
      {
         name: "email",
         type: "email",
         label: "Email",
         defaultValue: student.email,
         kind: "input-classic",
      } as ClassicInputWithLabelProps,
      {
         name: "phone",
         type: "tel",
         label: "Telefon",
         defaultValue: student.phone,
         kind: "input-classic",
      } as ClassicInputWithLabelProps,
      {
         name: "pass_product",
         label: "Karnet",
         prompt: "Wybierz",
         defaultValue: student.pass_product_id,
         options: options,
         kind: "select-classic",
      } as ClassicSelectWithLabelProps,
      {
         name: "date_of_birth",
         type: "date",
         label: "Data urodzenia",
         defaultValue: student.date_of_birth?.toDateString(),
         kind: "input-classic",
      } as ClassicInputWithLabelProps,
      {
         name: "is_active",
         kind: "checkbox-classic",
         label: "Czy konto ma być aktywne?",
         defaultChecked: student.is_active,
      } as ClassicCheckboxProps,
   ];
   return (
      <FormTemplate<BaseStudent>
         apiCall={(data) => {
            data.pass_product = data.pass_product === "" ? null : data.pass_product;
            return editStudent(pk, data as BaseStudent);
         }}
         redirect={`../details/${pk}`}
         fields={fields}
      />
   );
}

function editInstructorForm(pk: string, instructor: AccountData) {
   const fields = [
      {
         name: "first_name",
         type: "text",
         label: "Imię",
         defaultValue: instructor.first_name,
         kind: "input-classic",
      } as ClassicInputWithLabelProps,
      {
         name: "last_name",
         type: "text",
         label: "Nazwisko",
         defaultValue: instructor.last_name,
         kind: "input-classic",
      } as ClassicInputWithLabelProps,
      {
         name: "email",
         type: "email",
         label: "Email",
         defaultValue: instructor.email,
         kind: "input-classic",
      } as ClassicInputWithLabelProps,
      {
         name: "phone",
         type: "tel",
         label: "Telefon",
         defaultValue: instructor.phone,
         kind: "input-classic",
      } as ClassicInputWithLabelProps,
      {
         name: "short_bio",
         kind: "textarea-classic",
         rows: 5,
         label: "Krótki życiorys",
         defaultValue: instructor.short_bio,
      } as ClassicTextAreaWithLabelProps,
      {
         name: "is_active",
         kind: "checkbox-classic",
         label: "Czy konto ma być aktywne?",
         defaultChecked: instructor.is_active,
      } as ClassicCheckboxProps,
   ];
   return (
      <FormTemplate<BaseInstructor>
         apiCall={(data) => editInstructor(pk, data as BaseInstructor)}
         redirect={`../details/${pk}`}
         fields={fields}
      />
   );
}

export default function AccountEdit() {
   const { id } = useParams();

   const [isLoading, setLoading] = useState(true);
   const [account, setAccount] = useState<AccountView | null>(null);
   const [formData, setFormData] = useState<AccountData | null>(null);
   const [options, setOptions] = useState<Option[]>([]);

   const fetchAccount = useCallback(async () => {
      const fetchedAccount = await getAccount(id || "");
      setAccount(fetchedAccount);
      if (fetchedAccount?.role === "student") {
         const data = await passProductAPI.getMany(1, { is_active: true });
         setOptions(
            data.results.map((p) => ({
               key: String(p.id),
               label: p.name,
               value: String(p.id),
            }))
         );
      } else {
         setOptions([]);
      }

      setFormData(transformAccount(fetchedAccount));
      setLoading(false);
   }, [id]);

   useEffect(() => {
      fetchAccount();
   }, [fetchAccount]);

   if (!id) return <Navigate to="/" replace />;
   if (!isLoading && !account) return <Navigate to="/" replace />;

   return (
      <div className={global.app_container}>
         <div className={"flex flex-col gap-3"}>
            <h1 className="mb-3 font-bold text-lg">Edytuj użytkownika</h1>
            <Content {...{ isLoading, formData, account, options }} />
         </div>
      </div>
   );
}

function Content(props: {
   isLoading: boolean;
   formData: AccountData | null;
   account: AccountView | null;
   options: Option[] | null;
}) {
   const { isLoading, formData, account, options } = props;
   if (!account) return <> Nie ma takiego konta </>;
   if (isLoading || !formData) return <> Ładowanie... </>;
   return (
      <>
         {formData.role != "student" && formData.role != "instructor" && "Nie można edytować"}
         {formData.role == "student" && editStudentForm(account.pk, formData, options ?? [])}
         {formData.role == "instructor" && editInstructorForm(account.pk, formData)}
      </>
   );
}
