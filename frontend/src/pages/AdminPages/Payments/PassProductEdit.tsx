import Loading from "@/components/Loading";
import { useRef, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router";
import { passProductAPI, type PassProduct } from "@/api";
import PriceInput, { type PriceInputHandle } from "./PriceInput";

import globals from "@/global.module.css"
import InputWithLabel from "@/components/forms/InputWithLabel";
import TextAreaWithLabel from "@/components/forms/TextAreaWithLabel";
import ClassicCheckbox from "@/components/forms/classic/ClassicCheckbox";
import { handlePost2, getErrors } from "@/utils/apiutils";
import toast from 'react-hot-toast';
import formstyle from '@/styles/forms.module.css'


export default function PassProductEdit() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [errors, setErrors] = useState<Record<string, string>>({});

    const priceInputRef = useRef<PriceInputHandle>(null);
    const example: PassProduct = {
        name: "Super Karnet", description: "Dla stepujących", price_cents: 10999, is_active: true
    };
    const cb = id ? () => passProductAPI.get(id) : () => Promise.resolve(example);
    const apicall = (passProduct: PassProduct) => id ? passProductAPI.edit(id, passProduct) : passProductAPI.create(passProduct);
    const getExtraProp = (x?: string) => id ? { defaultValue: x } : { placeholder: x }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const rawData = Object.fromEntries(formData.entries());
        const passProduct = { is_active: false, ...rawData, price_cents: priceInputRef.current?.getValue() } as PassProduct;
        toast.promise(handlePost2(() => apicall(passProduct)), {
            loading: 'Ładowanie...',
            success: () => {
                setTimeout(() => navigate(`../pass-products`), 300);
                return <b> Sukces </b>;
            },
            error: (err) => {
                setErrors(getErrors(err));
                return <b> Błąd </b>
            }
        });
    };

    const handleDelete = () => {
        if (id) passProductAPI.delete(id);
        navigate("../pass-products");
    }

    return (
        <div className={globals.app_container}>
            <div className="flex flex-col gap-3 w-full max-w-150 px-2">
                <Loading<PassProduct> load={cb}>
                    {(data: PassProduct) => {
                        return <>
                            <form onSubmit={handleSubmit} noValidate className="space-y-3">
                                <InputWithLabel name="name" type="text" label="Nazwa"
                                    {...getExtraProp(data.name)} error={errors.name} kind="input-classic" />
                                <PriceInput ref={priceInputRef} initial={`${data.price_cents / 100}`} error={errors.price_cents} />
                                <TextAreaWithLabel name="description" label="Opis"
                                    {...getExtraProp(data.description)} error={errors.description} kind="textarea-classic" />
                                <ClassicCheckbox name="is_active" label="Czy aktywny"
                                    defaultChecked={data.is_active} error={errors.is_active} kind="checkbox-classic" />

                                <button type="submit" className={`${formstyle.button} w-full mt-5`}>
                                    Zatwierdź
                                </button>
                            </form>
                            {id && <button onClick={handleDelete}
                                className={`${formstyle.button} w-full mt-10 bg-red-500!`}>
                                Usuń
                            </button>}
                        </>
                    }}
                </Loading>
            </div>
        </div>
    );
}