export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'E-posta adresi gereklidir';
  if (!emailRegex.test(email)) return 'Geçerli bir e-posta adresi giriniz';
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return 'Şifre gereklidir';
  if (password.length < 8) return 'Şifre en az 8 karakter olmalıdır';
  if (!/[A-Z]/.test(password)) return 'Şifre en az bir büyük harf içermelidir';
  if (!/[a-z]/.test(password)) return 'Şifre en az bir küçük harf içermelidir';
  if (!/[0-9]/.test(password)) return 'Şifre en az bir rakam içermelidir';
  if (!/[!@#$%^&*]/.test(password)) return 'Şifre en az bir özel karakter içermelidir (!@#$%^&*)';
  return null;
};

export const validateName = (name: string): string | null => {
  if (!name) return 'İsim gereklidir';
  if (name.length < 2) return 'İsim en az 2 karakter olmalıdır';
  if (!/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/.test(name)) return 'İsim sadece harflerden oluşmalıdır';
  return null;
};

export const validatePasswordMatch = (password: string, password2: string): string | null => {
  if (!password2) return 'Şifre tekrarı gereklidir';
  if (password !== password2) return 'Şifreler eşleşmiyor';
  return null;
};

export interface ValidationErrors {
  [key: string]: string;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const validateRegisterForm = (data: RegisterFormData): ValidationErrors => {
  const errors: ValidationErrors = {};

  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(data.password);
  if (passwordError) errors.password = passwordError;

  const passwordMatchError = validatePasswordMatch(data.password, data.confirmPassword);
  if (passwordMatchError) errors.confirmPassword = passwordMatchError;

  const firstNameError = validateName(data.firstName);
  if (firstNameError) errors.firstName = firstNameError;

  const lastNameError = validateName(data.lastName);
  if (lastNameError) errors.lastName = lastNameError;

  return errors;
};

export const validateLoginForm = (data: {
  email: string;
  password: string;
}): ValidationErrors => {
  const errors: ValidationErrors = {};

  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;

  if (!data.password) errors.password = 'Şifre gereklidir';

  return errors;
}; 