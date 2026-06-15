import type { PropsWithChildren } from "react";

type SectionCardProps = PropsWithChildren<{
  title: string;
  description: string;
}>;

export function SectionCard({ title, description, children }: SectionCardProps) {
  return (
    <section className="card">
      <div className="card-header">
        <div>
          <p className="card-kicker">Module</p>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
