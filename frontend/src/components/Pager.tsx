import { useState } from "react";
import globals from "@/global.module.css"
import Button from "./Button";

type Children = (
    page: number,
    prev: React.Dispatch<React.SetStateAction<boolean>>,
    next: React.Dispatch<React.SetStateAction<boolean>>
) => React.ReactNode;

export default function Pager(props: { children: Children }) {
    const { children } = props;
    const [page, setPage] = useState(1);
    const [prev, setPrev] = useState(false);
    const [next, setNext] = useState(false);

    return (
        <div className={globals.app_container}>
            {children(page, setPrev, setNext)}
            <div className="row-3">
                {prev && <Button onClick={() => setPage(page - 1)}>
                    poprzednie
                </Button>}
                {next && <Button onClick={() => setPage(page + 1)}>
                    następne
                </Button>}
            </div>
        </div>
    )
}