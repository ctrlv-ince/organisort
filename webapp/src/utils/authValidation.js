const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_POLICY_MESSAGE = 'Use at least 8 characters and include at least one number or symbol.';

export const validateEmail = (email) => {
  const value = email.trim();

  if (!value) {
    return 'Email is required.';
  }

  if (!EMAIL_PATTERN.test(value)) {
    return 'Please enter a valid email address.';
  }

  return '';
};

export const validateRequiredPassword = (password) => {
  if (!password) {
    return 'Password is required.';
  }

  return '';
};

export const validatePasswordPolicy = (password) => {
  if (!password) {
    return 'Password is required.';
  }

  if (password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }

  if (!/[\d\W_]/.test(password)) {
    return 'Password must include at least one number or symbol.';
  }

  return '';
};

export const validateLoginFields = ({ email, password }) => ({
  email: validateEmail(email),
  password: validateRequiredPassword(password),
});

export const validateRegisterFields = ({ email, password, confirmPassword }) => {
  const errors = {
    email: validateEmail(email),
    password: validatePasswordPolicy(password),
    confirmPassword: '',
  };

  if (!confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.';
  } else if (password && confirmPassword && password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
};
