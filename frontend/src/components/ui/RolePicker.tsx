import * as React from 'react'
import { Recycle, Truck, Factory } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Role } from '@/api/types'

interface RoleOption {
  role: Role
  icon: React.ReactNode
  title: string
  description: string
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: Role.Recycler,
    icon: <Recycle className="h-8 w-8" />,
    title: 'Recycler',
    description: 'Submit and track waste materials for recycling',
  },
  {
    role: Role.Collector,
    icon: <Truck className="h-8 w-8" />,
    title: 'Collector',
    description: 'Collect and transfer waste between participants',
  },
  {
    role: Role.Manufacturer,
    icon: <Factory className="h-8 w-8" />,
    title: 'Manufacturer',
    description: 'Set incentives and confirm recycled materials',
  },
]

export interface RolePickerProps {
  value?: Role
  onChange: (role: Role) => void
  className?: string
}

export function RolePicker({ value, onChange, className }: RolePickerProps) {
  return (
    <div
      className={cn('grid gap-4 sm:grid-cols-3', className)}
      role="radiogroup"
      aria-label="Select your role"
    >
      {ROLE_OPTIONS.map((option) => {
        const selected = value === option.role
        return (
          <button
            key={option.role}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.role)}
            onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onChange(option.role)
              }
            }}
            className={cn(
              'flex flex-col items-center gap-3 rounded-lg border p-6 text-center transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'hover:border-primary/60 hover:bg-accent',
              selected
                ? 'border-primary bg-primary/5 ring-2 ring-primary ring-offset-2'
                : 'border-border bg-card'
            )}
          >
            <span
              className={cn(
                'rounded-full p-3',
                selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}
            >
              {option.icon}
            </span>
            <span className="font-semibold">{option.title}</span>
            <span className="text-sm text-muted-foreground">{option.description}</span>
          </button>
        )
      })}
    </div>
  )
}
