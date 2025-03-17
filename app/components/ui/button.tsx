import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "~/utils/classes"

const buttonVariants = cva(
  "cursor-pointer inline-flex items-center justify-center shadow-sm whitespace-nowrap rounded-xs font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      size: {
        default: "px-4 py-2",
        sm: "rounded-xs text-sm py-1 px-3",
        lg: "rounded-xs text-lg py-2 px-8",
        icon: "size-10",
      },
      icon: {
        left: "gap-2 pl-3",
        right: "gap-2 pr-3",
      },
      variant: {
        default:
          "bg-primary-700 text-primary-50 hover:bg-primary-700/90 dark:bg-primary-300 dark:text-primary-950 dark:hover:bg-primary-300/80",
        destructive:
          "bg-red-500 text-zinc-50 hover:bg-red-500/90 dark:bg-red-900 dark:text-zinc-50 dark:hover:bg-red-900/90",
        outline:
          "border border-primary-400 bg-transparent text-primary-700 hover:bg-primary-100 hover:text-primary-900 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
        secondary:
          "shadow-none bg-zinc-300 text-zinc-950 hover:bg-zinc-400/50 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700/70",
        ghost:
          "shadow-none hover:bg-primary-100 hover:text-primary-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
        link: "shadow-none p-0 text-accent-600 underline-offset-4 hover:underline dark:text-accent-400",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, icon, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, icon, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
