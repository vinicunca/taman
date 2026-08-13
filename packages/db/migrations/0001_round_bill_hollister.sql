CREATE TABLE "event_credit" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"event_id" uuid NOT NULL,
	"talent_id" uuid,
	"user_id" uuid,
	"guest_name" text,
	"role" text NOT NULL,
	"note" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "event_credit_subject_check" CHECK (num_nonnulls("event_credit"."talent_id", "event_credit"."user_id", "event_credit"."guest_name") = 1)
);
--> statement-breakpoint
ALTER TABLE "event_credit" ADD CONSTRAINT "event_credit_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_credit" ADD CONSTRAINT "event_credit_talent_id_talent_id_fk" FOREIGN KEY ("talent_id") REFERENCES "public"."talent"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_credit" ADD CONSTRAINT "event_credit_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "event_credit_talent_uidx" ON "event_credit" USING btree ("event_id","talent_id","role") WHERE "event_credit"."talent_id" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "event_credit_user_uidx" ON "event_credit" USING btree ("event_id","user_id","role") WHERE "event_credit"."user_id" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "event_credit_eventId_idx" ON "event_credit" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "event_credit_talentId_idx" ON "event_credit" USING btree ("talent_id");--> statement-breakpoint
CREATE INDEX "event_credit_userId_idx" ON "event_credit" USING btree ("user_id");