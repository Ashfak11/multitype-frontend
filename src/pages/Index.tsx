import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { TypingTest } from '@/components/typing/TypingTest';
import { FloatingActionButton } from '@/components/layout/FloatingActionButton';
import { CreateRoomModal } from '@/components/room/CreateRoomModal';

const Index: React.FC = () => {
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-8">
        <TypingTest />
      </main>
      
      <FloatingActionButton onClick={() => setIsRoomModalOpen(true)} />
      
      <CreateRoomModal 
        open={isRoomModalOpen} 
        onOpenChange={setIsRoomModalOpen} 
      />
      
      {/* Footer hint */}
      <footer className="py-4 text-center">
        <p className="text-xs text-muted-foreground">
          Press any key to start • Space to skip word • Tab + Enter to restart
        </p>
      </footer>
    </div>
  );
};

export default Index;
