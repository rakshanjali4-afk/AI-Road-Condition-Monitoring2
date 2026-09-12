import { AlertCircle, X } from "lucide-react";

export default function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-danger-500/10 border border-danger-500/30 animate-fade-in">
      <AlertCircle className="w-5 h-5 text-danger-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm text-danger-400 font-medium">{message}</p>
      </div>
    </div>
  );
}
