CREATE TABLE "auth_rate_limits" (
	"key" text PRIMARY KEY,
	"count" integer DEFAULT 0 NOT NULL,
	"reset_at" timestamp NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
