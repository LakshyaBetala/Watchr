import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
    <h1 className="text-8xl font-bold text-primary mb-4">404</h1>
    <p className="text-xl text-muted-foreground mb-8">Page not found</p>
    <Button asChild variant="outline">
      <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
    </Button>
  </div>
);

export default NotFound;
