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

export function getErrors(msg: ErrMsg) {
  const global = msg as GlobalErr;
  if (global.detail !== undefined || global.error !== undefined || global.message !== undefined) {
      return {global: global.detail || global.error || global.message} as Record<string, string>;
  } else {
      const m = msg as Record<string, string[]>;
      return Object.keys(m).reduce((acc, k) => (acc[k] = m[k][0], acc), {} as Record<string, string>)
  }
}
