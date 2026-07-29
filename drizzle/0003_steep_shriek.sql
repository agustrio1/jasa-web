CREATE TABLE "service_packages" (
	"id" text PRIMARY KEY NOT NULL,
	"service_id" text NOT NULL,
	"name" text NOT NULL,
	"price" text NOT NULL,
	"price_note" text,
	"features" jsonb,
	"is_popular" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "service_packages" ADD CONSTRAINT "service_packages_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;