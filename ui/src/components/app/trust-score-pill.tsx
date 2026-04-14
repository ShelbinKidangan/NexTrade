import { Shield, BadgeCheck } from "lucide-react";

export function TrustScorePill({
  score,
  verified,
  size = "sm",
}: {
  score: number | null | undefined;
  verified?: boolean;
  size?: "xs" | "sm" | "md";
}) {
  const sizeClasses = {
    xs: "text-[10px] px-1.5 py-0.5 gap-0.5",
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-2.5 py-1 gap-1.5",
  }[size];
  const iconSize = { xs: "size-2.5", sm: "size-3", md: "size-3.5" }[size];

  const display = score === null || score === undefined ? "—" : score.toFixed(1);
  const tone =
    score === null || score === undefined
      ? "bg-background-secondary text-foreground-tertiary"
      : score >= 4
      ? "bg-success/10 text-success"
      : score >= 3
      ? "bg-warning/10 text-warning"
      : "bg-background-secondary text-foreground-tertiary";

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizeClasses} ${tone}`}>
      <Shield className={iconSize} />
      Trust {display}
      {verified && <BadgeCheck className={`${iconSize} text-accent ml-0.5`} />}
    </span>
  );
}
