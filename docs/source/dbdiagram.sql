CREATE TABLE "accounts" (
  "id" uuid PRIMARY KEY,
  "email" varchar(50),
  "auth_provider" varchar(50),
  "external_id" varchar(50),
  "is_active" boolean,
  "email_verified_at" timestamp,
  "created_at" timestamp
);

CREATE TABLE "roles" (
  "id" int PRIMARY KEY,
  "name" varchar(32)
);

CREATE TABLE "account_roles" (
  "account_id" uuid,
  "role_id" int,
  "created_at" timestamp
);

CREATE TABLE "students" (
  "id" uuid PRIMARY KEY,
  "account_id" uuid,
  "first_name" varchar(50),
  "last_name" varchar(50),
  "contact_email" varchar(50),
  "phone" varchar(30),
  "date_of_birth" date,
  "is_active" boolean,
  "created_at" timestamp
);

CREATE TABLE "instructors" (
  "id" uuid PRIMARY KEY,
  "account_id" uuid,
  "first_name" varchar(50),
  "last_name" varchar(50),
  "bio" text,
  "created_at" timestamp
);

CREATE TABLE "class_types" (
  "id" uuid PRIMARY KEY,
  "name" varchar(50),
  "level" varchar(30),
  "duration_minutes" int,
  "description" text,
  "default_capacity" int,
  "is_active" boolean
);

CREATE TABLE "class_groups" (
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

CREATE TABLE "class_sessions" (
  "id" uuid PRIMARY KEY,
  "group_id" uuid,
  "starts_at" timestamp,
  "ends_at" timestamp,
  "status" varchar(20)
);

CREATE TABLE "enrollments" (
  "id" uuid PRIMARY KEY,
  "student_id" uuid,
  "group_id" uuid,
  "status" varchar(20),
  "enrolled_at" timestamp
);

CREATE TABLE "waitlist_entries" (
  "id" uuid PRIMARY KEY,
  "student_id" uuid,
  "group_id" uuid,
  "created_at" timestamp,
  "status" varchar(20)
);

CREATE TABLE "attendance_records" (
  "id" uuid PRIMARY KEY,
  "session_id" uuid,
  "student_id" uuid,
  "status" varchar(20),
  "marked_by_instr_id" uuid,
  "marked_at" timestamp
);

CREATE TABLE "pass_products" (
  "id" uuid PRIMARY KEY,
  "name" varchar(100),
  "description" text,
  "validity_months" int,
  "price_cents" int,
  "valid_from" date,
  "valid_to" date,
  "is_active" boolean
);

CREATE TABLE "purchases" (
  "id" uuid PRIMARY KEY,
  "student_id" uuid,
  "product_id" uuid,
  "amount_cents" int,
  "paid_at" timestamp,
  "method" varchar(20),
  "period_start" date,
  "period_end" date,
  "recorded_by_acc" uuid
);

CREATE TABLE "payment_allocations" (
  "id" uuid PRIMARY KEY,
  "purchase_id" uuid,
  "session_id" uuid,
  "month" date,
  "amount_cents" int
);

CREATE TABLE "email_verifications" (
  "id" uuid PRIMARY KEY,
  "account_id" uuid,
  "token" varchar(128),
  "sent_at" timestamp,
  "verified_at" timestamp
);

CREATE TABLE "deletion_requests" (
  "id" uuid PRIMARY KEY,
  "student_id" uuid,
  "requested_at" timestamp,
  "processed_at" timestamp,
  "status" varchar(20)
);

CREATE TABLE "group_messages" (
  "id" uuid PRIMARY KEY,
  "group_id" uuid,
  "sent_by_acc" uuid,
  "subject" varchar(200),
  "body" text,
  "sent_at" timestamp
);

CREATE UNIQUE INDEX ON "accounts" ("email");

CREATE UNIQUE INDEX ON "accounts" ("auth_provider", "external_id");

CREATE UNIQUE INDEX ON "account_roles" ("account_id", "role_id");

CREATE UNIQUE INDEX ON "enrollments" ("student_id", "group_id");

CREATE UNIQUE INDEX ON "waitlist_entries" ("student_id", "group_id");

CREATE INDEX ON "waitlist_entries" ("group_id", "created_at");

CREATE UNIQUE INDEX ON "attendance_records" ("session_id", "student_id");

CREATE UNIQUE INDEX ON "email_verifications" ("token");

ALTER TABLE "account_roles" ADD FOREIGN KEY ("account_id") REFERENCES "accounts" ("id");

ALTER TABLE "account_roles" ADD FOREIGN KEY ("role_id") REFERENCES "roles" ("id");

ALTER TABLE "students" ADD FOREIGN KEY ("account_id") REFERENCES "accounts" ("id");

ALTER TABLE "instructors" ADD FOREIGN KEY ("account_id") REFERENCES "accounts" ("id");

ALTER TABLE "class_groups" ADD FOREIGN KEY ("class_type_id") REFERENCES "class_types" ("id");

ALTER TABLE "class_groups" ADD FOREIGN KEY ("instructor_id") REFERENCES "instructors" ("id");

ALTER TABLE "class_sessions" ADD FOREIGN KEY ("group_id") REFERENCES "class_groups" ("id");

ALTER TABLE "enrollments" ADD FOREIGN KEY ("student_id") REFERENCES "students" ("id");

ALTER TABLE "enrollments" ADD FOREIGN KEY ("group_id") REFERENCES "class_groups" ("id");

ALTER TABLE "waitlist_entries" ADD FOREIGN KEY ("student_id") REFERENCES "students" ("id");

ALTER TABLE "waitlist_entries" ADD FOREIGN KEY ("group_id") REFERENCES "class_groups" ("id");

ALTER TABLE "attendance_records" ADD FOREIGN KEY ("session_id") REFERENCES "class_sessions" ("id");

ALTER TABLE "attendance_records" ADD FOREIGN KEY ("student_id") REFERENCES "students" ("id");

ALTER TABLE "attendance_records" ADD FOREIGN KEY ("marked_by_instr_id") REFERENCES "instructors" ("id");

ALTER TABLE "purchases" ADD FOREIGN KEY ("student_id") REFERENCES "students" ("id");

ALTER TABLE "purchases" ADD FOREIGN KEY ("product_id") REFERENCES "pass_products" ("id");

ALTER TABLE "purchases" ADD FOREIGN KEY ("recorded_by_acc") REFERENCES "accounts" ("id");

ALTER TABLE "payment_allocations" ADD FOREIGN KEY ("purchase_id") REFERENCES "purchases" ("id");

ALTER TABLE "payment_allocations" ADD FOREIGN KEY ("session_id") REFERENCES "class_sessions" ("id");

ALTER TABLE "email_verifications" ADD FOREIGN KEY ("account_id") REFERENCES "accounts" ("id");

ALTER TABLE "deletion_requests" ADD FOREIGN KEY ("student_id") REFERENCES "students" ("id");

ALTER TABLE "group_messages" ADD FOREIGN KEY ("group_id") REFERENCES "class_groups" ("id");

ALTER TABLE "group_messages" ADD FOREIGN KEY ("sent_by_acc") REFERENCES "accounts" ("id");
