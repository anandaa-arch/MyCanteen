// Centralized Validation Schemas using Zod
import { z } from 'zod';

// Auth Schemas
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password is too long'),
});

export const signupSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Profile Schema
export const profileSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long')
    .regex(/^[a-zA-Z\s]+$/, 'Name should only contain letters and spaces'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits')
    .optional()
    .or(z.literal('')),
  dept: z
    .string()
    .min(1, 'Department is required')
    .max(50, 'Department name is too long'),
  year: z
    .string()
    .regex(/^[1-4]$/, 'Year must be between 1-4')
    .optional()
    .or(z.literal('')),
  semester: z
    .string()
    .regex(/^[1-8]$/, 'Semester must be between 1-8')
    .optional()
    .or(z.literal('')),
});

// Create User Schema (Admin)
export const createUserSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password is too long'),
  full_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long')
    .regex(/^[a-zA-Z\s]+$/, 'Name should only contain letters and spaces'),
  role: z
    .enum(['user', 'admin', 'staff'], {
      errorMap: () => ({ message: 'Please select a valid role' }),
    }),
  dept: z
    .string()
    .min(1, 'Department is required')
    .max(50, 'Department name is too long'),
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits')
    .optional()
    .or(z.literal('')),
  year: z
    .string()
    .optional(),
  semester: z
    .string()
    .optional(),
});

// Poll Response Schema
export const pollResponseSchema = z.object({
  attendance: z
    .enum(['yes', 'no'], {
      errorMap: () => ({ message: 'Please select attendance' }),
    }),
  portion: z
    .enum(['full', 'half'], {
      errorMap: () => ({ message: 'Please select portion size' }),
    }),
});

// Payment Schema
export const paymentSchema = z.object({
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Amount must be a positive number',
    }),
  payment_method: z
    .enum(['cash', 'upi', 'card', 'bank_transfer'], {
      errorMap: () => ({ message: 'Please select a payment method' }),
    }),
  notes: z
    .string()
    .max(500, 'Notes are too long')
    .optional()
    .or(z.literal('')),
});

// Inventory Item Schema
export const inventoryItemSchema = z.object({
  name: z
    .string()
    .min(1, 'Item name is required')
    .max(100, 'Item name is too long'),
  category: z
    .string()
    .min(1, 'Category is required')
    .max(50, 'Category name is too long'),
  unit: z
    .string()
    .min(1, 'Unit is required')
    .max(20, 'Unit is too long'),
  quantity: z
    .string()
    .min(1, 'Quantity is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: 'Quantity must be a non-negative number',
    }),
  min_stock_level: z
    .string()
    .min(1, 'Minimum stock level is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: 'Minimum stock level must be a non-negative number',
    }),
  price_per_unit: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: 'Price must be a non-negative number',
    })
    .optional()
    .or(z.literal('')),
});

// Expense Schema
export const expenseSchema = z.object({
  item_name: z
    .string()
    .min(1, 'Item name is required')
    .max(100, 'Item name is too long'),
  category: z
    .string()
    .min(1, 'Category is required')
    .max(50, 'Category name is too long'),
  quantity: z
    .string()
    .min(1, 'Quantity is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Quantity must be a positive number',
    }),
  unit_price: z
    .string()
    .min(1, 'Unit price is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Unit price must be a positive number',
    }),
  total_amount: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Total amount must be a positive number',
    }),
  vendor: z
    .string()
    .max(100, 'Vendor name is too long')
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .max(500, 'Description is too long')
    .optional()
    .or(z.literal('')),
});

// Sales/Revenue Schema
export const salesSchema = z.object({
  item_name: z
    .string()
    .min(1, 'Item name is required')
    .max(100, 'Item name is too long'),
  quantity: z
    .string()
    .min(1, 'Quantity is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Quantity must be a positive number',
    }),
  unit_price: z
    .string()
    .min(1, 'Unit price is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Unit price must be a positive number',
    }),
  total_amount: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Total amount must be a positive number',
    }),
  description: z
    .string()
    .max(500, 'Description is too long')
    .optional()
    .or(z.literal('')),
});

// Search/Filter Schema
export const searchFilterSchema = z.object({
  searchTerm: z
    .string()
    .max(100, 'Search term is too long')
    .optional(),
  status: z
    .enum(['all', 'active', 'inactive', 'pending', 'confirmed', 'paid', 'unpaid'], {
      errorMap: () => ({ message: 'Invalid status filter' }),
    })
    .optional(),
  dateFrom: z
    .string()
    .optional(),
  dateTo: z
    .string()
    .optional(),
});

// Menu Item Schema
export const menuItemSchema = z.object({
  name: z
    .string()
    .min(1, 'Item name is required')
    .max(100, 'Item name is too long'),
  category: z
    .enum(['breakfast', 'lunch', 'snack', 'dinner'], {
      errorMap: () => ({ message: 'Please select a category' }),
    }),
  description: z
    .string()
    .max(500, 'Description is too long')
    .optional()
    .or(z.literal('')),
  price: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Price must be a positive number',
    })
    .optional()
    .or(z.literal('')),
  available: z
    .boolean()
    .optional(),
});

// Helper function to get field error message
export const getFieldError = (errors, fieldName) => {
  const error = errors[fieldName];
  return error?.message || '';
};

// Helper function to check if field has error
export const hasFieldError = (errors, fieldName) => {
  return !!errors[fieldName];
};
