import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { TimerDisplay } from "./timer-display";
import { ControlButtons } from "./control-buttons";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { formatTime } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { StopwatchRecord } from "@shared/schema";
import { Trash2Icon } from "lucide-react";

export function Stopwatch() {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [saveTitle, setSaveTitle] = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);
  
  const startTimeRef = useRef(0);
  const intervalIdRef = useRef<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch saved records
  const { data: records, isLoading } = useQuery<StopwatchRecord[]>({
    queryKey: ["/api/stopwatch-records"],
    refetchOnWindowFocus: false
  });

  // Save record mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/stopwatch-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: saveTitle || "記録 " + formatTime(elapsedTime, false),
          duration: elapsedTime
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stopwatch-records"] });
      toast({
        title: "保存完了",
        description: "タイマー記録が保存されました",
      });
      setSaveTitle("");
      setShowSaveForm(false);
    },
    onError: (error) => {
      toast({
        title: "エラー",
        description: "保存に失敗しました: " + (error as Error).message,
        variant: "destructive"
      });
    }
  });

  // Delete record mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/stopwatch-records/${id}`, {
        method: "DELETE"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stopwatch-records"] });
      toast({
        title: "削除完了",
        description: "記録が削除されました",
      });
    },
    onError: (error) => {
      toast({
        title: "エラー",
        description: "削除に失敗しました: " + (error as Error).message,
        variant: "destructive"
      });
    }
  });

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
      if (elapsedTime > 0) {
        setShowSaveForm(true);
      }
    }
  };

  const resetTimer = () => {
    if (!isRunning) {
      setElapsedTime(0);
      setShowSaveForm(false);
    }
  };

  const handleSaveRecord = () => {
    if (elapsedTime > 0) {
      saveMutation.mutate();
    }
  };

  const handleDeleteRecord = (id: number) => {
    deleteMutation.mutate(id);
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
    <div className="max-w-3xl w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          
          {showSaveForm && (
            <CardFooter className="flex flex-col gap-4 p-6 pt-0">
              <div className="flex gap-2 w-full">
                <Input
                  placeholder="タイトル（任意）"
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                />
                <Button 
                  onClick={handleSaveRecord}
                  disabled={saveMutation.isPending}
                >
                  保存
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-6 md:p-8">
            <h2 className="text-xl font-bold text-center mb-4">保存された記録</h2>
            
            {isLoading && <p className="text-center text-muted-foreground">読み込み中...</p>}
            
            {!isLoading && records?.length === 0 && (
              <p className="text-center text-muted-foreground py-4">保存された記録はありません</p>
            )}
            
            <ul className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {records?.map((record) => (
                <li key={record.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                  <div className="overflow-hidden">
                    <p className="font-medium text-ellipsis overflow-hidden">{record.title || "無題"}</p>
                    <p className="text-sm text-muted-foreground">{formatTime(record.duration, false)}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDeleteRecord(record.id)}
                    disabled={deleteMutation.isPending}
                    className="ml-2 flex-shrink-0"
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
