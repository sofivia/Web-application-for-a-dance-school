import FormTemplate from "@/components/FormTemplate.tsx";
import type { BaseField, TextAreaField } from "@/components/FormTemplate.tsx";
import { createStudent, createInstructor, type Student, type Instructor } from "@/api.ts";
import { useAuth } from "@/utils/auth/useAuth";

import global from "@/global.module.css";
import formstyle from "@/styles/forms.module.css";


export default function FinishRegistration() {
    const { roles } = useAuth();
    let fields: BaseField[];
    if (roles.includes("student")) {
        fields = [
            { key: "first_name", type: "text", placeholder: "Imię" },
            { key: "last_name", type: "text", placeholder: "Nazwisko" },
            { key: "date_of_birth", type: "date", placeholder: "Data urodzenia" },
            { key: "phone", type: "tel", placeholder: "Numer telefonu" }
        ];
    } else {
        fields = [
            { key: "first_name", type: "text", placeholder: "Imię" },
            { key: "last_name", type: "text", placeholder: "Nazwisko" },
            { key: "phone", type: "tel", placeholder: "Numer telefonu" },
            { key: "short_bio", type: "textarea", placeholder: "Stepuję od...", name: "Krótka biografia", rows: 5 } as TextAreaField
        ];
    }
    return (
        <div className={global.app_container}>
            <div className={formstyle.card}>
                <h2 className={formstyle.title}> Dokończ rejestrację </h2>
                {roles.includes("student") ?
                    <FormTemplate<Student> apiCall={data => createStudent(data as Student)} redirect="/me" fields={fields} />
                    :
                    <FormTemplate<Instructor> apiCall={data => createInstructor(data as Instructor)} redirect="/me" fields={fields} />
                }
            </div>
        </div>
    );
}
