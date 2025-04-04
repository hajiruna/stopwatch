import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function NotFound() {
  const [location, navigate] = useLocation();
  
  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate("/");
    }
  };
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-background to-muted">
      <Card className="w-full max-w-md mx-4 shadow-lg border-muted">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center mb-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-2" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">404 ページが見つかりません</h1>
          </div>

          <p className="mt-4 text-muted-foreground text-center">
            お探しのページは存在しないか、移動された可能性があります。
          </p>
        </CardContent>
        <CardFooter className="flex justify-center gap-4 pb-6">
          <Button variant="outline" size="sm" onClick={goBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            戻る
          </Button>
          <Button variant="default" size="sm" asChild className="flex items-center gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              ホームに戻る
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
