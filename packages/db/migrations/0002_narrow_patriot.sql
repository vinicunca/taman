CREATE TABLE "booking_talent" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"organization_id" uuid NOT NULL,
	"talent_id" uuid NOT NULL,
	"role" text NOT NULL,
	"client_name" text,
	"location" text,
	"performed_at" timestamp with time zone NOT NULL,
	"note" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "booking_talent" ADD CONSTRAINT "booking_talent_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_talent" ADD CONSTRAINT "booking_talent_talent_id_talent_id_fk" FOREIGN KEY ("talent_id") REFERENCES "public"."talent"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bookingTalent_organizationId_idx" ON "booking_talent" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "bookingTalent_talentId_idx" ON "booking_talent" USING btree ("talent_id");