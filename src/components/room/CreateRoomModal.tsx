import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useRoom } from '@/context/RoomContext';
import { AuthPrompt } from './AuthPrompt';

interface CreateRoomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 'auth' | 'choose' | 'join';

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { isAuthenticated } = useAuth();
  const { createRoom, joinRoom, isConnecting } = useRoom();
  const [step, setStep] = useState<Step>(isAuthenticated ? 'choose' : 'auth');
  const [joinRoomId, setJoinRoomId] = useState('');

  // Update step when auth status changes
  React.useEffect(() => {
    if (open) {
      setStep(isAuthenticated ? 'choose' : 'auth');
    }
  }, [isAuthenticated, open]);

  const handleCreateRoom = async () => {
    try {
      await createRoom();
      onOpenChange(false);
    } catch (e) {
      // Error handled in context usually, or we can handle here if context throws
    }
  };

  const handleJoinRoom = async () => {
    if (joinRoomId.length !== 6) {
      toast.error('Please enter a valid 6-character room ID');
      return;
    }

    try {
      await joinRoom(joinRoomId.trim().toUpperCase());
      onOpenChange(false);
    } catch (e) {
      // Error handled in context
    }
  };

  const handleClose = () => {
    if (!isConnecting) {
      onOpenChange(false);
      setTimeout(() => {
        setStep(isAuthenticated ? 'choose' : 'auth');
        setJoinRoomId('');
      }, 200);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        {step === 'auth' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">
                Multiplayer Mode
              </DialogTitle>
            </DialogHeader>
            <AuthPrompt onBack={handleClose} />
          </>
        )}
        {step === 'choose' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">
                Multiplayer Mode
              </DialogTitle>
              <DialogDescription className="text-center text-muted-foreground">
                Race against your friends in real-time
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 mt-6">
              <Button
                onClick={handleCreateRoom}
                variant="default"
                size="lg"
                className="h-16 text-lg gap-3"
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Users className="w-5 h-5" />
                )}
                {isConnecting ? "Creating..." : "Create Room"}
              </Button>

              <Button
                onClick={() => setStep('join')}
                variant="secondary"
                size="lg"
                className="h-16 text-lg gap-3"
                disabled={isConnecting}
              >
                <ArrowRight className="w-5 h-5" />
                Join Room
              </Button>
            </div>
          </>
        )}

        {step === 'join' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">
                Join a Room
              </DialogTitle>
              <DialogDescription className="text-center text-muted-foreground">
                Enter the room ID shared by your friend
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="roomId">Room ID</Label>
                <Input
                  id="roomId"
                  placeholder="ABC123"
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value.toUpperCase().trim().slice(0, 6))}
                  className="text-center text-2xl font-mono tracking-widest h-14"
                  maxLength={6}
                  disabled={isConnecting}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep('choose')}
                  variant="ghost"
                  className="flex-1"
                  disabled={isConnecting}
                >
                  Back
                </Button>
                <Button
                  onClick={handleJoinRoom}
                  variant="default"
                  className="flex-1"
                  disabled={joinRoomId.length !== 6 || isConnecting}
                >
                  {isConnecting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {isConnecting ? "Joining..." : "Join"}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};