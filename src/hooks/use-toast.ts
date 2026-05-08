import { toast as sonnerToast } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: "default" | "destructive" | "success";
};

export function toast({ title, description, action, variant = "default" }: ToastProps) {
  const message = title || description || "";
  const options: any = {};

  if (description && title) {
    options.description = description;
  }

  if (action) {
    options.action = {
      label: action.label,
      onClick: action.onClick,
    };
  }

  switch (variant) {
    case "destructive":
      sonnerToast.error(message, options);
      break;
    case "success":
      sonnerToast.success(message, options);
      break;
    default:
      sonnerToast(message, options);
  }
}

export function useToast() {
  return { toast };
}
