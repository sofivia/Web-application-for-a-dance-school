import axios from "axios";
import type { AxiosResponse } from "axios";
import { api } from './base.tsx'

export type Ping = { status: "ok" | "error" };

export async function getPing(ctrl: AbortController): Promise<AxiosResponse<Ping>> {
    return await axios.get(api('/ping'), { signal: ctrl.signal });
}
