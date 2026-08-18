const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1";

export type ApiErrorBody = {
  error?: {
    code?: string;
    message?: string;
  };
};

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(params: { status: number; code: string; message: string }) {
    super(params.message);
    this.name = "ApiError";
    this.status = params.status;
    this.code = params.code;
  }
}

export async function apiRequest<TData>(
  path: string,
  options: RequestInit = {},
): Promise<TData> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (response.status === 204) {
    return undefined as TData;
  }

  const body = (await response.json().catch(() => ({}))) as ApiErrorBody;

  if (!response.ok) {
    throw new ApiError({
      status: response.status,
      code: body.error?.code ?? "REQUEST_FAILED",
      message: body.error?.message ?? "Request failed.",
    });
  }

  return body as TData;
}
