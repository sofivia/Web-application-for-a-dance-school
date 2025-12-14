import { useNavigate } from "react-router-dom";
import { useState, type FormEvent } from 'react';
import DarkModeToggle from "@/components/DarkModeToggle.tsx";
import '@/index.css';
import styles from './Account.module.css';
import global from '@/global.module.css';
import inputstyles from "@/components/forms/Input.module.css";
import Input from "@/components/forms/Input.tsx"
import formstyle from "@/styles/forms.module.css"
import type { InputValues } from "@/components/forms/Input.tsx";
import { createStudent, type StudentData } from "@/api";

type Errors = {
    account?: string;
    first_name?: string;
    last_name?: string;
    date_of_birth?: string;
    phone?: string;
};

export type AxiosErr = {
    response?: {
        data?: Record<string, string[]>
    };
};

async function handlePost(student: StudentData) {
    let message;
    try {
        await createStudent(student);
    } catch (err: unknown) {
        message = typeof err === "object" && err !== null ?
            (err as AxiosErr)?.response?.data : undefined;
    }
    return message;
}


export default function FinishRegistration() {
    const navigate = useNavigate();
    const [isLoading, setLoading] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [phone, setPhone] = useState("");

    const [errors, setErrors] = useState<Errors>({});

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const msg = await handlePost({
            first_name: firstName,
            last_name: lastName,
            date_of_birth: dateOfBirth,
            phone: phone
        });
        if (msg === undefined)
            navigate("/me");
        else {
            setErrors(Object.keys(msg).reduce((acc, k) => (acc[k] = msg[k][0], acc), {} as Record<string, string>))
        }
        setLoading(false);
    };

    const values: InputValues[] = [
        { value: firstName, setValue: e => setFirstName(e.target.value), placeholder: "Imię" },
        { value: lastName, setValue: e => setLastName(e.target.value), placeholder: "Nazwisko" },
        { value: dateOfBirth, setValue: e => setDateOfBirth(e.target.value), placeholder: "Data urodzenia" },
        { value: phone, setValue: e => setPhone(e.target.value), placeholder: "Numer telefonu" }
    ];
    const [firstNameValues, lastNameValues, dateOfBirthValues, phoneValues] = values;
    console.log(errors);
    return (
        <div className={global.app_container}>
            <div className={global.header}>
                <DarkModeToggle />
            </div>
            <div className={formstyle.card}>
                <h2 className={formstyle.title}> Dokończ rejestrację </h2>
                <form onSubmit={handleSubmit} className={formstyle.form} noValidate>
                    {errors.account && <p className={`${inputstyles.error} mb-1`}>{errors.account}</p>}

                    <Input type="text" values={firstNameValues} error={errors.first_name} className="mb-3" />
                    <Input type="text" values={lastNameValues} error={errors.last_name} className="mb-3" />
                    <Input type="date" values={dateOfBirthValues} error={errors.date_of_birth} className="mb-3" />
                    <Input type="tel" values={phoneValues} error={errors.phone} className="mb-5" />

                    <button
                        type="submit"
                        className={formstyle.button}
                        disabled={isLoading}
                    >
                        {isLoading ? "Przetwarzanie" : "Zatwierdź"}
                    </button>
                </form>
            </div>
            <div className={styles.footer}>
            </div>
        </div >
    )
}

