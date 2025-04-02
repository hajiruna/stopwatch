import { Card, CardContent } from "@/components/ui/card";
import { TimerDisplay } from "./timer-display";
import { ControlButtons } from "./control-buttons";
import { useState, useEffect, useRef } from "react";

export function Stopwatch() {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const startTimeRef = useRef(0);
  const intervalIdRef = useRef<number | null>(null);

  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      startTimeRef.current = Date.now() - elapsedTime;
      
      intervalIdRef.current = window.setInterval(() => {
        setElapsedTime(Date.now() - startTimeRef.current);
      }, 10); // Update every 10ms for smooth display
    }
  };

  const stopTimer = () => {
    if (isRunning) {
      setIsRunning(false);
      clearInterval(intervalIdRef.current!);
      intervalIdRef.current = null;
    }
  };

  const resetTimer = () => {
    if (!isRunning) {
      setElapsedTime(0);
    }
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, []);

  return (
    <div className="max-w-md w-full">
      <Card className="shadow-lg">
        <CardContent className="p-6 md:p-8">
          <h1 className="text-2xl font-bold text-center mb-6">ストップウォッチ</h1>
          
          <TimerDisplay time={elapsedTime} />
          
          <ControlButtons 
            isRunning={isRunning}
            hasElapsedTime={elapsedTime > 0}
            onStart={startTimer}
            onStop={stopTimer}
            onReset={resetTimer}
          />
        </CardContent>
      </Card>
    </div>
  );
}
