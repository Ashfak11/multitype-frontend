import React from 'react';
import { useRoom } from '@/context/RoomContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Copy, Check, Timer } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { PlayerSnapshot } from '@/types';

export const RoomLobby: React.FC = () => {
    const { room, players, setReady, countdown, leaveRoom } = useRoom();
    const { user } = useAuth();
    const [copied, setCopied] = React.useState(false);

    // Find my player to check ready status
    const myPlayer = players.find(p => p.playerId === user?.playerId);
    const isReady = myPlayer?.playerStatus === 'READY';

    const copyRoomCode = () => {
        if (room?.roomCode) {
            navigator.clipboard.writeText(room.roomCode)
                .then(() => {
                    setCopied(true);
                    toast.success('Room code copied!');
                    setTimeout(() => setCopied(false), 2000);
                })
                .catch(err => {
                    console.error('Failed to copy request text: ', err);
                    toast.error('Failed to copy room code');
                });
        }
    };

    // If countdown is active, show giant countdown
    if (countdown !== null) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] animate-in fade-in zoom-in duration-300">
                <div className="text-[12rem] font-bold text-primary tabular-nums animate-pulse">
                    {countdown}
                </div>
                <p className="text-2xl text-muted-foreground mt-4">Get Ready!</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center max-w-4xl mx-auto w-full p-4 gap-8">
            {/* Room Header & Code */}
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold tracking-tight">Multiplayer Lobby</h1>
                <div className="flex items-center gap-4 bg-muted/50 p-4 rounded-xl border border-border/50 backdrop-blur">
                    <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Room Code</div>
                    <div className="text-3xl font-mono font-bold text-primary tracking-widest">{room?.roomCode}</div>
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={copyRoomCode}
                        className={cn("transition-colors", copied && "text-green-500")}
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                </div>
            </div>

            {/* Players Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                {/* Player Lists - Separated for better visual or just a list */}
                {/* Let's just list them nicely */}
                {players.map((player) => (
                    <PlayerCard key={player.playerId} player={player} isMe={player.playerId === user?.playerId} />
                ))}

                {/* Placeholders if waiting for player */}
                {players.length < 2 && (
                    <Card className="border-dashed border-2 flex items-center justify-center h-48 bg-muted/20">
                        <div className="text-center text-muted-foreground">
                            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>Waiting for opponent...</p>
                        </div>
                    </Card>
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-8">
                <Button
                    variant="destructive"
                    size="lg"
                    onClick={leaveRoom}
                >
                    Leave Room
                </Button>

                <Button
                    variant={isReady ? "secondary" : "default"}
                    size="lg"
                    onClick={() => setReady()}
                    className="w-48 text-lg"
                    disabled={players.length < 2} // Disable ready if alone? Usually yes
                >
                    {isReady ? "Not Ready" : "Ready Up"}
                </Button>
            </div>

            {players.length < 2 && (
                <p className="text-sm text-muted-foreground">Waiting for more players to join before you can start.</p>
            )}
        </div>
    );
};

function PlayerCard({ player, isMe }: { player: PlayerSnapshot, isMe: boolean }) {
    const isReady = player.playerStatus === 'READY';

    return (
        <Card className={cn(
            "relative overflow-hidden transition-all duration-300",
            isMe ? "border-primary/50 bg-primary/5" : "bg-card",
            isReady && "ring-2 ring-green-500/50"
        )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-bold">
                    {player.username} {isMe && "(You)"}
                </CardTitle>
                {isReady ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                        <Check className="w-3 h-3" /> READY
                    </span>
                ) : (
                    <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        <Timer className="w-3 h-3" /> WAITING
                    </span>
                )}
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{player.role}</span>
                    <span className="font-mono">{player.playerStatus}</span>
                </div>
            </CardContent>

            {/* Status Indicator Bar */}
            <div className={cn(
                "absolute bottom-0 left-0 right-0 h-1 transition-colors",
                isReady ? "bg-green-500" : "bg-muted" // or transparent
            )} />
        </Card>
    );
}
