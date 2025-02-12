// calendar.tsx - replacing the current Calendar with Material UI DateCalendar
"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar"
import { cn } from "../../lib/utils"
import dayjs from "dayjs"

export type CalendarProps = {
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  disabled?: (date: Date) => boolean
  initialFocus?: boolean
  mode?: "single" | "range" | "multiple"
  className?: string
  classNames?: Record<string, string>
  showOutsideDays?: boolean
}

function Calendar({
  className,
  selected,
  onSelect,
  disabled,
  initialFocus,
  mode = "single",
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const selectedDayjs = selected ? dayjs(selected) : null
  
  const handleDateChange = (date: dayjs.Dayjs | null) => {
    if (onSelect && date) {
      onSelect(date.toDate())
    } else if (onSelect) {
      onSelect(undefined)
    }
  }

  const shouldDisableDate = (date: dayjs.Dayjs) => {
    if (!disabled) return false
    return disabled(date.toDate())
  }

  return (
    <div className={cn("p-3 bg-white rounded-md", className)}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateCalendar
          value={selectedDayjs}
          onChange={handleDateChange}
          shouldDisableDate={shouldDisableDate}
          autoFocus={initialFocus}
          sx={{
            // Customize to match previous styling
            '& .MuiDayCalendar-header': {
              display: 'flex',
            },
            '& .MuiDayCalendar-weekDayLabel': {
              width: '36px',
              height: '36px',
              margin: '0',
              fontSize: '0.8rem',
              fontWeight: 'normal',
              color: 'var(--muted-foreground, #6c757d)',
            },
            '& .MuiPickersDay-root': {
              width: '36px',
              height: '36px',
              fontSize: '0.875rem',
              fontWeight: 'normal',
              backgroundColor: 'white',
              '&.Mui-selected': {
                backgroundColor: 'var(--primary, #3b82f6)',
                color: 'var(--primary-foreground, white)',
                '&:hover': {
                  backgroundColor: 'var(--primary, #3b82f6)',
                  color: 'var(--primary-foreground, white)',
                },
                '&:focus': {
                  backgroundColor: 'var(--primary, #3b82f6)',
                  color: 'var(--primary-foreground, white)',
                }
              },
              '&.MuiPickersDay-today': {
                backgroundColor: 'var(--accent, #f3f4f6)',
                color: 'var(--accent-foreground, #111827)',
              },
              '&.Mui-disabled': {
                color: 'var(--muted-foreground, #6c757d)',
                opacity: 0.5,
              }
            },
            '& .MuiPickersCalendarHeader-root': {
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              paddingTop: '4px',
            },
            '& .MuiPickersCalendarHeader-label': {
              fontSize: '0.875rem',
              fontWeight: 500,
              textAlign: 'center',
              flex: 1,
            },
            '& .MuiPickersArrowSwitcher-root': {
              display: 'flex',
              width: '100%',
              justifyContent: 'space-around',
              position: 'absolute',
              top: '4px',
            },
            '& .MuiPickersArrowSwitcher-button': {
              width: '28px',
              height: '28px',
              backgroundColor: 'white',
              opacity: 0.5,
              '&:hover': {
                opacity: 1,
              }
            }
          }}
          slots={{
            leftArrowIcon: () => <ChevronLeft className="h-4 w-4" />,
            rightArrowIcon: () => <ChevronRight className="h-4 w-4" />,
          }}
          {...props}
        />
      </LocalizationProvider>
    </div>
  )
}

Calendar.displayName = "Calendar"

export { Calendar }