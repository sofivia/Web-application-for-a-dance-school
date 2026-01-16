import FormTemplate from "@/components/FormTemplate.tsx";
import type { GeneralInput } from "@/components/forms/InputList.tsx";
import { type Student, type Instructor, registerStudent, registerInstructor } from "@/api.ts";
import { useAuth } from "@/utils/auth/useAuth";

import global from "@/global.module.css";
import formstyle from "@/styles/forms.module.css";


export default function FinishRegistration() {
    const { roles } = useAuth();
    let fields: GeneralInput[];
    if (roles.includes("student")) {
        fields = [
            { name: "first_name", type: "text", label: "Imię", kind: "input-classic" },
            { name: "last_name", type: "text", label: "Nazwisko", kind: "input-classic" },
            { name: "date_of_birth", type: "date", label: "Data urodzenia", kind: "input-classic" },
            { name: "phone", type: "tel", label: "Numer telefonu", placeholder: "111222333", kind: "input-classic" }
        ];
    } else {
        fields = [
            { name: "first_name", type: "text", label: "Imię", kind: "input-classic" },
            { name: "last_name", type: "text", label: "Nazwisko", kind: "input-classic" },
            { name: "phone", type: "tel", label: "Numer telefonu", placeholder: "111222333", kind: "input-classic" },
            { name: "short_bio", kind: "textarea-classic", label: "Krótka biografia", placeholder: "Stepuję od...", rows: 5 },
        ];
    }
    return (
        <div className={global.app_container}>
            <div className={formstyle.card}>
                <h2 className={formstyle.title}> Dokończ rejestrację </h2>
                {roles.includes("student") ?
                    <FormTemplate<Student> apiCall={data => registerStudent(data as Student)} redirect="/me" fields={fields} />
                    :
                    <FormTemplate<Instructor> apiCall={data => registerInstructor(data as Instructor)} redirect="/me" fields={fields} />
                }
            </div>
        </div>
    );
}
