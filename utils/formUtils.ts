export interface FormValidation {
  isValid: boolean;
  message?: string;
}

export function validateEmail(email: string): FormValidation {
  if (!email) {
    return {
      isValid: false,
      message: 'Email is required'
    };
  }

  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      message: 'Please enter a valid email address'
    };
  }

  return {
    isValid: true
  };
}

export function generateTestEmail(): string {
  const timestamp = new Date().getTime();
  return `test.user+${timestamp}@example.com`;
}

export const testData = {
  validEmails: [
    'test@example.com',
    'user.name@domain.com',
    'user+label@domain.co.uk',
    'user@subdomain.domain.com'
  ],
  invalidEmails: [
    '',
    'invalid-email',
    '@domain.com',
    'user@',
    'user@domain',
    'user@.com',
    'user@domain.',
    'user name@domain.com'
  ]
};
