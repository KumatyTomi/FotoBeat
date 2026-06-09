export default function PremiumButton({ children, className = '', variant = 'ghost', ...props }) {
  return (
    <button className={`premium-button premium-button-${variant} ${className}`.trim()} {...props}>
      <span>{children}</span>
    </button>
  );
}
