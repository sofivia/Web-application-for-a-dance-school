import useFetch from '../utils/useFetch';
import { getPing } from '../calls/Ping';
import type { Ping } from '../calls/Ping';


export default function PingPanel() {
    const { data: ping, error } = useFetch<Ping>(getPing);
    const status = ping === undefined ? "error" : ping.status;
    console.log(error);
    return (<> {`ping's status: ${status}`} </>);
}
