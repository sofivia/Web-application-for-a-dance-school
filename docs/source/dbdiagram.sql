CREATE TABLE "account" (
  "id" uuid PRIMARY KEY,
  "email" varchar(50),
  "auth_provider" varchar(50),
  "external_id" varchar(50),
  "is_active" boolean,
  "email_verified_at" timestamp,
  "created_at" timestamp
);

CREATE TABLE "role" (
  "id" int PRIMARY KEY,
  "name" varchar(32)
);

CREATE TABLE "account_role" (
  "account_id" uuid,
  "role_id" int
);

CREATE TABLE "student" (
  "id" uuid PRIMARY KEY,
  "account_id" uuid,
  "first_name" varchar(50),
  "last_name" varchar(50),
  "contact_email" varchar(50),
  "phone" varchar(30),
  "is_active" boolean,
  "created_at" timestamp
);

CREATE TABLE "instructor" (
  "id" uuid PRIMARY KEY,
  "account_id" uuid,
  "first_name" varchar(50),
  "last_name" varchar(50),
  "created_at" timestamp
);

CREATE TABLE "email_verification" (
  "id" uuid PRIMARY KEY,
  "account_id" uuid,
  "token" varchar(128),
  "sent_at" timestamp,
  "verified_at" timestamp
);

CREATE TABLE "deletion_request" (
  "id" uuid PRIMARY KEY,
  "student_id" uuid,
  "requested_at" timestamp,
  "processed_at" timestamp,
  "status" varchar(20)
);

CREATE TABLE "class_type" (
  "id" uuid PRIMARY KEY,
  "name" varchar(50)
);

CREATE TABLE "class_group" (
  "id" uuid PRIMARY KEY,
  "class_type_id" uuid,
  "instructor_id" uuid,
  "weekday" int,
  "start_time" time,
  "end_time" time,
  "location" varchar(100),
  "capacity" int,
  "is_active" boolean
);

CREATE TABLE "class_session" (
  "id" uuid PRIMARY KEY,
  "group_id" uuid,
  "starts_at" timestamp,
  "ends_at" timestamp,
  "status" varchar(20)
);

CREATE TABLE "enrollment" (
  "id" uuid PRIMARY KEY,
  "student_id" uuid,
  "group_id" uuid,
  "status" varchar(20),
  "enrolled_at" timestamp
);

CREATE TABLE "waitlist_entry" (
  "id" uuid PRIMARY KEY,
  "student_id" uuid,
  "group_id" uuid,
  "created_at" timestamp,
  "status" varchar(20)
);

CREATE TABLE "attendance_record" (
  "id" uuid PRIMARY KEY,
  "session_id" uuid,
  "student_id" uuid,
  "status" varchar(20),
  "marked_by_instr_id" uuid,
  "marked_at" timestamp
);

CREATE TABLE "pass_product" (
  "id" uuid PRIMARY KEY,
  "name" varchar(100),
  "description" text,
  "sessions_per_week" int,
  "price_cents" int,
  "billing_period" varchar(20),
  "is_active" boolean
);

CREATE TABLE "pass_instance" (
  "id" uuid PRIMARY KEY,
  "student_id" uuid,
  "product_id" uuid,
  "month_for" date,
  "paid_at" timestamp,
  "payment_due" date,
  "amount_cents" int,
  "discount_cents" int,
  "recorded_by_acc" uuid
);

CREATE TABLE "pass_usage" (
  "id" uuid PRIMARY KEY,
  "pass_instance_id" uuid,
  "session_id" uuid,
  "used_at" timestamp
);

CREATE UNIQUE INDEX ON "account" ("email");

CREATE UNIQUE INDEX ON "account" ("auth_provider", "external_id");

CREATE UNIQUE INDEX ON "account_role" ("account_id", "role_id");

CREATE UNIQUE INDEX ON "email_verification" ("token");

CREATE UNIQUE INDEX ON "enrollment" ("student_id", "group_id");

CREATE UNIQUE INDEX ON "waitlist_entry" ("student_id", "group_id");

CREATE INDEX ON "waitlist_entry" ("group_id", "created_at");

CREATE UNIQUE INDEX ON "attendance_record" ("session_id", "student_id");

ALTER TABLE "account_role" ADD FOREIGN KEY ("account_id") REFERENCES "account" ("id");

ALTER TABLE "account_role" ADD FOREIGN KEY ("role_id") REFERENCES "role" ("id");

ALTER TABLE "student" ADD FOREIGN KEY ("account_id") REFERENCES "account" ("id");

ALTER TABLE "instructor" ADD FOREIGN KEY ("account_id") REFERENCES "account" ("id");

ALTER TABLE "email_verification" ADD FOREIGN KEY ("account_id") REFERENCES "account" ("id");

ALTER TABLE "deletion_request" ADD FOREIGN KEY ("student_id") REFERENCES "student" ("id");

ALTER TABLE "class_group" ADD FOREIGN KEY ("class_type_id") REFERENCES "class_type" ("id");

ALTER TABLE "class_group" ADD FOREIGN KEY ("instructor_id") REFERENCES "instructor" ("id");

ALTER TABLE "class_session" ADD FOREIGN KEY ("group_id") REFERENCES "class_group" ("id");

ALTER TABLE "enrollment" ADD FOREIGN KEY ("student_id") REFERENCES "student" ("id");

ALTER TABLE "enrollment" ADD FOREIGN KEY ("group_id") REFERENCES "class_group" ("id");

ALTER TABLE "waitlist_entry" ADD FOREIGN KEY ("student_id") REFERENCES "student" ("id");

ALTER TABLE "waitlist_entry" ADD FOREIGN KEY ("group_id") REFERENCES "class_group" ("id");

ALTER TABLE "attendance_record" ADD FOREIGN KEY ("session_id") REFERENCES "class_session" ("id");

ALTER TABLE "attendance_record" ADD FOREIGN KEY ("student_id") REFERENCES "student" ("id");

ALTER TABLE "attendance_record" ADD FOREIGN KEY ("marked_by_instr_id") REFERENCES "instructor" ("id");

ALTER TABLE "pass_instance" ADD FOREIGN KEY ("student_id") REFERENCES "student" ("id");

ALTER TABLE "pass_instance" ADD FOREIGN KEY ("product_id") REFERENCES "pass_product" ("id");

ALTER TABLE "pass_instance" ADD FOREIGN KEY ("recorded_by_acc") REFERENCES "account" ("id");

ALTER TABLE "pass_usage" ADD FOREIGN KEY ("pass_instance_id") REFERENCES "pass_instance" ("id");

ALTER TABLE "pass_usage" ADD FOREIGN KEY ("session_id") REFERENCES "class_session" ("id");
