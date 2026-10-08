import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function CustomerPortalPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-muted/30 p-4">
      <Card className="w-full max-w-lg">
        <CardContent className="space-y-4 p-8 text-center">
          <h1 className="text-2xl font-semibold">Your customer account is ready</h1>
          <p className="text-muted-foreground">
            Customer ordering is available in the mobile app. You can also apply to become a delivery partner here.
          </p>
          <Button asChild><Link to="/partner">Explore partner options</Link></Button>
        </CardContent>
      </Card>
    </main>
  );
}
