import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/contractErrors'

export function useToast() {
  return {
    success: (message: string) => toast.success(message),
    error: (error: unknown) => toast.error(getErrorMessage(error)),
    info: (message: string) => toast.info(message)
  }
}
