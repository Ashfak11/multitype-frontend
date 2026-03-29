import React, { useEffect, useRef } from 'react';
import { WordDisplay } from './WordDisplay';
import { Stats } from './Stats';
import { useTypingTest } from '@/hooks/useTypingTest';
import { useRoom } from '@/context/RoomContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export const MultiplayerTypingTest: React.FC = () => {
    const { room, players, sendProgress, sendFinish, leaveRoom, latestProgressEvent, playAgain } = useRoom();
    const { user } = useAuth();

    // Local state for opponent caret (updated via latestProgressEvent for speed)
    const [opponentWordIndex, setOpponentWordIndex] = React.useState(0);
    const [opponentCharIndex, setOpponentCharIndex] = React.useState(0);

    // Effect to update local opponent state from latest event
    useEffect(() => {
        if (!latestProgressEvent) return;
        // Ignore own events
        if (latestProgressEvent.playerId === user?.playerId || latestProgressEvent.username === user?.username) return;

        // Update local state
        setOpponentWordIndex(latestProgressEvent.currentWordIndex);
        setOpponentCharIndex(latestProgressEvent.currentCharIndex);

        console.log('[Game] Opponent caret updated:', latestProgressEvent.currentWordIndex, latestProgressEvent.currentCharIndex);
    }, [latestProgressEvent, user?.playerId, user?.username]);

    // Get words from room payload
    const words = React.useMemo(() => {
        // wordsPayload is a single string "word1 word2..."
        return room?.wordsPayload ? room.wordsPayload.split(' ') : [];
    }, [room?.wordsPayload]);

    const {
        currentWordIndex,
        currentCharIndex,
        typedChars,
        isActive,
        isFinished,
        timeLeft, // Note: Multiplayer uses count-UP usually (elapsed time) for WPM, but hook uses countdown. 
        // We might ignore hook's timeLeft and use our own start time or just let it be.
        // If mode is 'time', it counts down. If 'words', it might behave differently.
        // For multiplayer racing, it's usually "finish these words".
        wpm,
        accuracy,
        totalTyped,
        correctTyped,
        handleKeyPress,
        reset,
        startTest,
    } = useTypingTest(words, { startOnFirstKey: false });

    const [hasSentFinish, setHasSentFinish] = React.useState(false);

    // Send finish stats when game is finished OR timer expires
    useEffect(() => {
        const shouldSendFinish = (isFinished || timeLeft === 0) && !hasSentFinish;

        if (shouldSendFinish) {
            console.log('[Game] Sending finish stats:', {
                wpm,
                accuracy,
                totalTyped,
                correctTyped,
                reason: isFinished ? 'completed all words' : 'timer expired'
            });
            sendFinish(wpm, accuracy, totalTyped, correctTyped);
            setHasSentFinish(true);
        }
    }, [isFinished, timeLeft, hasSentFinish, wpm, accuracy, totalTyped, correctTyped, sendFinish]);

    // Reset typing test when room returns to WAITING (play again)
    useEffect(() => {
        if (room?.roomStatus === 'WAITING') {
            reset();
            setHasSentFinish(false);
        }
    }, [room?.roomStatus, reset]);

    const containerRef = useRef<HTMLDivElement>(null);
    const lastSentIndex = useRef<number>(-1);

    // Focus container
    useEffect(() => {
        containerRef.current?.focus();
    }, []);

    // Handle key press
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === ' ') e.preventDefault();
            if (['Shift', 'Control', 'Alt', 'Meta', 'Tab', 'Escape'].includes(e.key)) return;
            handleKeyPress(e.key);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyPress]);

    // Start test when room status changes to IN_PROGRESS
    useEffect(() => {
        if (room?.roomStatus === 'IN_PROGRESS' && !isActive && !isFinished) {
            startTest();
        }
    }, [room?.roomStatus, isActive, isFinished, startTest]);

    // Send progress on word OR char change
    useEffect(() => {
        if (isActive) {
            // Send if word changed OR char changed
            // We want real-time updates for caret
            sendProgress(currentWordIndex, currentCharIndex);
        }
    }, [currentWordIndex, currentCharIndex, isActive, sendProgress]);

    // ... (rest of file)

    // Find opponent
    const opponent = players.find(p => p.username !== user?.username);

    // If opponent exists, get their index
    // If opponent exists, get their index (fallback to players list if no event yet)
    // We prioritize local state which is driven by the event stream
    // const opponentIndex = opponent?.currentWordIndex;
    // const opponentCharIndex = opponent?.currentCharIndex;

    const winner = React.useMemo(() => {
        if (room?.roomStatus === 'FINISHED') {
            return players.find(p => p.playerStatus === 'FINISHED');
        }
        return null;
    }, [room?.roomStatus, players]);

    const isGameFinished = room?.roomStatus === 'FINISHED';

    return (
        <div
            ref={containerRef}
            className="w-full max-w-4xl mx-auto px-4 outline-none"
            tabIndex={0}
        >
            {/* Stats Bar */}
            <div className="mb-12 grid grid-cols-3 gap-4">
                <Stats
                    wpm={wpm}
                    accuracy={accuracy}
                    timeLeft={timeLeft}
                    isActive={isActive && !isGameFinished}
                    isFinished={isFinished || isGameFinished}
                />


            </div>

            {/* Typing Area */}
            <div
                className={cn(
                    "relative p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 transition-all duration-300",
                    (isFinished || isGameFinished) && "opacity-50 blur-[2px] pointer-events-none"
                )}
            >
                <WordDisplay
                    words={words}
                    currentWordIndex={currentWordIndex}
                    currentCharIndex={currentCharIndex}
                    typedChars={typedChars}
                    opponentIndex={opponentWordIndex}
                    opponentCharIndex={opponentCharIndex}
                />
            </div>

            {/* Game Over Overlay */}
            {
                isGameFinished && (
                    <div className="absolute inset-0 flex items-center justify-center z-50">
                        <div className="bg-background/95 border border-border p-8 rounded-2xl shadow-2xl text-center animate-in fade-in zoom-in duration-300 max-w-md w-full">
                            <h2 className="text-4xl font-black text-primary mb-2">GAME OVER</h2>
                            {winner ? (
                                <div className="space-y-2">
                                    <p className="text-xl text-muted-foreground">Winner</p>
                                    <p className="text-3xl font-bold text-green-500">{winner.username}</p>
                                </div>
                            ) : (
                                <p className="text-xl text-muted-foreground">Race Finished</p>
                            )}

                            <div className="mt-8 flex gap-4 justify-center">
                                <Button onClick={playAgain}>
                                    Play Again
                                </Button>
                                <Button variant="outline" onClick={leaveRoom}>
                                    Leave Room
                                </Button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Waiting for others overlay REMOVED as requested to go directly to results */}
            {/*
                !isGameFinished && isFinished && (
                    <div className="mt-8 text-center animate-in fade-in">
                        <h2 className="text-2xl font-bold text-green-500 mb-2">Finished!</h2>
                        <p className="text-muted-foreground">Waiting for result...</p>
                    </div>
                )
            */}
        </div >
    );
};
