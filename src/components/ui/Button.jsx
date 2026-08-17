import React from 'react';

/**
 * A reusable Button component with premium Tailwind styling.
 * 
 * @param {string} appearance - "primary" | "default" | "subtle" | "ghost" | "link"
 * @param {string} color - "red" | "blue" etc (overrides appearance primary/ghost colors)
 * @param {string} size - "lg" | "md" | "sm" | "xs"
 * @param {boolean} block - whether to render a block level button
 * @param {boolean} disabled - whether the button is disabled
 * @param {boolean} loading - whether the button shows a loading spinner
 * @param {ReactNode} startIcon - an icon to display before the text
 * @param {ReactNode} endIcon - an icon to display after the text
 * @param {ReactNode} children - the button text or contents
 */
const Button = React.forwardRef(({ 
  appearance = 'primary', 
  color,
  size = 'md', 
  block = false,
  disabled = false,
  loading = false,
  startIcon,
  endIcon,
  className = '',
  children, 
  ...rest 
}, ref) => {
  
  // Base styles
  let btnClasses = "inline-flex items-center justify-center font-medium transition-all duration-200 !rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed ";

  // Sizes
  if (size === 'lg') btnClasses += "px-6 py-3 text-base ";
  else if (size === 'sm') btnClasses += "px-4 py-1.5 text-sm ";
  else if (size === 'xs') btnClasses += "px-3 py-1 text-xs ";
  else btnClasses += "px-5 py-2.5 text-sm "; // md

  // Block
  if (block) btnClasses += "w-full ";

  // Appearances & Colors
  if (appearance === 'primary') {
    if (color === 'red') {
      btnClasses += "!bg-red-500 hover:!bg-red-600 !text-white !shadow-md shadow-red-500/20 focus:!ring-red-500 ";
    } else {
      // Default primary blue
      btnClasses += "!bg-blue-600 hover:!bg-blue-700 !text-white !shadow-md shadow-blue-600/20 focus:!ring-blue-600 ";
    }
  } else if (appearance === 'ghost' || appearance === 'default') {
    if (color === 'red') {
      btnClasses += "!border-2 !border-red-500 !text-red-600 hover:!bg-red-50 focus:!ring-red-500 !bg-white ";
    } else if (color === 'blue') {
      btnClasses += "!border-2 !border-blue-500 !text-blue-600 hover:!bg-blue-50 focus:!ring-blue-500 !bg-white ";
    } else {
      btnClasses += "!border !border-gray-200 !text-gray-700 hover:!bg-gray-50 hover:!border-gray-300 focus:!ring-gray-200 !shadow-sm !bg-white ";
    }
  } else if (appearance === 'subtle') {
    btnClasses += "!bg-slate-100 !text-slate-700 hover:!bg-slate-200 focus:!ring-slate-200 ";
  } else if (appearance === 'link') {
    btnClasses += "!text-blue-600 hover:!text-blue-800 underline-offset-2 hover:underline focus:!ring-blue-500 p-0 ";
  }

  // Combine custom classes
  btnClasses += className;

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={btnClasses}
      {...rest}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!loading && startIcon && <span className="mr-2 inline-flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="ml-2 inline-flex items-center">{endIcon}</span>}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
