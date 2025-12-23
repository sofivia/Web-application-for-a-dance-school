import { useState, useEffect, useCallback } from 'react';
import { useParams } from "react-router"
import { getClassGroup, type ClassGroup } from "@/api";
import { getWeekday, getHour } from '@/utils/dateUtils';
import Button from '@/components/Button';
import { enroll, unenroll } from "@/api";

import global from "@/global.module.css";
import liststyles from "@/styles/list.module.css"


export default function GroupDetail() {
    const { id } = useParams();

    const [group, setGroup] = useState<ClassGroup>();


    const fetchClassGroup = useCallback(async () => {
        setGroup(await getClassGroup(id as string));
    }, [id])

    useEffect(() => {
        fetchClassGroup();
    }, [fetchClassGroup]);

    let buttonCb;
    if (group && group.is_enrolled)
        buttonCb = async () => await unenroll(group.pk) && fetchClassGroup();
    else if (group && !group.is_enrolled)
        buttonCb = async () => await enroll(group.pk) && fetchClassGroup();
    else
        buttonCb = () => 0;

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
                            <td> {group.primary_instructor.first_name} {group.primary_instructor.last_name} </td>
                        </tr>
                        <tr>
                            <td> Miejsce: </td>
                            <td> {group.location.name} </td>
                        </tr>
                        <tr>
                            <td> Okres: </td>
                            <td> {`${group.start_date} - ${group.end_date}`} </td>
                        </tr>
                        <tr>
                            <td> Limit miejsc: </td>
                            <td> {group.nr_enrolled} / {group.effective_capacity} </td>
                        </tr>
                    </tbody>
                </table>}
                {group && <Button onClick={buttonCb}> {group.is_enrolled ? "Wypisz" : "Zapisz"} się </Button>}
            </div>
        </div >
    )
}