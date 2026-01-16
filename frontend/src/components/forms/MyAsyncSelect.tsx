import AsyncSelect from 'react-select/async';
import type { SingleValue } from 'react-select';
import "./Input.css";
import { useId } from 'react';


export interface Option {
    value: string;
    label: string;
}

export type Props = {
    kind: "async-select"
    name: string;
    id?: string;
    error?: string;
    onSelect: (id: string | null) => void;
    getOptions: (inputValue: string) => Promise<Option[]>;
}

export default function MyAsyncSelect(props: Props) {
    const loadOptions = async (inputValue: string): Promise<Option[]> => {
        if (!inputValue) return [];
        return props.getOptions(inputValue);
    }

    const handleChange = (newValue: SingleValue<Option>) => {
        props.onSelect(newValue ? newValue.value : null);
    };

    const autoId = useId();

    return (
        <>
            <AsyncSelect
                id={props.id ?? autoId}
                cacheOptions
                defaultOptions
                classNamePrefix="mySelect"
                loadOptions={loadOptions}
                onChange={handleChange}
                placeholder="Wybierz"
                noOptionsMessage={() => "Brak opcji"}
                isClearable
            />
        </>
    );
};