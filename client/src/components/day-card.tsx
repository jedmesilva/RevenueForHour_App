import { Link } from "wouter";
import { format, parseISO, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { formatCurrency } from "@/hooks/use-entries";
import { motion } from "framer-motion";

interface DayCardProps {
  date: string;
  totalAmount: number;
  index: number;
}

export function DayCard({ date, totalAmount, index }: DayCardProps) {
  const parsedDate = parseISO(date);
  
  let label = format(parsedDate, "EEEE", { locale: ptBR });
  // Capitalize first letter
  label = label.charAt(0).toUpperCase() + label.slice(1);

  if (isToday(parsedDate)) label = "Hoje";
  if (isYesterday(parsedDate)) label = "Ontem";

  const dayNumber = format(parsedDate, "d 'de' MMMM", { locale: ptBR });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/day/${date}`} className="block group">
        <Card className="p-5 flex items-center justify-between hover:border-primary/50 hover:shadow-md transition-all duration-300 rounded-2xl cursor-pointer bg-card/50 backdrop-blur-sm border-border/60">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {dayNumber}
            </span>
            <span className="text-2xl font-bold font-display text-foreground group-hover:text-primary transition-colors">
              {label}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-primary tabular-nums tracking-tight">
              {formatCurrency(totalAmount)}
            </span>
            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <ChevronRight className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
