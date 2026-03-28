-- ============================================================
-- WATCHR — Complete Supabase SQL Schema
-- Covers: Backend (Flask API) + AI Engine telemetry
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 1. LOGS  (used by db.add_log — every event the backend logs)
-- ────────────────────────────────────────────────────────────
create table if not exists logs (
  id          bigserial primary key,
  event       text        not null,       -- e.g. THEFT_DETECTED, FIRE_DETECTED, SAFE
  details     jsonb       default '{}',   -- full event payload
  time        timestamptz not null default now()
);

create index if not exists logs_time_idx   on logs (time desc);
create index if not exists logs_event_idx  on logs (event);


-- ────────────────────────────────────────────────────────────
-- 2. CUSTOMERS  (used by db.upsert_customer — person tracking)
-- ────────────────────────────────────────────────────────────
create table if not exists customers (
  id            bigserial   primary key,
  customer_id   text        not null unique,   -- tracker ID e.g. "c0_42"
  first_seen    timestamptz not null default now(),
  last_seen     timestamptz not null default now(),
  status        text        not null default 'ACTIVE',   -- ACTIVE | LEFT
  dwell_time    float       not null default 0           -- seconds in store
);

create index if not exists customers_status_idx     on customers (status);
create index if not exists customers_last_seen_idx  on customers (last_seen desc);


-- ────────────────────────────────────────────────────────────
-- 3. INCIDENTS  (persistent record of every security event)
-- ────────────────────────────────────────────────────────────
create table if not exists incidents (
  id              bigserial   primary key,
  incident_type   text        not null,   -- THEFT_DETECTED | FIRE_DETECTED | THERMAL_ALERT | UNAUTHORIZED_ACCESS | CROWD_DENSITY_WARNING | CUSTOMER_UNATTENDED
  severity        text        not null default 'medium',  -- critical | high | medium | low | info
  store_id        text        not null default 'STR-001',
  camera_id       int         default 1,
  zone            text,
  confidence      float,
  clip_url        text,                   -- HTTP path to evidence clip
  suspect_ids     text[],                 -- tracker IDs of suspects
  details         jsonb       default '{}',
  resolved        boolean     not null default false,
  resolved_at     timestamptz,
  created_at      timestamptz not null default now()
);

create index if not exists incidents_type_idx        on incidents (incident_type);
create index if not exists incidents_created_idx     on incidents (created_at desc);
create index if not exists incidents_store_idx       on incidents (store_id);
create index if not exists incidents_resolved_idx    on incidents (resolved);


-- ────────────────────────────────────────────────────────────
-- 4. CAMERAS  (store camera registry + health from AI engine)
-- ────────────────────────────────────────────────────────────
create table if not exists cameras (
  id          bigserial   primary key,
  camera_id   text        not null unique,   -- CAM-1, CAM-2 …
  store_id    text        not null default 'STR-001',
  zone        text,                          -- shelf | billing | exit | entrance
  source_url  text,                          -- RTSP / webcam index
  status      text        not null default 'online',   -- online | offline | degraded
  fps         float       default 30,
  last_seen   timestamptz default now()
);

create index if not exists cameras_store_idx   on cameras (store_id);
create index if not exists cameras_status_idx  on cameras (status);


-- ────────────────────────────────────────────────────────────
-- 5. ZONE_TELEMETRY  (per-frame zone occupancy from AI engine)
-- ────────────────────────────────────────────────────────────
create table if not exists zone_telemetry (
  id              bigserial   primary key,
  camera_id       int         not null default 1,
  frame_number    int         not null,
  timestamp       timestamptz not null default now(),
  people_count    int         not null default 0,
  zone_counts     jsonb       default '{}',   -- {"shelf":3,"billing":1,"exit":0}
  zone_dwell_times jsonb      default '{}',   -- {"pid":{"zone":seconds}}
  roles           jsonb       default '{}',   -- {"pid":"STAFF"|"CUSTOMER"|"SUSPECT"}
  theft           boolean     not null default false,
  fire            boolean     not null default false,
  smoke           boolean     not null default false,
  fire_confidence float       default 0.0
);

