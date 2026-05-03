import axios from 'axios';

export function getApiErrorMessage(error: unknown, fallback = '操作失败，请稍后重试') {
  if (axios.isAxiosError<{ error?: string }>(error)) {
    return error.response?.data?.error ?? error.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
