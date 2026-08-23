import Button from '../ui/Button';

export default function PageLayout({
  title,
  subtitle,
  action,
  actionLabel,
  actionOnClick,
  children,
  flush = false,
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-line/40 pb-5">
        <div>
          <h2 className="mb-0 text-2xl font-bold tracking-tight text-ink">{title}</h2>
          {subtitle && (
            <p className="text-sm text-muted mt-1">{subtitle}</p>
          )}
        </div>
        {actionLabel && actionOnClick && (
          <Button appearance="primary" type="button" onClick={actionOnClick}>
            {actionLabel}
          </Button>
        )}
        {action}
      </div>
      {flush ? (
        <>{children}</>
      ) : (
        <div className="bg-white rounded-xl border border-line/50 shadow-sm">
          <div className="p-6">{children}</div>
        </div>
      )}
    </div>
  );
}
