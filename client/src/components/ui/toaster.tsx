import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { CheckCircle, AlertCircle, Info, AlertTriangle, Bell } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        // Get appropriate icon based on toast variant
        let Icon = Bell;
        
        if (variant === 'success') {
          Icon = CheckCircle;
        } else if (variant === 'destructive') {
          Icon = AlertCircle;
        } else if (variant === 'info') {
          Icon = Info;
        } else if (variant === 'warning') {
          Icon = AlertTriangle;
        } else if (variant === 'primary') {
          Icon = Bell;
        }

        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-1">
                <Icon 
                  className={`h-5 w-5 ${
                    variant === 'success' ? 'text-emerald-500 dark:text-emerald-400' :
                    variant === 'destructive' ? 'text-red-500 dark:text-red-400' :
                    variant === 'info' ? 'text-blue-500 dark:text-blue-400' :
                    variant === 'warning' ? 'text-amber-500 dark:text-amber-400' :
                    variant === 'primary' ? 'text-primary dark:text-primary' :
                    'text-gray-500 dark:text-gray-400'
                  }`}
                />
              </div>
              <div className="grid gap-1 flex-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
                {action && <div className="mt-2">{action}</div>}
              </div>
            </div>
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
