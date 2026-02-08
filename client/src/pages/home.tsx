import { useDays, formatCurrency } from "@/hooks/use-entries";
import { DayCard } from "@/components/day-card";
import { QuickAddDialog } from "@/components/quick-add-dialog";
import { Loader2, TrendingUp, Wallet } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { data: days, isLoading, error } = useDays();

  // Calculate grand total for a nice header summary
  const grandTotal = days?.reduce((acc, day) => acc + day.totalAmount, 0) || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-destructive">
        <p>Error loading data. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header Section */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border/50 px-6 py-6 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Revenue</h1>
            <p className="text-muted-foreground font-medium mt-1">Track your daily income</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total</span>
            <div className="text-2xl font-bold text-primary font-display flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {formatCurrency(grandTotal)}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        {days && days.length > 0 ? (
          days.map((day, index) => (
            <DayCard 
              key={day.date} 
              date={day.date} 
              totalAmount={day.totalAmount} 
              index={index} 
            />
          ))
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center space-y-4"
          >
            <div className="bg-secondary/50 p-6 rounded-full">
              <Wallet className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground">No entries yet</h3>
            <p className="text-muted-foreground max-w-xs mx-auto">
              Start tracking your revenue by adding your first entry.
            </p>
          </motion.div>
        )}
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <QuickAddDialog className="shadow-2xl shadow-primary/30" />
      </div>
    </div>
  );
}
