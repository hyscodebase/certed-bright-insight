import { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  icon?: ReactNode;
  showBack?: boolean;
}

export function PageHeader({ title, icon, showBack }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="mb-6 flex items-center gap-3">
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-muted"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      {icon && <span className="text-muted-foreground">{icon}</span>}
      <h1 className="text-xl font-semibold text-foreground">{title}</h1>
    </div>
  );
}
