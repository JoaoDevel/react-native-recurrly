type ClerkFieldErrors = Record<string, string>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | null {
  if (!email.trim()) return "Email is required.";
  if (!EMAIL_REGEX.test(email.trim())) return "Enter a valid email address.";
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "Password is required.";
  if (password.length < 8) return "Password must have at least 8 characters.";
  return null;
}

export function validateCode(code: string): string | null {
  if (!code.trim()) return "Verification code is required.";
  if (code.trim().length < 6) return "Verification code must have 6 digits.";
  return null;
}

export function toClerkFieldErrors(error: unknown): ClerkFieldErrors {
  const fallback = "Something went wrong. Please try again.";

  if (!error || typeof error !== "object") {
    return { form: fallback };
  }

  const maybeErrors = (error as { errors?: unknown[] }).errors;

  if (!Array.isArray(maybeErrors) || maybeErrors.length === 0) {
    return { form: fallback };
  }

  return maybeErrors.reduce<ClerkFieldErrors>((acc, item) => {
    const current = item as {
      message?: string;
      meta?: { paramName?: string };
      code?: string;
    };

    const key =
      current.meta?.paramName ||
      (current.code?.includes("password") ? "password" : "form");
    const message = current.message || fallback;

    acc[key] = message;
    return acc;
  }, {});
}
