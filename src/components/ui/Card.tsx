import React from 'react'

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export default function Card({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cn('bg-white/80 backdrop-blur rounded-2xl border border-black/5 shadow-sm overflow-hidden hover:shadow-md transition-shadow', className)}>
      {children}
    </div>
  )
}

