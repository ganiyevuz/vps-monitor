interface VPSStatusBadgeProps {
  status: string;
}

export function VPSStatusBadge({ status }: VPSStatusBadgeProps) {
  const statusVariant = {
    running: 'badge-success',
    stopped: 'badge-danger',
    error: 'badge-warning',
  }[status.toLowerCase()] || 'badge-info';

  return (
    <span className={`${statusVariant}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
