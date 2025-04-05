
import { useState, useEffect } from 'react';
import { useHealth } from '@/contexts/HealthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Footprints, Droplets, Utensils, Dumbbell, CheckCircle, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';

const HealthTips = () => {
  const { healthData, completeTip, resetTip } = useHealth();
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<null | 'left' | 'right'>(null);
  const [isPulsing, setIsPulsing] = useState(true);
  
  const tips = healthData.dailyTips.tips;
  const currentTip = tips[currentTipIndex];
  const allCompleted = tips.every(tip => tip.completed);
  
  // Set up pulsing animation timer
  useEffect(() => {
    if (!currentTip?.completed && !showCompletionAnimation) {
      const interval = setInterval(() => {
        setIsPulsing(prev => !prev);
      }, 2000);
      
      return () => clearInterval(interval);
    } else {
      setIsPulsing(false);
    }
  }, [currentTip, showCompletionAnimation]);
  
  const moveToNext = () => {
    if (currentTip.completed) {
      // If already completed, just move to next
      if (currentTipIndex < tips.length - 1) {
        setSwipeDirection('right');
        setTimeout(() => {
          setCurrentTipIndex(currentTipIndex + 1);
          setSwipeDirection(null);
        }, 300);
      }
    } else {
      // Mark as completed with animation
      setSwipeDirection('right');
      
      setTimeout(() => {
        completeTip(currentTip.id);
        
        // Check if this was the last tip
        if (currentTipIndex === tips.length - 1) {
          // This was the last tip, check if all are completed now
          const updatedAllCompleted = tips.every((tip, i) => 
            i === currentTipIndex ? true : tip.completed
          );
          
          if (updatedAllCompleted) {
            triggerCompletion();
          }
        } else {
          // Move to the next tip
          setCurrentTipIndex(currentTipIndex + 1);
        }
        
        setSwipeDirection(null);
      }, 300);
    }
  };
  
  const moveToPrevious = () => {
    if (currentTipIndex > 0) {
      setSwipeDirection('left');
      setTimeout(() => {
        setCurrentTipIndex(currentTipIndex - 1);
        setSwipeDirection(null);
      }, 300);
    }
  };
  
  const skipTip = () => {
    setSwipeDirection('left');
    setTimeout(() => {
      if (currentTipIndex < tips.length - 1) {
        setCurrentTipIndex(currentTipIndex + 1);
      }
      setSwipeDirection(null);
    }, 300);
  };
  
  const resetAllTips = () => {
    tips.forEach(tip => {
      resetTip(tip.id);
    });
    setCurrentTipIndex(0);
    setShowCompletionAnimation(false);
  };
  
  const triggerCompletion = () => {
    setShowCompletionAnimation(true);
    
    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };
  
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'footprints':
        return <Footprints className="h-12 w-12 text-cyan-500" />;
      case 'droplets':
        return <Droplets className="h-12 w-12 text-blue-500" />;
      case 'utensils':
        return <Utensils className="h-12 w-12 text-amber-500" />;
      case 'stretch':
        return <Dumbbell className="h-12 w-12 text-purple-500" />;
      default:
        return <CheckCircle className="h-12 w-12 text-green-500" />;
    }
  };
  
  // Animation variants
  const cardVariants = {
    initial: (direction: 'left' | 'right' | null) => ({
      x: direction === 'right' ? -300 : direction === 'left' ? 300 : 0,
      opacity: direction ? 0 : 1,
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    },
    exit: (direction: 'left' | 'right' | null) => ({
      x: direction === 'left' ? -300 : direction === 'right' ? 300 : 0,
      opacity: 0,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    })
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Health Boost</h1>
        <p className="text-muted-foreground">Daily tips to improve your health</p>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex space-x-1">
          {tips.map((tip, index) => (
            <div 
              key={tip.id} 
              className={`h-1.5 w-8 rounded-full ${
                index === currentTipIndex 
                  ? 'bg-cyan-500' 
                  : tip.completed 
                    ? 'bg-cyan-200' 
                    : 'bg-muted'
              }`}
            />
          ))}
        </div>
        
        <div className="text-sm text-muted-foreground">
          {currentTipIndex + 1} of {tips.length}
        </div>
      </div>
      
      <div className="relative h-[480px] flex items-center justify-center overflow-hidden">
        {showCompletionAnimation ? (
          <motion.div 
            className="tip-card w-full h-full flex flex-col items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="text-6xl mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              🎉
            </motion.div>
            <motion.h2 
              className="text-2xl font-bold text-center mb-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              All Tips Complete!
            </motion.h2>
            <motion.p 
              className="text-muted-foreground text-center mb-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              Great job! You've completed all health tips for today.
            </motion.p>
            <motion.p 
              className="font-medium text-xl mb-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              Current Streak: {healthData.dailyTips.streak} day{healthData.dailyTips.streak !== 1 ? 's' : ''}
            </motion.p>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.5 }}
            >
              <Button 
                onClick={resetAllTips} 
                variant="outline"
                className="mt-4"
              >
                Start Over
              </Button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            className="w-full h-full"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={cardVariants}
            custom={swipeDirection}
            key={currentTipIndex}
          >
            <Card 
              className={`tip-card w-full h-full flex flex-col shadow-lg ${
                isPulsing && !currentTip.completed 
                  ? 'animate-pulse-gentle border-cyan-200' 
                  : ''
              }`}
            >
              <div className="flex-1 p-6 flex flex-col items-center justify-center">
                <motion.div
                  animate={
                    isPulsing && !currentTip.completed
                      ? { scale: [1, 1.05, 1], opacity: [1, 0.9, 1] }
                      : {}
                  }
                  transition={{ duration: 2, repeat: Infinity, repeatType: "loop" }}
                >
                  {getIcon(currentTip.icon)}
                </motion.div>
                
                <h2 className="text-2xl font-bold mt-6 mb-3 text-center">
                  {currentTip.title}
                </h2>
                
                <p className="text-center text-muted-foreground">
                  {currentTip.description}
                </p>
                
                <div className="mt-auto pt-8 w-full flex justify-between">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={moveToPrevious}
                    disabled={currentTipIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant={currentTip.completed ? "outline" : "default"}
                    onClick={moveToNext}
                    className={currentTip.completed ? "" : "bg-cyan-500 hover:bg-cyan-600"}
                  >
                    {currentTipIndex < tips.length - 1 
                      ? currentTip.completed ? "Next Tip" : "Complete & Next" 
                      : currentTip.completed 
                        ? "Already Completed" 
                        : "Complete"
                    }
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={skipTip}
                    disabled={currentTipIndex === tips.length - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
      
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
          <Heart className="h-4 w-4 text-red-400" />
          <p>
            Current Streak: {healthData.dailyTips.streak} day{healthData.dailyTips.streak !== 1 ? 's' : ''}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Last updated: {new Date(healthData.dailyTips.lastUpdated).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default HealthTips;
