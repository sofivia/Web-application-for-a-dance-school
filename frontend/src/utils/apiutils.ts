export type SpecificErr = {
    response?: {
        data?: Record<string, string[]>
    };
};

export type GlobalErr = {
  detail?: string;
  error?: string;
  message?: string;
};

export type ErrMsg = Record<string, string[]> | GlobalErr;

export async function handlePost<T>(call: () => Promise<T>) {
  let message;
  try {
      await call();
  } catch (err: unknown) {
      if (typeof err === "object" && err !== null) {
          message = (err as SpecificErr)?.response?.data;
          if (message === undefined)
            message = (err as GlobalErr);
          if (message === undefined)
            throw Error("Expected SpecificErr or GlobalErr.");
      } 
  }
  return message;
}

export async function handlePost2<T>(call: () => Promise<T>) {
  let message;
  try {
      await call();
  } catch (err: unknown) {
      if (typeof err === "object" && err !== null) {
          message = (err as SpecificErr)?.response?.data;
          if (message === undefined)
            message = (err as GlobalErr);
          if (message === undefined)
            throw Error("Expected SpecificErr or GlobalErr.");
          throw message;
      } 
  }
  return message;
}

export function getErrors(msg: ErrMsg) {
  const global = msg as GlobalErr;
  if (global.detail !== undefined || global.error !== undefined || global.message !== undefined) {
      return {global: global.detail || global.error || global.message} as Record<string, string>;
  } else {
      const out = {} as Record<string, string>;
      const dfs = (obj: Record<string, any>) => {
        for (const [key, val] of Object.entries(obj)) {
          if (typeof val === 'object' && val !== null && !Array.isArray(val))
            dfs(val);
          else
            out[key] = val;
        }
      };
      dfs(msg as Record<string, any>);
      return Object.keys(out).reduce((acc, k) => (acc[k] = out[k][0], acc), {} as Record<string, string>)
  }
}
