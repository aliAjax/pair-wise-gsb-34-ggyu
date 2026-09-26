import { ERROR_MESSAGES } from "../constants/errorMessages";
import { useSessionStore } from "../stores/SessionStore";

const authHeaders = () => ({ "x-role": useSessionStore.getState().role });

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path, { headers: authHeaders() });
  if (!res.ok) throw await toApiError(res);
  return (await res.json()) as T;
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body ?? {})
  });
  if (!res.ok) throw await toApiError(res);
  return (await res.json()) as T;
}

async function toApiError(res: Response): Promise<Error> {
  let code = "";
  try {
    const data = await res.json();
    code = data?.detail?.code ?? data?.code ?? "";
  } catch {
    // 非 JSON 响应时退化为状态码提示
  }
  return new Error(ERROR_MESSAGES[code] ?? `请求失败（${res.status}）`);
}
