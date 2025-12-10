import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Users, LogIn, UserPlus } from 'lucide-react';

interface AuthPromptProps {
  onBack?: () => void;
}

export const AuthPrompt: React.FC<AuthPromptProps> = ({ onBack }) => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate('/auth?tab=login');
  };

  const handleSignUp = () => {
    navigate('/auth?tab=signup');
  };

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
        <Users className="w-8 h-8 text-primary" />
      </div>
      
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-foreground">
          Sign in to play multiplayer
        </h3>
        <p className="text-sm text-muted-foreground max-w-[280px]">
          Create an account or sign in to race against your friends in real-time
        </p>
      </div>
      
      <div className="flex flex-col gap-3 w-full">
        <Button
          onClick={handleSignIn}
          variant="default"
          size="lg"
          className="h-12 gap-2"
        >
          <LogIn className="w-4 h-4" />
          Sign In
        </Button>
        
        <Button
          onClick={handleSignUp}
          variant="secondary"
          size="lg"
          className="h-12 gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Create Account
        </Button>
      </div>
      
      {onBack && (
        <Button
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
        >
          Maybe later
        </Button>
      )}
    </div>
  );
};
