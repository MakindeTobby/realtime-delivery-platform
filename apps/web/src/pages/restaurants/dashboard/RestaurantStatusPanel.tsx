import { Card, CardContent } from "@/components/ui/card";
import type { RestaurantRecord } from "@/api/restaurants.api";

type Props = { restaurants: RestaurantRecord[]; compact?: boolean };

const statusCopy = {
  PENDING: {
    title: "Application under review",
    description: "Our team is reviewing your restaurant details. Your menu and order tools will unlock after approval.",
  },
  REJECTED: {
    title: "Application needs attention",
    description: "This application was not approved. Please contact support for the review details and next steps.",
  },
  SUSPENDED: {
    title: "Restaurant account suspended",
    description: "Restaurant operations are paused. Contact support for help restoring access.",
  },
  APPROVED: {
    title: "Approved",
    description: "Your restaurant is approved for operations.",
  },
} as const;

export function RestaurantStatusPanel({ restaurants, compact = false }: Props) {
  return (
    <div className="space-y-3">
      {restaurants.map((restaurant) => {
        const copy = statusCopy[restaurant.verificationStatus];
        return (
          <Card key={restaurant.id}>
            <CardContent className={compact ? "flex flex-wrap items-center justify-between gap-3 p-4" : "space-y-3 p-6"}>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className={compact ? "font-semibold" : "text-lg font-semibold"}>{restaurant.name}</h2>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                    {restaurant.verificationStatus.toLowerCase()}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{copy.title}. {copy.description}</p>
              </div>
              {!compact && restaurant.verificationStatus === "PENDING" && (
                <p className="text-sm text-muted-foreground">
                  Submitted {new Date(restaurant.createdAt).toLocaleDateString()}.
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
