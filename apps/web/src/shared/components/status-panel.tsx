type StatusPanelProps = {
  title: string;
  tone?: "neutral" | "success" | "danger";
  children: React.ReactNode;
};

export function StatusPanel({ title, tone = "neutral", children }: StatusPanelProps) {
  return (
    <div className={`status-panel ${tone}`}>
      <strong>{title}</strong>
      <p>{children}</p>
    </div>
  );
}
