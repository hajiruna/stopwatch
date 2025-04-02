import { Button } from "@/components/ui/button";

interface ControlButtonsProps {
  isRunning: boolean;
  hasElapsedTime: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
}

export function ControlButtons({
  isRunning,
  hasElapsedTime,
  onStart,
  onStop,
  onReset
}: ControlButtonsProps) {
  return (
    <div className="flex justify-center gap-4">
      <Button
        size="lg"
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg"
        onClick={onStart}
        disabled={isRunning}
      >
        スタート
      </Button>
      
      <Button
        size="lg"
        variant="destructive"
        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 text-lg"
        onClick={onStop}
        disabled={!isRunning}
      >
        ストップ
      </Button>
      
      <Button
        size="lg"
        variant="secondary"
        className="bg-slate-300 hover:bg-slate-400 text-slate-800 px-6 py-3 text-lg"
        onClick={onReset}
        disabled={isRunning || !hasElapsedTime}
      >
        リセット
      </Button>
    </div>
  );
}
