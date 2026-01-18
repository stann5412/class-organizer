import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl border-dashed">
        <CardContent className="pt-6 flex flex-col items-center text-center">
          <div className="bg-destructive/10 p-4 rounded-full mb-4">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Page Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            Oops! The page you are looking for has vanished into the academic void.
          </p>
          <Link href="/">
            <Button className="w-full">Return Home</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
