// import React from 'react';
// import { cn } from '@/lib/utils';

// interface StatsProps {
//   wpm: number;
//   accuracy: number;
//   timeLeft: number;
//   isActive: boolean;
//   isFinished: boolean;
// }

// export const Stats: React.FC<StatsProps> = ({
//   wpm,
//   accuracy,
//   timeLeft,
//   isActive,
//   isFinished,
// }) => {
//   return (
//     <div className="flex items-center justify-center gap-8 md:gap-16 animate-fade-in">
//       <div className="text-center">
//         <div className={cn(
//           "stat-value transition-colors",
//           isFinished && "text-primary"
//         )}>
//           {wpm}
//         </div>
//         <div className="stat-label">wpm</div>
//       </div>
      
//       <div className="text-center">
//         <div className={cn(
//           "stat-value transition-colors",
//           accuracy >= 95 && "text-success",
//           accuracy < 80 && accuracy > 0 && "text-destructive"
//         )}>
//           {accuracy}%
//         </div>
//         <div className="stat-label">accuracy</div>
//       </div>
      
//       <div className="text-center">
//         <div className={cn(
//           "stat-value transition-colors",
//           timeLeft <= 10 && isActive && "text-destructive animate-pulse"
//         )}>
//           {timeLeft}
//         </div>
//         <div className="stat-label">seconds</div>
//       </div>
//     </div>
//   );
// };

import React from 'react';
import { cn } from '@/lib/utils';

interface StatsProps {
  wpm: number;
  accuracy: number;
  timeLeft: number;
  isActive: boolean;
  isFinished: boolean;
}

export const Stats: React.FC<StatsProps> = ({
  wpm,
  accuracy,
  timeLeft,
  isActive,
  isFinished,
}) => {
  return (
    <div className="flex items-center justify-center gap-8 md:gap-16 animate-fade-in">
      <div className="text-center">
        <div className={cn(
          "stat-value transition-colors",
          isFinished && "text-primary"
        )}>
          {wpm}
        </div>
        <div className="stat-label">wpm</div>
      </div>
      
      <div className="text-center">
        <div className={cn(
          "stat-value transition-colors",
          accuracy >= 95 && "text-success",
          accuracy < 80 && accuracy > 0 && "text-destructive"
        )}>
          {accuracy}%
        </div>
        <div className="stat-label">accuracy</div>
      </div>
      
      <div className="text-center">
        <div className={cn(
          "stat-value transition-colors",
          timeLeft <= 10 && isActive && "text-destructive animate-pulse"
        )}>
          {timeLeft}
        </div>
        <div className="stat-label">seconds</div>
      </div>
    </div>
  );
};

