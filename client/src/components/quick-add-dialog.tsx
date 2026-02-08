import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import { useAddEntry } from "@/hooks/use-entries";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface QuickAddDialogProps {
  defaultDate?: string; // YYYY-MM-DD
  defaultHour?: number;
  trigger?: React.ReactNode;
  className?: string;
}

export function QuickAddDialog({ defaultDate, defaultHour, trigger, className }: QuickAddDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(defaultDate || format(new Date(), "yyyy-MM-dd"));
  const [hour, setHour] = useState(defaultHour?.toString() || new Date().getHours().toString());
  
  const { mutate: addEntry, isPending } = useAddEntry();
  const { toast } = useToast();

  // Reset logic when dialog opens/closes
  useEffect(() => {
    if (open) {
      if (defaultDate) setDate(defaultDate);
      if (defaultHour !== undefined) setHour(defaultHour.toString());
      // Focus input logic can go here if we used refs
    }
  }, [open, defaultDate, defaultHour]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse amount: "10,50" -> 10.50, "10.50" -> 10.50
    const cleanAmount = amount.replace(/[^\d.,]/g, "").replace(",", ".");
    const floatAmount = parseFloat(cleanAmount);
    
    if (isNaN(floatAmount) || floatAmount <= 0) {
      toast({
        title: "Valor inválido",
        description: "Por favor, insira um número positivo válido.",
        variant: "destructive",
      });
      return;
    }

    const amountInCents = Math.round(floatAmount * 100);

    addEntry({
      date,
      hour: parseInt(hour),
      amount: amountInCents,
    }, {
      onSuccess: () => {
        setOpen(false);
        setAmount("");
        toast({
          title: "Registro adicionado",
          description: `Adicionado R$ ${floatAmount.toFixed(2)} em ${format(new Date(date), "dd/MM")}`,
        });
      },
      onError: () => {
        toast({
          title: "Erro",
          description: "Falha ao salvar o registro. Tente novamente.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button 
            size="icon" 
            className={cn(
              "h-14 w-14 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 bg-primary text-primary-foreground", 
              className
            )}
          >
            <Plus className="h-6 w-6" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-display">Adicionar Receita</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hour">Hora</Label>
              <Input
                id="hour"
                type="number"
                min="0"
                max="23"
                value={hour}
                onChange={(e) => setHour(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-lg">Valor (R$)</Label>
            <div className="flex gap-2 mb-2">
              {[10, 50, 100].map((val) => (
                <Button
                  key={val}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-lg border-primary/20 hover:border-primary hover:bg-primary/5 transition-colors"
                  onClick={() => setAmount(val.toString())}
                >
                  + R$ {val}
                </Button>
              ))}
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">R$</span>
              <Input
                id="amount"
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-12 h-14 text-2xl font-bold rounded-xl"
                autoFocus
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">Insira o valor em Reais (ex: 150,50)</p>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 text-lg rounded-xl font-semibold"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Registro"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
