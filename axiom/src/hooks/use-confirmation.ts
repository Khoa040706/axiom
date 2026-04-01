import { useState, useCallback, useRef } from "react"

interface UseConfirmationReturn {
  isOpen: boolean
  confirm: (options?: { title?: string; message?: string }) => Promise<boolean>
  handleConfirm: () => void
  handleCancel: () => void
  title: string
  message: string
}

/**
 * Hook để xử lý confirm dialog (xóa, duyệt, v.v.)
 */
export function useConfirmation(): UseConfirmationReturn {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState("Xác nhận")
  const [message, setMessage] = useState("Bạn có chắc chắn muốn thực hiện thao tác này?")
  const resolverRef = useRef<((value: boolean) => void) | null>(null)

  const confirm = useCallback(
    (options?: { title?: string; message?: string }): Promise<boolean> => {
      if (options?.title) setTitle(options.title)
      if (options?.message) setMessage(options.message)
      setIsOpen(true)

      return new Promise((resolve) => {
        resolverRef.current = resolve
      })
    },
    []
  )

  const handleConfirm = useCallback(() => {
    setIsOpen(false)
    resolverRef.current?.(true)
    resolverRef.current = null
  }, [])

  const handleCancel = useCallback(() => {
    setIsOpen(false)
    resolverRef.current?.(false)
    resolverRef.current = null
  }, [])

  return { isOpen, confirm, handleConfirm, handleCancel, title, message }
}
