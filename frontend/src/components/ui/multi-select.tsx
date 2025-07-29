import * as React from "react"
import { Check, ChevronDown, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

export interface Option {
  label: string
  value: string
}

interface MultiSelectProps {
  options: Option[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  className?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (option: Option) => {
    if (selected.includes(option.value)) {
      onChange(selected.filter((item) => item !== option.value))
    } else {
      onChange([...selected, option.value])
    }
  }

  const handleRemove = (value: string, e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    onChange(selected.filter((item) => item !== value))
  }

  const selectedOptions = options.filter((option) =>
    selected.includes(option.value)
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "justify-between h-12 px-3 py-2 min-h-[3rem] w-full bg-white/90 border-orange-200 rounded-2xl hover:bg-white transition-colors shadow-sm text-gray-900",
            className
          )}
        >
          <div className="flex gap-1 flex-1 min-w-0 overflow-x-auto scrollbar-hide">
            {selectedOptions.length > 0 ? (
              selectedOptions.map((option) => (
                <Badge
                  key={option.value}
                  variant="secondary"
                  className="bg-orange-100 text-orange-800 hover:bg-orange-200 rounded-lg whitespace-nowrap flex-shrink-0"
                >
                  {option.label}
                  <button
                    className="ml-1 ring-offset-background rounded-full outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleRemove(option.value)
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onClick={(e) => handleRemove(option.value, e)}
                  >
                    <X className="h-3 w-3 text-orange-600 hover:text-orange-800" />
                  </button>
                </Badge>
              ))
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-2 bg-white border-orange-200 rounded-xl" align="start">
        <div className="max-h-60 overflow-auto space-y-1">
          {options.map((option) => (
            <div
              key={option.value}
              className={cn(
                "relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2.5 text-sm text-gray-900 hover:bg-orange-50 transition-colors",
                selected.includes(option.value) && "bg-orange-100"
              )}
              onClick={() => handleSelect(option)}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4 text-orange-600",
                  selected.includes(option.value) ? "opacity-100" : "opacity-0"
                )}
              />
              {option.label}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}