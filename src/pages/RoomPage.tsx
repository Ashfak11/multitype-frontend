import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRoom } from '@/context/RoomContext';
import { useAuth } from '@/context/AuthContext';
import { RoomLobby } from '@/components/room/RoomLobby';
import { MultiplayerTypingTest } from '@/components/typing/MultiplayerTypingTest';
import { Button } from '@/components/ui/button';
import { Loader2, Home } from 'lucide-react';
import { Header } from '@/components/layout/Header';

const RoomPage: React.FC = () => {
    // Correctly get roomCode from params
    const { roomCode } = useParams<{ roomCode: string }>();
    const { room, isConnecting, error, joinRoom, syncRoom, isSyncing } = useRoom();
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const navigate = useNavigate();

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthLoading && !isAuthenticated) {
            // Use navigate with replace to avoid back button loop
            navigate('/auth', { replace: true });
        }
    }, [isAuthLoading, isAuthenticated, navigate]);

    // Sync room logic (restore state if refresh, or ensure creator state)
    useEffect(() => {
        // Only run if we have a roomCode, user is logged in
        if (roomCode && isAuthenticated && !isConnecting && !error && !isSyncing) {
            // If we already have the room in context and it matches, we are good. 
            // BUT creator might have just created it.
            // If room is null, OR room code doesn't match, we need to sync.
            if (!room || room.roomCode !== roomCode) {
                // Determine if we should join or just sync.
                // Actually, duplicate join is bad.
                // We should assume that if the user LANDED here:
                // 1. They created the room (Context already set, this runs but room matches -> no-op)
                // 2. They joined via Home (Context already set, no-op)
                // 3. They refreshed (Context empty -> Sync)
                // 4. They clicked a link (Context empty -> Sync)

                // So we call syncRoom. 
                // IF they are not in the room on backend, syncRoom (getRoomState) might fail.
                // That's acceptable - we can handle that error by redirecting or showing "Join" button.
                // For now, we assume they are allowed to view state or re-connect.
                syncRoom(roomCode.trim().toUpperCase());
            }
        }
    }, [roomCode, isAuthenticated, room, isConnecting, error, syncRoom, isSyncing]);

    // Connection screen
    if (isAuthLoading || (isConnecting && !room)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span className="text-muted-foreground">Connecting to room...</span>
                </div>
            </div>
        );
    }

    // Error screen
    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4 p-4 text-center">
                <h1 className="text-2xl font-bold text-destructive">Error</h1>
                <p className="text-muted-foreground max-w-md">{error}</p>
                <Button onClick={() => navigate('/')} variant="outline" className="gap-2">
                    <Home className="w-4 h-4" /> Go Home
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <main className="flex-1 flex flex-col items-center justify-center py-8 px-4">
                {!room ? (
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-muted-foreground">Loading room state...</p>
                    </div>
                ) : (
                    <>
                        {/* Keep rendering Lobby during COUNTDOWN so the giant number overlays it, or replace completely */}
                        {/* The RoomLobby component handles the countdown overlay logic itself if countdown is active */}
                        {(room.roomStatus === 'WAITING' || room.roomStatus === 'COUNTDOWN') && (
                            <RoomLobby />
                        )}

                        {(room.roomStatus === 'IN_PROGRESS' || room.roomStatus === 'FINISHED') && (
                            <MultiplayerTypingTest />
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default RoomPage;
