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
                <td key={header.key}>
                    {header.fields.map(f => <th> {f} </th>)}
                </td>
            </thead>}
            <tbody>
                {rows.map(r =>
                    <tr key={r.key}>
                        {r.fields.map(f => <td> {f} </td>)}
                    </tr>)}
            </tbody>
        </table>)
}