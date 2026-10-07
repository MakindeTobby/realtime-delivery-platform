CREATE TABLE "driver_order_declines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"order_id" uuid NOT NULL,
	"driver_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "driver_order_declines_order_driver_unique" UNIQUE("order_id","driver_id")
);
--> statement-breakpoint
CREATE INDEX "driver_order_declines_order_idx" ON "driver_order_declines" ("order_id");--> statement-breakpoint
CREATE INDEX "driver_order_declines_driver_idx" ON "driver_order_declines" ("driver_id");--> statement-breakpoint
ALTER TABLE "driver_order_declines" ADD CONSTRAINT "driver_order_declines_order_id_orders_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "driver_order_declines" ADD CONSTRAINT "driver_order_declines_driver_id_driver_profiles_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "driver_profiles"("id") ON DELETE CASCADE;