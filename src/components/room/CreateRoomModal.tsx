// import React, { useState } from 'react';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from '@/components/ui/dialog';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { generateRoomId } from '@/data/wordList';
// import { Copy, Check, Users, ArrowRight } from 'lucide-react';
// import { toast } from 'sonner';
// import { cn } from '@/lib/utils';

// interface CreateRoomModalProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
// }

// type Step = 'choose' | 'create' | 'join' | 'waiting';

// export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
//   open,
//   onOpenChange,
// }) => {
//   const [step, setStep] = useState<Step>('choose');
//   const [roomId, setRoomId] = useState('');
//   const [joinRoomId, setJoinRoomId] = useState('');
//   const [copied, setCopied] = useState(false);

//   const handleCreateRoom = () => {
//     const newRoomId = generateRoomId();
//     setRoomId(newRoomId);
//     setStep('waiting');
//   };

//   const handleCopyRoomId = async () => {
//     await navigator.clipboard.writeText(roomId);
//     setCopied(true);
//     toast.success('Room ID copied to clipboard!');
//     setTimeout(() => setCopied(false), 2000);
//   };

//   const handleJoinRoom = () => {
//     if (joinRoomId.length === 6) {
//       setRoomId(joinRoomId.toUpperCase());
//       setStep('waiting');
//       toast.success('Joining room...');
//     } else {
//       toast.error('Please enter a valid 6-character room ID');
//     }
//   };

//   const handleClose = () => {
//     onOpenChange(false);
//     setTimeout(() => {
//       setStep('choose');
//       setRoomId('');
//       setJoinRoomId('');
//     }, 200);
//   };

//   return (
//     <Dialog open={open} onOpenChange={handleClose}>
//       <DialogContent className="sm:max-w-md bg-card border-border">
//         {step === 'choose' && (
//           <>
//             <DialogHeader>
//               <DialogTitle className="text-2xl font-bold text-center">
//                 Multiplayer Mode
//               </DialogTitle>
//               <DialogDescription className="text-center text-muted-foreground">
//                 Race against your friends in real-time
//               </DialogDescription>
//             </DialogHeader>
            
//             <div className="flex flex-col gap-4 mt-6">
//               <Button
//                 onClick={handleCreateRoom}
//                 variant="default"
//                 size="lg"
//                 className="h-16 text-lg gap-3"
//               >
//                 <Users className="w-5 h-5" />
//                 Create Room
//               </Button>
              
//               <Button
//                 onClick={() => setStep('join')}
//                 variant="secondary"
//                 size="lg"
//                 className="h-16 text-lg gap-3"
//               >
//                 <ArrowRight className="w-5 h-5" />
//                 Join Room
//               </Button>
//             </div>
//           </>
//         )}

//         {step === 'join' && (
//           <>
//             <DialogHeader>
//               <DialogTitle className="text-2xl font-bold text-center">
//                 Join a Room
//               </DialogTitle>
//               <DialogDescription className="text-center text-muted-foreground">
//                 Enter the room ID shared by your friend
//               </DialogDescription>
//             </DialogHeader>
            
//             <div className="flex flex-col gap-4 mt-6">
//               <div className="space-y-2">
//                 <Label htmlFor="roomId">Room ID</Label>
//                 <Input
//                   id="roomId"
//                   placeholder="ABC123"
//                   value={joinRoomId}
//                   onChange={(e) => setJoinRoomId(e.target.value.toUpperCase().slice(0, 6))}
//                   className="text-center text-2xl font-mono tracking-widest h-14"
//                   maxLength={6}
//                 />
//               </div>
              
//               <div className="flex gap-3">
//                 <Button
//                   onClick={() => setStep('choose')}
//                   variant="ghost"
//                   className="flex-1"
//                 >
//                   Back
//                 </Button>
//                 <Button
//                   onClick={handleJoinRoom}
//                   variant="default"
//                   className="flex-1"
//                   disabled={joinRoomId.length !== 6}
//                 >
//                   Join
//                 </Button>
//               </div>
//             </div>
//           </>
//         )}

