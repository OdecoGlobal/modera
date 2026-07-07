// import { AxiosError } from 'axios';
import { ZodError } from 'zod';
type CustomError = {
  status?: number;
  message?: string;
  data?: {
    message?: string;
    error?: {
      message?: string;
    };
  };
};
type ApiError = {
  response?: {
    data?: {
      message?: string;
      redirectTo?: string;
    };
  };
};

export function getErrorRedirectUrl(error: unknown) {
  const apiError = error as unknown as ApiError;
  const redirectTo = apiError.response?.data?.redirectTo;
  return redirectTo;
}

export function formatError(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return String(error);
  }

  const err = error as Error;

  if (error instanceof ZodError) {
    const fieldsErrors = error.issues.map(e => e.message);
    return fieldsErrors.join('. ');
  }

  //   if (err instanceof AxiosError) {
  //     if (err.response?.data?.message) {
  //       return err.response.data.message;
  //     }
  //     if (err.message) {
  //       return err.message;
  //     }
  //     return 'An error occurred while making a request.';
  //   }

  if (typeof error === 'object') {
    const err = error as CustomError;
    if (err.data?.message) {
      return err.data.message;
    }
    if (err.data?.error?.message) {
      return err.data.error.message;
    }

    if (err.message) {
      return err.message;
    }
  }

  // Default error.message
  if (typeof err.message === 'string') {
    return err.message;
  }

  // Fallback
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}
