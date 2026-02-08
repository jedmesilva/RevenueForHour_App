import { useEffect, useMemo } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { useDayDetails, useClearDay, formatCurrency } from "@/hooks/use-entries";
import { HourRow } from "@/components/hour-row";
import { QuickAddDialog } from "@/components/quick-add-dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Trash2, Calendar, Clock, MoreVertical } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { motion } from "framer-motion";

export default function DayDetail() {
  const [match, params] = useRoute("/day/:date");
  const [, setLocation] = useLocation();
  const date = params?.date || "";

  const { data: dayDetails, isLoading, error } = useDayDetails(date);
  const { mutate: clearDay, isPending: isClearing } = useClearDay();
  const [showClearDialog, setShowClearDialog] = useState(false);

  // Generate full 0-23 hours list, merging with existing data
  const hoursData = useMemo(() => {
    const fullHours = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      totalAmount: 0,
    }));

    if (dayDetails) {
      dayDetails.forEach((detail) => {
        fullHours[detail.hour].totalAmount = detail.totalAmount;
      });
    }

    return fullHours;
  }, [dayDetails]);

  // Calculate stats
  const totalAmount = hoursData.reduce((sum, h) => sum + h.totalAmount, 0);
  const maxAmount = Math.max(...hoursData.map(h => h.totalAmount));
  const activeHours = hoursData.filter(h => h.totalAmount > 0).length;

  const formattedDate = date ? format(parseISO(date), "EEEE, d 'de' MMMM", { locale: ptBR }) : "";

  const handleClearDay = () => {
    clearDay(date, {
      onSuccess: () => {
        setLocation("/");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If 404 or error
  if (!dayDetails && !isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <h2 className="text-2xl font-bold mb-2">Dia não encontrado</h2>
        <p className="text-muted-foreground mb-6">Parece que este dia ainda não tem registros.</p>
        <Link href="/">
          <Button>Voltar para o Início</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Detailed Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-10 w-10 -ml-2 rounded-full hover:bg-secondary">
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            </Button>
          </Link>
          
          <div className="flex-1 text-center">
            <h2 className="font-semibold text-lg font-display capitalize">
              {date ? format(parseISO(date), "MMMM d", { locale: ptBR }) : "Date"}
            </h2>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 -mr-2 rounded-full hover:bg-secondary">
                <MoreVertical className="h-5 w-5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl">
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive cursor-pointer"
                onSelect={() => setShowClearDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Limpar Dia
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Total Summary Card inside Header area */}
        <div className="max-w-2xl mx-auto px-6 pb-6 pt-2">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground capitalize opacity-80 mb-1">{formattedDate}</p>
              <h1 className="text-4xl font-bold font-display text-primary tracking-tight">
                {formatCurrency(totalAmount)}
              </h1>
            </div>
            
            <div className="flex gap-4 text-sm text-muted-foreground font-medium">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary/70" />
                <span>{activeHours}h ativas</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hours List */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="space-y-1">
          {hoursData.map((data, index) => (
            <motion.div
              key={data.hour}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.02 }}
            >
              <HourRow
                date={date}
                hour={data.hour}
                amount={data.totalAmount}
                maxAmount={maxAmount}
              />
            </motion.div>
          ))}
        </div>
      </main>

      {/* Floating Action Button - Context aware, adds to active day */}
      <div className="fixed bottom-6 right-6 z-40">
        <QuickAddDialog 
          defaultDate={date} 
          className="shadow-2xl shadow-primary/30" 
        />
      </div>

      {/* Clear Day Confirmation */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso excluirá permanentemente todos os registros de receita de <strong>{formattedDate}</strong>. 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleClearDay}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
              disabled={isClearing}
            >
              {isClearing ? "Limpando..." : "Sim, Limpar Tudo"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
