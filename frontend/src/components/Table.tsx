import type { ComponentPropsWithoutRef } from 'react';


export type TableField = {
    key: string;
    label: string;
    value: string;
}

export type TableProps = ComponentPropsWithoutRef<'table'> & {
    fields: TableField[];
}

export default function Table(props: TableProps) {
    const { fields, ...attrs } = props;
    return (
        <table {...attrs}>
            {fields.map(f => (
                <tr key={f.key}>
                    <td> {f.label} </td>
                    <td> {f.value} </td>
                </tr>))}
        </table>)
}