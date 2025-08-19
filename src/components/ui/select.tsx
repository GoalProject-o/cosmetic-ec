"use client"

import * as React from "react"

interface SelectContextType {
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
}

const SelectContext = React.createContext<SelectContextType | undefined>(undefined)

interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
}

function Select({ value, onValueChange, children }: SelectProps) {
  const [open, setOpen] = React.useState(false)
  
  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  )
}

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
  children: React.ReactNode
}

function SelectTrigger({ className = "", children, ...props }: SelectTriggerProps) {
  const context = React.useContext(SelectContext)
  
  if (!context) {
    throw new Error("SelectTrigger must be used within Select")
  }

  return (
    <>
      <button
        type="button"
        className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`.trim()}
        onClick={() => context.setOpen(!context.open)}
        {...props}
      >
        {children}
        <svg
          width="15"
          height="15"
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 opacity-50"
        >
          <path
            d="m4.93179 6.05025c.20899-.20899.54758-.20899.75657 0L7.5 7.86783 9.31066 6.05025c.20899-.20899.54758-.20899.75657 0 .20899.20899.20899.54758 0 .75657l-2.13388 2.13388c-.20899.20899-.54758.20899-.75657 0L5.04836 6.80682c-.20899-.20899-.20899-.54758 0-.75657Z"
            fill="currentColor"
            fillRule="evenodd"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {context.open && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => context.setOpen(false)}
        />
      )}
    </>
  )
}

interface SelectValueProps {
  placeholder?: string
}

function SelectValue({ placeholder }: SelectValueProps) {
  const context = React.useContext(SelectContext)
  
  if (!context) {
    throw new Error("SelectValue must be used within Select")
  }

  return <span>{context.value || placeholder}</span>
}

interface SelectContentProps {
  className?: string
  children: React.ReactNode
}

function SelectContent({ className = "", children }: SelectContentProps) {
  const context = React.useContext(SelectContext)
  
  if (!context) {
    throw new Error("SelectContent must be used within Select")
  }

  if (!context.open) return null

  return (
    <div className={`absolute top-full z-50 mt-1 max-h-96 w-full overflow-hidden rounded-md border border-gray-200 bg-white text-gray-950 shadow-md ${className}`.trim()}>
      <div className="max-h-96 overflow-auto p-1">
        {children}
      </div>
    </div>
  )
}

interface SelectItemProps {
  value: string
  className?: string
  children: React.ReactNode
}

function SelectItem({ value, className = "", children }: SelectItemProps) {
  const context = React.useContext(SelectContext)
  
  if (!context) {
    throw new Error("SelectItem must be used within Select")
  }

  const isSelected = context.value === value

  const handleClick = () => {
    context.onValueChange(value)
    context.setOpen(false)
  }

  return (
    <div
      className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 ${isSelected ? 'bg-gray-100' : ''} ${className}`.trim()}
      onClick={handleClick}
    >
      {isSelected && (
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
          >
            <path
              d="m11.4669 3.72684c.26319-.26318.69073-.26318.95392 0 .26318.26319.26318.69072 0 .95391L6.33077 11.2677c-.26318.2632-.69072.2632-.95391 0L2.90685 8.79679c-.26318-.26319-.26318-.69072 0-.95391.26319-.26318.69072-.26318.95391 0l1.81836 1.81837L11.4669 3.72684Z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            />
          </svg>
        </span>
      )}
      {children}
    </div>
  )
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }