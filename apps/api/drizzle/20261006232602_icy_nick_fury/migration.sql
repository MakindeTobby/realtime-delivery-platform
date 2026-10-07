CREATE TYPE "user_role" AS ENUM('CUSTOMER', 'RESTAURANT_OWNER', 'DRIVER', 'ADMIN');--> statement-breakpoint
CREATE TYPE "verification_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');--> statement-breakpoint
CREATE TYPE "order_status" AS ENUM('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'PICKED_UP', 'DELIVERED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "payment_status" AS ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"password" text NOT NULL,
	"phone" text,
	"push_token" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"user_id" uuid,
	"role" "user_role",
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_roles_pkey" PRIMARY KEY("user_id","role")
);
--> statement-breakpoint
CREATE TABLE "user_addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"label" text NOT NULL,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"latitude" numeric(10,7),
	"longitude" numeric(10,7),
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_sessions" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"refresh_token_hash" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"revoked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_resets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL UNIQUE,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_rate_limits" (
	"key" text PRIMARY KEY,
	"count" integer DEFAULT 0 NOT NULL,
	"reset_at" timestamp NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "restaurants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"owner_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"image_url" text,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"cuisine_type" text NOT NULL,
	"verification_status" "verification_status" DEFAULT 'PENDING'::"verification_status" NOT NULL,
	"is_open" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menu_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"restaurant_id" uuid NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menu_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"category_id" uuid NOT NULL,
	"restaurant_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" numeric(10,2) NOT NULL,
	"image_url" text,
	"is_available" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "driver_locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"driver_id" uuid NOT NULL,
	"latitude" numeric(10,7) NOT NULL,
	"longitude" numeric(10,7) NOT NULL,
	"heading" numeric(6,2),
	"speed" numeric(8,2),
	"recorded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "driver_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL UNIQUE,
	"verification_status" "verification_status" DEFAULT 'PENDING'::"verification_status" NOT NULL,
	"is_online" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"order_id" uuid NOT NULL,
	"menu_item_id" uuid,
	"item_name" text NOT NULL,
	"unit_price" numeric(10,2) NOT NULL,
	"quantity" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"customer_id" uuid NOT NULL,
	"restaurant_id" uuid NOT NULL,
	"driver_id" uuid,
	"status" "order_status" DEFAULT 'PENDING'::"order_status" NOT NULL,
	"payment_status" "payment_status" DEFAULT 'PENDING'::"payment_status" NOT NULL,
	"total_amount" numeric(10,2) NOT NULL,
	"delivery_address" text NOT NULL,
	"delivery_city" text NOT NULL,
	"delivery_latitude" numeric(10,7),
	"delivery_longitude" numeric(10,7),
	"stripe_payment_intent_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"order_id" uuid NOT NULL,
	"status" "order_status" NOT NULL,
	"changed_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"customer_id" uuid NOT NULL,
	"restaurant_id" uuid NOT NULL,
	"order_id" uuid NOT NULL,
	"driver_id" uuid,
	"restaurant_rating" integer NOT NULL,
	"driver_rating" integer,
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "reviews_restaurant_rating_check" CHECK ("restaurant_rating" >= 1 AND "restaurant_rating" <= 5),
	CONSTRAINT "reviews_driver_rating_check" CHECK ("driver_rating" IS NULL OR ("driver_rating" >= 1 AND "driver_rating" <= 5))
);
--> statement-breakpoint
CREATE INDEX "user_addresses_user_idx" ON "user_addresses" ("user_id");--> statement-breakpoint
CREATE INDEX "auth_rate_limits_reset_at_idx" ON "auth_rate_limits" ("reset_at");--> statement-breakpoint
CREATE INDEX "restaurants_owner_idx" ON "restaurants" ("owner_id");--> statement-breakpoint
CREATE INDEX "restaurants_verification_status_idx" ON "restaurants" ("verification_status");--> statement-breakpoint
CREATE INDEX "menu_categories_restaurant_idx" ON "menu_categories" ("restaurant_id");--> statement-breakpoint
CREATE INDEX "menu_items_restaurant_idx" ON "menu_items" ("restaurant_id");--> statement-breakpoint
CREATE INDEX "menu_items_category_idx" ON "menu_items" ("category_id");--> statement-breakpoint
CREATE INDEX "driver_locations_driver_recorded_idx" ON "driver_locations" ("driver_id","recorded_at");--> statement-breakpoint
CREATE INDEX "order_items_order_idx" ON "order_items" ("order_id");--> statement-breakpoint
CREATE INDEX "order_items_menu_item_idx" ON "order_items" ("menu_item_id");--> statement-breakpoint
CREATE INDEX "orders_customer_idx" ON "orders" ("customer_id");--> statement-breakpoint
CREATE INDEX "orders_restaurant_idx" ON "orders" ("restaurant_id");--> statement-breakpoint
CREATE INDEX "orders_driver_idx" ON "orders" ("driver_id");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" ("status");--> statement-breakpoint
CREATE INDEX "orders_payment_status_idx" ON "orders" ("payment_status");--> statement-breakpoint
CREATE INDEX "order_status_history_order_idx" ON "order_status_history" ("order_id");--> statement-breakpoint
CREATE INDEX "order_status_history_created_idx" ON "order_status_history" ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "reviews_order_customer_unique" ON "reviews" ("order_id","customer_id");--> statement-breakpoint
CREATE INDEX "reviews_restaurant_idx" ON "reviews" ("restaurant_id");--> statement-breakpoint
CREATE INDEX "reviews_driver_idx" ON "reviews" ("driver_id");--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_addresses" ADD CONSTRAINT "user_addresses_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "restaurants" ADD CONSTRAINT "restaurants_owner_id_users_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "menu_categories" ADD CONSTRAINT "menu_categories_restaurant_id_restaurants_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_category_id_menu_categories_id_fkey" FOREIGN KEY ("category_id") REFERENCES "menu_categories"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_restaurant_id_restaurants_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "driver_locations" ADD CONSTRAINT "driver_locations_driver_id_driver_profiles_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "driver_profiles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "driver_profiles" ADD CONSTRAINT "driver_profiles_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_menu_item_id_menu_items_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_users_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_restaurant_id_restaurants_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_driver_id_driver_profiles_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "driver_profiles"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_order_id_orders_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_changed_by_users_id_fkey" FOREIGN KEY ("changed_by") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_customer_id_users_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_restaurant_id_restaurants_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id");--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_order_id_orders_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id");--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_driver_id_driver_profiles_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "driver_profiles"("id") ON DELETE SET NULL;