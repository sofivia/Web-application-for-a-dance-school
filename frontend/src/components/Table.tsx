import type { ComponentPropsWithoutRef } from 'react';


export type TableRow = {
    key: string;
    fields: string[];
}

export type TableProps = ComponentPropsWithoutRef<'table'> & {
    header?: TableRow;
    rows: TableRow[];
}

export default function Table(props: TableProps) {
    const { header, rows, ...attrs } = props;
    return (
        <table {...attrs}>
            {header && <thead>
                <tr key={header.key}>
                    {header.fields.map((f, i) => <th key={i}> {f} </th>)}
                </tr>
            </thead>}
            <tbody>
                {rows.map(r =>
                    <tr key={r.key}>
                        {r.fields.map((f, i) => <td key={i}> {f} </td>)}
                    </tr>)}
            </tbody>
        </table>)
}