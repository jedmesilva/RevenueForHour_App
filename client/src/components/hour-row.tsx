import { motion } from "framer-motion";
import { formatCurrency } from "@/hooks/use-entries";
import { cn } from "@/lib/utils";
import { QuickAddDialog } from "./quick-add-dialog";

interface HourRowProps {
  date: string;
  hour: number;
  amount: number;
  maxAmount: number;
}

export function HourRow({ date, hour, amount, maxAmount }: HourRowProps) {
  // Calculate percentage relative to the MAX amount of the day for visual scaling
  // Min width 0% (but we might want a tiny visible bar if it's 0 to look consistent, let's keep it clean at 0)
  const percentage = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
  
  // Is this row "active" (has money)?
  const hasMoney = amount > 0;
  
  return (
    <div className="group relative py-2">
      <div className="flex items-center gap-4 relative z-10">
        {/* Time Label */}
        <div className={cn(
          "w-12 text-sm font-medium text-right transition-colors",
          hasMoney ? "text-foreground font-bold" : "text-muted-foreground/50"
        )}>
          {hour.toString().padStart(2, '0')}:00
        </div>

        {/* Bar & Amount Container */}
        <div className="flex-1 relative h-10 flex items-center">
          {/* Background Track (Subtle) */}
          <div className="absolute inset-0 bg-secondary/30 rounded-lg -z-20 w-full" />

          {/* Growing Bar */}
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={cn(
              "absolute left-0 top-0 bottom-0 rounded-lg -z-10 transition-colors",
              hasMoney ? "bg-primary/20 group-hover:bg-primary/30" : "bg-transparent"
            )}
          />

          {/* Interactive Trigger for Editing - Covers the whole bar area */}
          <QuickAddDialog 
            defaultDate={date} 
            defaultHour={hour} 
            trigger={
              <button className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" aria-label={`Edit ${hour}:00`} />
            }
          />
          
          {/* Amount Label - Positioned slightly offset based on bar width or fixed? 
              Let's keep it fixed left padding for readability, but bold if present.
          */}
          <span className={cn(
            "pl-3 text-sm font-medium transition-colors pointer-events-none tabular-nums",
            hasMoney ? "text-primary-foreground font-bold mix-blend-multiply dark:mix-blend-normal dark:text-primary-foreground" : "text-muted-foreground/30"
          )}>
            {hasMoney ? formatCurrency(amount) : "-"}
          </span>
        </div>
      </div>
    </div>
  );
}
