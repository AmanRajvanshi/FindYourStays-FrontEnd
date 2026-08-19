import React from 'react';
import { Button as RsButton } from 'rsuite';

/**
 * A reusable Button component with modern Tailwind styling, backed by RSuite's native Button.
 *
 * @param {string} appearance - "primary" | "default" | "subtle" | "ghost" | "link"
 * @param {string} variant - alias for `appearance` (kept for backwards compatibility)
 * @param {string} color - RSuite colors: "red" | "orange" | "yellow" | "green" | "cyan" | "blue" | "violet"
 * @param {string} size - "lg" | "md" | "sm" | "xs"
 * @param {boolean} block - whether to render a block level button
 * @param {boolean} disabled - whether the button is disabled
 * @param {boolean} loading - whether the button shows a loading spinner
 * @param {ReactNode} startIcon - an icon to display before the text
 * @param {ReactNode} endIcon - an icon to display after the text
 * @param {ReactNode} children - the button text or contents
 */
const Button = React.forwardRef(({
  appearance,
  variant,
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

  const resolvedAppearance = variant || appearance || 'primary';

  // Map custom colors if necessary, defaulting to violet for brand consistency on solid/ghost elements
  let resolvedColor = color;
  if (!resolvedColor && (resolvedAppearance === 'primary' || resolvedAppearance === 'ghost')) {
    resolvedColor = 'violet';
  }

  return (
    <RsButton
      ref={ref}
      appearance={resolvedAppearance}
      color={resolvedColor}
      size={size}
      block={block}
      disabled={disabled || loading}
      loading={loading}
      className={className}
      {...rest}
    >
      {!loading && startIcon && <span className="mr-2 inline-flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="ml-2 inline-flex items-center">{endIcon}</span>}
    </RsButton>
  );
});

Button.displayName = 'Button';

export default Button;
