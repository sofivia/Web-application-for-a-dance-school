import { useState, useEffect } from 'react';
import { useParams } from "react-router"
import { getClassGroup, type ClassGroup } from "@/api";
import { getWeekday, getHour } from '@/utils/apiutils';
import Button from '@/components/Button';

import global from "@/global.module.css";
import liststyles from "@/styles/list.module.css"


export default function GroupDetail() {
    const { id } = useParams();

    const [group, setGroup] = useState<ClassGroup>();

    useEffect(() => {
        async function fetchClassGroup() {
            setGroup(await getClassGroup(id as string));
        }
        fetchClassGroup();
    }, []);

    return (
        <div className={global.app_container}>
            <div className={liststyles.listPane}>
                {group && <table className="mb-3">
                    <tbody>
                        <tr>
                            <td> Nazwa: </td>
                            <td> {group.name} </td>
                        </tr>
                        <tr>
                            <td> Czas: </td>
                            <td> {`${getWeekday(group.weekday)} ${getHour(group.start_time)} - ${getHour(group.end_time)}`} </td>
                        </tr>
                        <tr>
                            <td> Instruktor: </td>
                            <td> {group.primary_instructor} </td>
                        </tr>
                        <tr>
                            <td> Miejsce: </td>
                            <td> {group.location} </td>
                        </tr>
                        <tr>
                            <td> Okres: </td>
                            <td> {`${group.start_date} - ${group.end_date}`} </td>
                        </tr>
                        <tr>
                            <td> Limit miejsc: </td>
                            <td> {group.capacity} </td>
                        </tr>
                    </tbody>
                </table>}
                <Button onClick={() => 0}> Zapisz się </Button>
            </div>
        </div >
    )
}