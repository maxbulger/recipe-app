'use client'

import Modal from './Modal'
import Button from './Button'

interface AlertDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  buttonText?: string
}

export default function AlertDialog({
  isOpen,
  onClose,
  title,
  message,
  buttonText = 'OK'
}: AlertDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-gray-700 mb-6">{message}</p>
      <div className="flex justify-end">
        <Button onClick={onClose}>{buttonText}</Button>
      </div>
    </Modal>
  )
}
