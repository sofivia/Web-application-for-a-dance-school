import { useState, useImperativeHandle, forwardRef } from 'react';
import InputWithLabel from "@/components/forms/InputWithLabel";
import type { InputValues } from '@/components/forms/commons';


export type Props = { initial: string, error: string }
export interface PriceInputHandle { getValue: () => number; }

const PriceInput = forwardRef<PriceInputHandle, Props>((props, ref) => {
    const [price, setPrice] = useState<string>(props.initial);
    const filterPrice = (price: string) => {
        if (price == "" || /^\d*\.?\d{0,2}$/.test(price))
            setPrice(price);
    }

    useImperativeHandle(ref, () => ({ getValue: () => { return parseFloat((parseFloat(price) * 100).toFixed(2)); } }));

    const priceValues: InputValues = {
        value: price ?? "",
        setValue: e => filterPrice(e.target.value),
        placeholder: props.initial
    }
    return <InputWithLabel name="price_cents" type="text" label="Cena (zł)"
        values={priceValues} error={props.error} kind="input-react" />
})

export default PriceInput;
