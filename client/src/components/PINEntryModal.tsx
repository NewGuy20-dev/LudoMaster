import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home, AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PINEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameId: string;
  userId: number;
}

export function PINEntryModal({ isOpen, onClose, gameId, userId }: PINEntryModalProps) {
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleEscape = async () => {
    if (!pin || pin.length !== 6) {
      toast({
        title: "Invalid PIN",
        description: "Please enter a 6-digit PIN",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await apiRequest('POST', `/api/games/${gameId}/escape`, {
        userId,
        pin
      });

      toast({
        title: "Escape Successful",
        description: "You have successfully escaped Death Mode!",
        variant: "default",
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Escape Failed",
        description: "Invalid PIN or escape not allowed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-game-secondary border-game-accent max-w-md">
        <DialogHeader>
          <div className="text-center mb-6">
            <Home className="text-game-accent text-4xl mb-4 mx-auto" />
            <DialogTitle className="text-2xl font-bold text-game-accent">
              THE HOUSE
            </DialogTitle>
            <p className="text-gray-400 mt-2">Enter your Account PIN to escape</p>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="pin" className="block text-sm font-medium text-gray-400 mb-2">
              Account PIN
            </Label>
            <Input
              id="pin"
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={6}
              className="bg-game-primary border-gray-600 text-white"
              placeholder="Enter PIN"
            />
          </div>
          
          <div className="flex space-x-4">
            <Button
              onClick={handleEscape}
              disabled={isLoading}
              className="flex-1 bg-game-accent hover:bg-red-700"
            >
              {isLoading ? 'ESCAPING...' : 'ESCAPE'}
            </Button>
            <Button
              onClick={onClose}
              variant="secondary"
              className="flex-1 bg-gray-700 hover:bg-gray-600"
            >
              Cancel
            </Button>
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            <AlertTriangle className="inline mr-1 h-3 w-3" />
            Warning: Only the PIN enterer can exit the game
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
