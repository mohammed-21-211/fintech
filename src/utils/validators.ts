import { z } from 'zod';

export const signUpSchema = z
  .object({
    full_name: z.string().min(2, 'Name must be at least 2 characters').max(60),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const transactionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  amount: z
    .number({ invalid_type_error: 'Amount must be a number' })
    .positive('Amount must be greater than 0')
    .max(999_999_999, 'Amount is too large'),
  type: z.enum(['income', 'expense']),
  category_id: z.string().uuid('Invalid category').optional().nullable(),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().max(500).optional().nullable(),
});

export const budgetSchema = z.object({
  category_id: z.string().uuid('Invalid category'),
  amount: z
    .number({ invalid_type_error: 'Amount must be a number' })
    .positive('Budget must be greater than 0'),
  period: z.enum(['monthly', 'weekly', 'yearly']),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
});

export type SignUpFormData = z.infer<typeof signUpSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;
export type TransactionFormData = z.infer<typeof transactionSchema>;
export type BudgetFormData = z.infer<typeof budgetSchema>;
