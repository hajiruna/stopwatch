interface TimerDisplayProps {
  time: number;
}

export function TimerDisplay({ time }: TimerDisplayProps) {
  // Format the time
  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600000);
    const minutes = Math.floor((time % 3600000) / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const milliseconds = time % 1000;
    
    return {
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0'),
      milliseconds: milliseconds.toString().padStart(3, '0')
    };
  };

  const { hours, minutes, seconds, milliseconds } = formatTime(time);

  return (
    <div className="bg-slate-100 rounded-lg p-4 mb-8">
      <div className="font-mono text-5xl md:text-6xl text-center tabular-nums tracking-tight">
        <span>{hours}</span>:<span>{minutes}</span>:<span>{seconds}</span>.<span>{milliseconds}</span>
      </div>
    </div>
  );
}
