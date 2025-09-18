import Link from 'next/link'
import React from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

const base = 'inline-flex items-center justify-center font-medium rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-400 disabled:opacity-50 disabled:pointer-events-none'

const variants: Record<Variant, string> = {
  primary: 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white hover:from-indigo-700 hover:to-cyan-700 shadow-sm',
  secondary: 'bg-gray-500 text-white hover:bg-gray-600',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-400',
  ghost: 'bg-transparent text-indigo-700 hover:text-indigo-900'
}

const sizes: Record<Size, string> = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-5 py-3',
  lg: 'px-6 py-3 text-lg'
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string
  variant?: Variant
  size?: Size
}

export default function Button({ href, variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  const classes = cn(base, variants[variant], sizes[size], className)
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}

