// Reusable Form Components with React Hook Form integration
import { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

// Text Input with validation
export const FormInput = forwardRef(({ 
  label, 
  error, 
  type = 'text',
  placeholder,
  required,
  className = '',
  ...props 
}, ref) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
          error 
            ? 'border-red-500 focus:ring-red-500 bg-red-50' 
            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
        } ${className}`}
        {...props}
      />
      {error && (
        <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
});

FormInput.displayName = 'FormInput';

// Select Input with validation
export const FormSelect = forwardRef(({ 
  label, 
  error, 
  options = [],
  placeholder,
  required,
  className = '',
  ...props 
}, ref) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        ref={ref}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
          error 
            ? 'border-red-500 focus:ring-red-500 bg-red-50' 
            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
        } ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map((option) => (
          <option 
            key={typeof option === 'string' ? option : option.value} 
            value={typeof option === 'string' ? option : option.value}
          >
            {typeof option === 'string' ? option : option.label}
          </option>
        ))}
      </select>
      {error && (
        <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
});

FormSelect.displayName = 'FormSelect';

// Textarea with validation
export const FormTextarea = forwardRef(({ 
  label, 
  error, 
  placeholder,
  required,
  rows = 3,
  className = '',
  ...props 
}, ref) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none ${
          error 
            ? 'border-red-500 focus:ring-red-500 bg-red-50' 
            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
        } ${className}`}
        {...props}
      />
      {error && (
        <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
});

FormTextarea.displayName = 'FormTextarea';

// Radio Group with validation
export const FormRadioGroup = forwardRef(({ 
  label, 
  error, 
  options = [],
  required,
  className = '',
  ...props 
}, ref) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className={`flex flex-col gap-2 ${className}`}>
        {options.map((option) => (
          <label 
            key={typeof option === 'string' ? option : option.value}
            className="flex items-center gap-2 cursor-pointer"
          >
            <input
              ref={ref}
              type="radio"
              value={typeof option === 'string' ? option : option.value}
              className="accent-blue-600 w-4 h-4"
              {...props}
            />
            <span className="text-gray-700">
              {typeof option === 'string' ? option : option.label}
            </span>
          </label>
        ))}
      </div>
      {error && (
        <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
});

FormRadioGroup.displayName = 'FormRadioGroup';

// Checkbox with validation
export const FormCheckbox = forwardRef(({ 
  label, 
  error, 
  required,
  className = '',
  ...props 
}, ref) => {
  return (
    <div className="space-y-1">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          ref={ref}
          type="checkbox"
          className={`accent-blue-600 w-4 h-4 ${className}`}
          {...props}
        />
        <span className="text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </span>
      </label>
      {error && (
        <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
});

FormCheckbox.displayName = 'FormCheckbox';

// Submit Button
export const FormSubmitButton = ({ 
  children, 
  loading, 
  disabled,
  className = '',
  ...props 
}) => {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className={`w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 ${className}`}
      {...props}
    >
      {loading && (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      )}
      {children}
    </button>
  );
};

// Form Error Summary
export const FormErrorSummary = ({ errors }) => {
  const errorMessages = Object.values(errors).map(error => error.message).filter(Boolean);
  
  if (errorMessages.length === 0) return null;
  
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start gap-2">
        <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-red-800 font-semibold mb-2">Please fix the following errors:</h3>
          <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
            {errorMessages.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
