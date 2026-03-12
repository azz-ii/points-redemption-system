/**
 * Shared password strength validation utilities.
 *
 * Rules (full strength):
 *   - Minimum 8 characters
 *   - At least one uppercase letter (A-Z)
 *   - At least one lowercase letter (a-z)
 *   - At least one digit (0-9)
 *   - At least one special character: ! @ # $ % ^ & * ( ) _ +
 */

export interface PasswordRule {
  label: string;
  test: (password: string) => boolean;
}

/** The full set of password strength rules with human-readable labels. */
export const PASSWORD_RULES: PasswordRule[] = [
  {
    label: "At least 8 characters",
    test: (p) => p.length >= 8,
  },
  {
    label: "At least one uppercase letter (A-Z)",
    test: (p) => /[A-Z]/.test(p),
  },
  {
    label: "At least one lowercase letter (a-z)",
    test: (p) => /[a-z]/.test(p),
  },
  {
    label: "At least one number (0-9)",
    test: (p) => /[0-9]/.test(p),
  },
  {
    label: "At least one special character (!@#$%^&*()_+)",
    test: (p) => /[!@#$%^&*()_+]/.test(p),
  },
];

/**
 * Returns the error message for the first failing rule, or `null` if all
 * rules pass. Suitable for form-submit validation.
 */
export function validatePasswordStrength(password: string): string | null {
  for (const rule of PASSWORD_RULES) {
    if (!rule.test(password)) {
      return rule.label.replace("At least", "Password must have at least");
    }
  }
  return null;
}

/**
 * Returns labels for every rule that the password currently fails.
 * Suitable for real-time checklist feedback while the user types.
 */
export function getPasswordStrengthErrors(password: string): string[] {
  return PASSWORD_RULES.filter((r) => !r.test(password)).map((r) => r.label);
}

/**
 * Relaxed validator — only enforces a minimum length (8 chars).
 * Used for the superadmin account-creation path where complexity is not required.
 * Returns an error message or `null` on success.
 */
export function validatePasswordMinLength(
  password: string,
  minLength = 8
): string | null {
  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters long.`;
  }
  return null;
}