//         {step === 'waiting' && (
//           <>
//             <DialogHeader>
//               <DialogTitle className="text-2xl font-bold text-center">
//                 Room Created!
//               </DialogTitle>
//               <DialogDescription className="text-center text-muted-foreground">
//                 Share this code with your friend
//               </DialogDescription>
//             </DialogHeader>
            
//             <div className="flex flex-col items-center gap-6 mt-6">
//               <div className="flex items-center gap-3">
//                 <div className="text-4xl font-mono font-bold tracking-widest text-primary">
//                   {roomId}
//                 </div>
//                 <Button
//                   onClick={handleCopyRoomId}
//                   variant="ghost"
//                   size="icon"
//                   className={cn(
//                     "transition-colors",
//                     copied && "text-success"
//                   )}
//                 >
//                   {copied ? (
//                     <Check className="w-5 h-5" />
//                   ) : (
//                     <Copy className="w-5 h-5" />
//                   )}
//                 </Button>
//               </div>
              
//               <div className="flex items-center gap-2 text-muted-foreground">
//                 <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
//                 <span>Waiting for opponent...</span>
//               </div>
              
//               <p className="text-sm text-muted-foreground text-center">
//                 The game will start automatically when your friend joins.
//               </p>
              
//               <Button
//                 onClick={handleClose}
//                 variant="ghost"
//               >
//                 Cancel
//               </Button>
//             </div>
//           </>
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// };

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
import { generateRoomId } from '@/data/wordList';
import { Copy, Check, Users, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context';
import { AuthPrompt } from './AuthPrompt';

interface CreateRoomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 'auth' | 'choose' | 'create' | 'join' | 'waiting';

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { isAuthenticated } = useAuth();
  const [step, setStep] = useState<Step>(isAuthenticated ? 'choose' : 'auth');
  const [roomId, setRoomId] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [copied, setCopied] = useState(false);

  // Update step when auth status changes
  React.useEffect(() => {
    if (open) {
      setStep(isAuthenticated ? 'choose' : 'auth');
    }
  }, [isAuthenticated, open]);

  const handleCreateRoom = () => {
    const newRoomId = generateRoomId();
    setRoomId(newRoomId);
    setStep('waiting');
  };

  const handleCopyRoomId = async () => {
    await navigator.clipboard.writeText(roomId);
    setCopied(true);
    toast.success('Room ID copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinRoom = () => {
    if (joinRoomId.length === 6) {
      setRoomId(joinRoomId.toUpperCase());
      setStep('waiting');
      toast.success('Joining room...');
    } else {
      toast.error('Please enter a valid 6-character room ID');
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep(isAuthenticated ? 'choose' : 'auth');
      setRoomId('');
      setJoinRoomId('');
    }, 200);
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
              >
                <Users className="w-5 h-5" />
                Create Room
              </Button>
              
              <Button
                onClick={() => setStep('join')}
                variant="secondary"
                size="lg"
                className="h-16 text-lg gap-3"
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
                  onChange={(e) => setJoinRoomId(e.target.value.toUpperCase().slice(0, 6))}
                  className="text-center text-2xl font-mono tracking-widest h-14"
                  maxLength={6}
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => setStep('choose')}
                  variant="ghost"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleJoinRoom}
                  variant="default"
                  className="flex-1"
                  disabled={joinRoomId.length !== 6}
                >
                  Join
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 'waiting' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">
                Room Created!
              </DialogTitle>
              <DialogDescription className="text-center text-muted-foreground">
                Share this code with your friend
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex flex-col items-center gap-6 mt-6">
              <div className="flex items-center gap-3">
                <div className="text-4xl font-mono font-bold tracking-widest text-primary">
                  {roomId}
                </div>
                <Button
                  onClick={handleCopyRoomId}
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "transition-colors",
                    copied && "text-success"
                  )}
                >
                  {copied ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </Button>
              </div>
              
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span>Waiting for opponent...</span>
              </div>
              
              <p className="text-sm text-muted-foreground text-center">
                The game will start automatically when your friend joins.
              </p>
              
              <Button
                onClick={handleClose}
                variant="ghost"
              >
                Cancel
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};