import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface TimeRemaining {
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

const CountdownTimer = () => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({ hours: 0, minutes: 0, seconds: 0, total: 0 });
  const [isFinished, setIsFinished] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  const lastReminderRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Set target time to 5:30 PM today
  const getTargetTime = () => {
    const now = new Date();
    const target = new Date();
    target.setHours(14, 52, 0, 0); // 5:30 PM
    
    // If it's already past 5:30 PM today, set it for tomorrow
    if (now > target) {
      target.setDate(target.getDate() + 1);
    }
    
    return target;
  };

  const speakReminder = (timeLeft: TimeRemaining) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance();
      
      let message = '';
      if (timeLeft.hours > 0) {
        message = `Time remaining to leave the office: ${timeLeft.hours} hours and ${timeLeft.minutes} minutes`;
      } else if (timeLeft.minutes > 0) {
        message = `Time remaining to leave the office: ${timeLeft.minutes} minutes and ${timeLeft.seconds} seconds`;
      } else {
        message = `Only ${timeLeft.seconds} seconds left!`;
      }
      
      utterance.text = message;
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;
      
      speechSynthesis.speak(utterance);
    }
  };

  const createFirework = () => {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#fd79a8'];
    const firework = document.createElement('div');
    firework.className = 'firework';
    firework.style.left = Math.random() * 100 + '%';
    firework.style.top = Math.random() * 100 + '%';
    firework.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    firework.style.width = '10px';
    firework.style.height = '10px';
    
    document.body.appendChild(firework);
    
    setTimeout(() => {
      document.body.removeChild(firework);
    }, 1000);
  };

  const triggerFireworks = () => {
    setShowFireworks(true);
    
    // Create multiple fireworks
    for (let i = 0; i < 20; i++) {
      setTimeout(() => createFirework(), i * 100);
    }
    
    // Speak the final message
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance();
      utterance.text = "Get your things, and get out!";
      utterance.rate = 1.2;
      utterance.pitch = 1.3;
      utterance.volume = 1;
      speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const target = getTargetTime().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeRemaining({ hours: 0, minutes: 0, seconds: 0, total: 0 });
        setIsFinished(true);
        if (!showFireworks) {
          triggerFireworks();
        }
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      const newTimeRemaining = { hours, minutes, seconds, total: difference };
      setTimeRemaining(newTimeRemaining);

      // Voice reminder every 15 minutes
      const totalMinutes = Math.floor(difference / (1000 * 60));
      const reminderInterval = 15;
      
      if (totalMinutes > 0 && totalMinutes % reminderInterval === 0 && totalMinutes !== lastReminderRef.current) {
        lastReminderRef.current = totalMinutes;
        speakReminder(newTimeRemaining);
      }
      
      // Additional reminders for the last few minutes
      if (totalMinutes <= 5 && totalMinutes > 0 && seconds === 0 && totalMinutes !== lastReminderRef.current) {
        lastReminderRef.current = totalMinutes;
        speakReminder(newTimeRemaining);
      }
    };

    intervalRef.current = setInterval(updateTimer, 1000);
    updateTimer(); // Initial call

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [showFireworks]);

  const testVoice = () => {
    speakReminder(timeRemaining);
  };

  if (isFinished) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="text-center z-10 animate-bounce-slow">
          <div className="text-8xl md:text-9xl font-bold gradient-text mb-8">
            🎉 TIME'S UP! 🎉
          </div>
          <Card className="gradient-border">
            <div className="bg-card p-8 rounded-lg">
              <h1 className="text-4xl md:text-6xl font-bold text-warning mb-4">
                Get your things, and get out!
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground">
                Thank you for your service! 🚪✨
              </p>
            </div>
          </Card>
        </div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute text-6xl animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            >
              {['🎊', '🎉', '✨', '🎈', '🥳'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl text-center">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-4">
            Freedom Countdown! 🚀
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground">
            Time remaining until office freedom at 5:30 PM
          </p>
        </div>

        {/* Main countdown display */}
        <Card className="gradient-border mb-8">
          <div className="bg-card p-8 md:p-12 rounded-lg countdown-glow">
            <div className="grid grid-cols-3 gap-4 md:gap-8">
              {/* Hours */}
              <div className="text-center">
                <div className="relative">
                  <div className="pulse-ring"></div>
                  <div className="text-5xl md:text-8xl font-bold countdown-digit gradient-text">
                    {timeRemaining.hours.toString().padStart(2, '0')}
                  </div>
                </div>
                <div className="text-lg md:text-xl text-muted-foreground mt-2">Hours</div>
              </div>

              {/* Minutes */}
              <div className="text-center">
                <div className="relative">
                  <div className="pulse-ring"></div>
                  <div className="text-5xl md:text-8xl font-bold countdown-digit gradient-text">
                    {timeRemaining.minutes.toString().padStart(2, '0')}
                  </div>
                </div>
                <div className="text-lg md:text-xl text-muted-foreground mt-2">Minutes</div>
              </div>

              {/* Seconds */}
              <div className="text-center">
                <div className="relative">
                  <div className="pulse-ring"></div>
                  <div className="text-5xl md:text-8xl font-bold countdown-digit gradient-text">
                    {timeRemaining.seconds.toString().padStart(2, '0')}
                  </div>
                </div>
                <div className="text-lg md:text-xl text-muted-foreground mt-2">Seconds</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Progress indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="gradient-border">
            <div className="bg-card p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-accent mb-2">Next Voice Reminder</h3>
              <p className="text-muted-foreground">Every 15 minutes</p>
            </div>
          </Card>
          
          <Card className="gradient-border">
            <div className="bg-card p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-secondary mb-2">Final Destination</h3>
              <p className="text-muted-foreground">5:30 PM Sharp! 🎯</p>
            </div>
          </Card>
        </div>

        {/* Test voice button */}
        <Button 
          onClick={testVoice}
          className="gradient-bg hover:opacity-90 transition-opacity"
          size="lg"
        >
          🔊 Test Voice Reminder
        </Button>

        {/* Floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute text-4xl animate-float opacity-20"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 80}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${4 + Math.random() * 2}s`
              }}
            >
              {['⏰', '🕘', '⌚', '📅', '🎊'][i]}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;