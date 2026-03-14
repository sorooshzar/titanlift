import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Dumbbell } from "lucide-react";

export default function PageNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background">
      <Dumbbell className="w-16 h-16 text-muted-foreground/30 mb-4" />
      <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
      <p className="text-muted-foreground text-sm mb-6">This page doesn't exist.</p>
      <Link to={createPageUrl("Lifts")}>
        <Button>Go to Dashboard</Button>
      </Link>
    </div>
  );
}