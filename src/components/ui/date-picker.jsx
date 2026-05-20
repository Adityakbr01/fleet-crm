import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DatePicker({ date, setDate, className, hasError }) {
  // Try to parse the passed date string (YYYY-MM-DD format usually)
  let parsedDate = undefined;
  if (date) {
    const d = new Date(date);
    if (!isNaN(d.getTime())) {
      parsedDate = d;
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal h-10 px-3 text-xs border-slate-200 focus:ring-slate-100",
            !parsedDate && "text-muted-foreground",
            hasError && "border-rose-500 focus:border-rose-500 focus:ring-rose-100",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {parsedDate ? format(parsedDate, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={parsedDate}
          onSelect={(d) => {
            if (d) {
              // Convert date object to YYYY-MM-DD string to align with native input
              const isoStr = format(d, "yyyy-MM-dd");
              setDate(isoStr);
            } else {
              setDate("");
            }
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