-- Partial index: only index frames where something happened
create index if not exists zone_tel_threat_idx  on zone_telemetry (timestamp desc) where (theft = true or fire = true);
create index if not exists zone_tel_ts_idx      on zone_telemetry (timestamp desc);


-- ────────────────────────────────────────────────────────────
-- 6. GEMINI_INSIGHTS  (persisted Gemini analytics snapshots)
-- ────────────────────────────────────────────────────────────
create table if not exists gemini_insights (
  id              bigserial   primary key,
  snapshot        jsonb       not null,    -- full Gemini JSON response
  employees       jsonb       default '[]',
  demographics    jsonb       default '[]',
  footfall_hourly jsonb       default '[]',
  heatmap_zones   jsonb       default '[]',
  dwell_by_zone   jsonb       default '[]',
  kpi_summary     jsonb       default '{}',
  store_narrative text,
  created_at      timestamptz not null default now()
);

create index if not exists gemini_insights_ts_idx  on gemini_insights (created_at desc);


-- ────────────────────────────────────────────────────────────
-- 7. STORES  (multi-store registry for Settings page)
-- ────────────────────────────────────────────────────────────
create table if not exists stores (
  id          text        primary key,          -- STR-001
  name        text        not null,
  address     text,
  status      text        not null default 'online',
  created_at  timestamptz not null default now()
);

-- Seed default store
insert into stores (id, name, address, status)
values ('STR-001', 'Store Alpha', '123 Main Street', 'online')
on conflict (id) do nothing;


-- ────────────────────────────────────────────────────────────
-- 8. EMPLOYEES / STAFF  (Gemini-identified staff with roles)
-- ────────────────────────────────────────────────────────────
create table if not exists employees (
  id                text        primary key,    -- EMP-001
  name              text        not null,
  role              text        not null default 'Floor Associate',
  store_id          text        references stores (id) default 'STR-001',
  shift             text,                       -- Morning Shift | Evening Shift
  zone              text,
  status            text        not null default 'active',
  uniform_color     text,                       -- K-Means dominant colour hex
  face_confidence   float       default 0.0,
  tasks_completed   int         default 0,
  performance_score int         default 100,
  last_seen         timestamptz default now(),
  created_at        timestamptz not null default now()
);

create index if not exists employees_store_idx   on employees (store_id);
create index if not exists employees_status_idx  on employees (status);


-- ────────────────────────────────────────────────────────────
-- 9. ROW-LEVEL SECURITY (RLS) — enable for all tables
-- ────────────────────────────────────────────────────────────
-- Backend uses the service-role key (bypasses RLS) so we
-- enable RLS but only restrict public (anon) access where needed.

alter table logs              enable row level security;
alter table customers         enable row level security;
alter table incidents         enable row level security;
alter table cameras           enable row level security;
alter table zone_telemetry    enable row level security;
alter table gemini_insights   enable row level security;
alter table stores            enable row level security;
alter table employees         enable row level security;

-- Allow the backend service role to do everything (default behaviour)
-- Block anonymous reads on sensitive tables
create policy "block anon on logs"
  on logs for select using (auth.role() = 'service_role');

create policy "block anon on incidents"
  on incidents for select using (auth.role() = 'service_role');

create policy "block anon on zone_telemetry"
  on zone_telemetry for select using (auth.role() = 'service_role');

-- Allow public read on non-sensitive tables (stores, cameras, employees)
-- so the frontend can optionally query Supabase directly
create policy "public read stores"
  on stores for select using (true);

create policy "public read cameras"
  on cameras for select using (true);

create policy "public read employees"
  on employees for select using (true);

create policy "public read gemini_insights"
  on gemini_insights for select using (true);


-- ────────────────────────────────────────────────────────────
-- 10. REALTIME  (enable for live dashboard subscriptions)
-- ────────────────────────────────────────────────────────────
-- Run in Supabase Dashboard → Database → Replication
-- OR uncomment below (requires pg_publication to exist):

-- alter publication supabase_realtime add table logs;
-- alter publication supabase_realtime add table incidents;
-- alter publication supabase_realtime add table customers;
