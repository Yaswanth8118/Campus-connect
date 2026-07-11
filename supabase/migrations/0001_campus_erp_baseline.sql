/*
  ============================================================================
  Campus Connect — Campus Management / University ERP
  Baseline schema (normalized, 3NF) + RBAC via Row Level Security
  ----------------------------------------------------------------------------
  Roles: admin, coordinator, faculty, student
  Auth : Supabase Auth (auth.users) is the identity provider.
         Application profile lives in public.users (linked by auth_user_id).
  ============================================================================

  This single migration is the authoritative baseline. It is idempotent:
  it drops the application tables (if present) and recreates the full schema,
  so a clean, known-good state is produced regardless of prior partial runs.
  Safe to run on a fresh project or to reset a dev project (no production data).
*/

-- ─────────────────────────────────────────────────────────────────────────
-- 0. Reset (dependency-safe)
-- ─────────────────────────────────────────────────────────────────────────
drop table if exists audit_logs        cascade;
drop table if exists reports           cascade;
drop table if exists announcements     cascade;
drop table if exists grades            cascade;
drop table if exists attendance        cascade;
drop table if exists event_registrations cascade;
drop table if exists events            cascade;
drop table if exists subjects          cascade;
drop table if exists rooms             cascade;
drop table if exists coordinators      cascade;
drop table if exists students          cascade;
drop table if exists faculty           cascade;
drop table if exists users             cascade;
drop table if exists departments       cascade;
drop table if exists roles             cascade;

drop function if exists app_user_id()       cascade;
drop function if exists app_role()           cascade;
drop function if exists app_department_id()  cascade;
drop function if exists app_student_id()     cascade;
drop function if exists app_faculty_id()     cascade;
drop function if exists handle_new_auth_user() cascade;
drop function if exists set_updated_at()      cascade;

-- ─────────────────────────────────────────────────────────────────────────
-- 1. Reference tables
-- ─────────────────────────────────────────────────────────────────────────
create table roles (
  id          smallint generated always as identity primary key,
  role_name   text unique not null check (role_name in ('admin','coordinator','faculty','student')),
  description text default ''
);

insert into roles (role_name, description) values
  ('admin',       'Full platform control and user management'),
  ('coordinator', 'Manages assigned events, students and faculty within a department'),
  ('faculty',     'Teaches subjects, marks attendance and enters grades'),
  ('student',     'Views own attendance, grades, events and announcements');

create table departments (
  id              uuid primary key default gen_random_uuid(),
  department_name text not null,
  department_code text unique not null,
  hod_id          uuid,                              -- FK added after users exists
  description     text default '',
  created_at      timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- 2. Core identity: users (application profile) linked to auth.users
-- ─────────────────────────────────────────────────────────────────────────
create table users (
  id            uuid primary key default gen_random_uuid(),
  auth_user_id  uuid unique references auth.users(id) on delete cascade,
  username      text unique not null,
  email         text unique not null,
  full_name     text not null default '',
  phone         text default '',
  gender        text check (gender in ('male','female','other','')) default '',
  role_id       smallint not null references roles(id),
  department_id uuid references departments(id) on delete set null,
  status        text not null default 'active' check (status in ('active','inactive')),
  profile_image text default '',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table departments
  add constraint departments_hod_fk
  foreign key (hod_id) references users(id) on delete set null;

-- ─────────────────────────────────────────────────────────────────────────
-- 3. Role-specific profiles
-- ─────────────────────────────────────────────────────────────────────────
create table faculty (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid unique not null references users(id) on delete cascade,
  employee_id   text unique not null,
  department_id uuid references departments(id) on delete set null,
  designation   text default 'Assistant Professor'
);

create table students (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid unique not null references users(id) on delete cascade,
  roll_number   text unique not null,
  department_id uuid references departments(id) on delete set null,
  semester      smallint check (semester between 1 and 12),
  section       text default 'A',
  year          smallint
);

create table coordinators (
  id            uuid primary key default gen_random_uuid(),
  faculty_id    uuid not null references faculty(id) on delete cascade,
  department_id uuid not null references departments(id) on delete cascade,
  unique (faculty_id, department_id)
);

-- ─────────────────────────────────────────────────────────────────────────
-- 4. Academic entities
-- ─────────────────────────────────────────────────────────────────────────
create table subjects (
  id            uuid primary key default gen_random_uuid(),
  subject_name  text not null,
  subject_code  text unique not null,
  semester      smallint check (semester between 1 and 12),
  department_id uuid references departments(id) on delete cascade,
  faculty_id    uuid references faculty(id) on delete set null,
  credits       smallint not null default 3 check (credits between 0 and 10)
);

create table rooms (
  id          uuid primary key default gen_random_uuid(),
  room_number text unique not null,
  building    text default '',
  floor       smallint default 0,
  capacity    integer not null default 0 check (capacity >= 0),
  room_type   text default 'classroom' check (room_type in ('classroom','lab','seminar','auditorium','office')),
  status      text default 'available' check (status in ('available','occupied','maintenance')),
  created_at  timestamptz not null default now()
);

create table events (
  id             uuid primary key default gen_random_uuid(),
  event_name     text not null,
  description    text default '',
  coordinator_id uuid references coordinators(id) on delete set null,
  room_id        uuid references rooms(id) on delete set null,
  department_id  uuid references departments(id) on delete cascade,
  start_date     timestamptz not null,
  end_date       timestamptz not null,
  status         text default 'upcoming' check (status in ('upcoming','live','completed','cancelled')),
  created_at     timestamptz not null default now(),
  check (end_date >= start_date)
);

create table event_registrations (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references students(id) on delete cascade,
  event_id      uuid not null references events(id) on delete cascade,
  registered_on timestamptz not null default now(),
  status        text default 'registered' check (status in ('registered','attended','cancelled')),
  unique (student_id, event_id)
);

-- ─────────────────────────────────────────────────────────────────────────
-- 5. Attendance & grades (per-student sensitive data)
-- ─────────────────────────────────────────────────────────────────────────
create table attendance (
  id         uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  subject_id uuid not null references subjects(id) on delete cascade,
  faculty_id uuid references faculty(id) on delete set null,
  date       date not null default current_date,
  status     text not null default 'present' check (status in ('present','absent','late','excused')),
  remarks    text default '',
  created_at timestamptz not null default now(),
  unique (student_id, subject_id, date)
);

create table grades (
  id               uuid primary key default gen_random_uuid(),
  student_id       uuid not null references students(id) on delete cascade,
  subject_id       uuid not null references subjects(id) on delete cascade,
  faculty_id       uuid references faculty(id) on delete set null,
  internal_marks   numeric(5,2) default 0 check (internal_marks  >= 0),
  external_marks   numeric(5,2) default 0 check (external_marks  >= 0),
  assignment_marks numeric(5,2) default 0 check (assignment_marks>= 0),
  lab_marks        numeric(5,2) default 0 check (lab_marks       >= 0),
  final_grade      text default '' check (final_grade in ('A+','A','B','C','D','E','F','')),
  cgpa             numeric(4,2) default 0 check (cgpa between 0 and 10),
  updated_at       timestamptz not null default now(),
  unique (student_id, subject_id)
);

-- ─────────────────────────────────────────────────────────────────────────
-- 6. Communication & reporting
-- ─────────────────────────────────────────────────────────────────────────
create table announcements (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text default '',
  department_id uuid references departments(id) on delete cascade,   -- null = campus-wide
  created_by    uuid references users(id) on delete set null,
  created_at    timestamptz not null default now()
);

create table reports (
  id            uuid primary key default gen_random_uuid(),
  report_type   text not null check (report_type in ('attendance','grades','events','department','faculty','rooms','students')),
  generated_by  uuid references users(id) on delete set null,
  department_id uuid references departments(id) on delete set null,
  payload       jsonb default '{}'::jsonb,
  created_at    timestamptz not null default now()
);

create table audit_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references users(id) on delete set null,
  action      text not null,
  entity      text default '',
  entity_id   uuid,
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- 7. Indexes (foreign keys + common filters)
-- ─────────────────────────────────────────────────────────────────────────
create index idx_users_role          on users(role_id);
create index idx_users_department     on users(department_id);
create index idx_faculty_department   on faculty(department_id);
create index idx_students_department  on students(department_id);
create index idx_students_sem_sec     on students(semester, section);
create index idx_subjects_department  on subjects(department_id);
create index idx_subjects_faculty     on subjects(faculty_id);
create index idx_events_department    on events(department_id);
create index idx_events_coordinator   on events(coordinator_id);
create index idx_events_room          on events(room_id);
create index idx_event_reg_student    on event_registrations(student_id);
create index idx_event_reg_event      on event_registrations(event_id);
create index idx_attendance_student   on attendance(student_id);
create index idx_attendance_subject   on attendance(subject_id);
create index idx_attendance_date      on attendance(date);
create index idx_grades_student       on grades(student_id);
create index idx_grades_subject       on grades(subject_id);
create index idx_announcements_dept   on announcements(department_id);
create index idx_audit_user           on audit_logs(user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- 8. Helper functions (SECURITY DEFINER → bypass RLS, prevent recursion)
-- ─────────────────────────────────────────────────────────────────────────
create function app_user_id() returns uuid
  language sql stable security definer set search_path = public as $$
  select id from users where auth_user_id = auth.uid()
$$;

create function app_role() returns text
  language sql stable security definer set search_path = public as $$
  select r.role_name from users u join roles r on r.id = u.role_id
  where u.auth_user_id = auth.uid()
$$;

create function app_department_id() returns uuid
  language sql stable security definer set search_path = public as $$
  select department_id from users where auth_user_id = auth.uid()
$$;

create function app_student_id() returns uuid
  language sql stable security definer set search_path = public as $$
  select s.id from students s join users u on u.id = s.user_id
  where u.auth_user_id = auth.uid()
$$;

create function app_faculty_id() returns uuid
  language sql stable security definer set search_path = public as $$
  select f.id from faculty f join users u on u.id = f.user_id
  where u.auth_user_id = auth.uid()
$$;

-- keep updated_at fresh
create function set_updated_at() returns trigger
  language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger trg_users_updated  before update on users
  for each row execute function set_updated_at();
create trigger trg_grades_updated before update on grades
  for each row execute function set_updated_at();

-- auto-provision a users row when someone signs up through Supabase Auth
create function handle_new_auth_user() returns trigger
  language plpgsql security definer set search_path = public as $$
declare
  v_role_id smallint;
  v_username text;
begin
  select id into v_role_id from roles
    where role_name = coalesce(new.raw_user_meta_data->>'role', 'student');
  if v_role_id is null then
    select id into v_role_id from roles where role_name = 'student';
  end if;

  v_username := coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1));
  -- guarantee uniqueness
  if exists (select 1 from users where username = v_username) then
    v_username := v_username || '_' || substr(new.id::text, 1, 6);
  end if;

  insert into users (auth_user_id, username, email, full_name, phone, role_id)
  values (
    new.id,
    v_username,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    v_role_id
  );
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_auth_user();

-- ─────────────────────────────────────────────────────────────────────────
-- 9. Row Level Security
-- ─────────────────────────────────────────────────────────────────────────
alter table roles               enable row level security;
alter table departments         enable row level security;
alter table users               enable row level security;
alter table faculty             enable row level security;
alter table students            enable row level security;
alter table coordinators        enable row level security;
alter table subjects            enable row level security;
alter table rooms               enable row level security;
alter table events              enable row level security;
alter table event_registrations enable row level security;
alter table attendance          enable row level security;
alter table grades              enable row level security;
alter table announcements       enable row level security;
alter table reports             enable row level security;
alter table audit_logs          enable row level security;

-- Reference/directory data: readable by any authenticated user
create policy read_roles        on roles        for select to authenticated using (true);
create policy read_departments  on departments  for select to authenticated using (true);
create policy read_faculty      on faculty      for select to authenticated using (true);
create policy read_students     on students     for select to authenticated using (true);
create policy read_coordinators on coordinators for select to authenticated using (true);
create policy read_subjects     on subjects     for select to authenticated using (true);
create policy read_rooms        on rooms        for select to authenticated using (true);
create policy read_events       on events       for select to authenticated using (true);
create policy read_announcements on announcements for select to authenticated using (true);

-- Admin-only writes on structural tables
create policy admin_write_departments  on departments  for all to authenticated
  using (app_role() = 'admin') with check (app_role() = 'admin');
create policy admin_write_faculty       on faculty       for all to authenticated
  using (app_role() = 'admin') with check (app_role() = 'admin');
create policy admin_write_students      on students      for all to authenticated
  using (app_role() = 'admin') with check (app_role() = 'admin');
create policy admin_write_coordinators  on coordinators  for all to authenticated
  using (app_role() = 'admin') with check (app_role() = 'admin');
create policy admin_write_rooms         on rooms         for all to authenticated
  using (app_role() = 'admin') with check (app_role() = 'admin');

-- Subjects: admin or coordinator manage
create policy manage_subjects on subjects for all to authenticated
  using (app_role() in ('admin','coordinator'))
  with check (app_role() in ('admin','coordinator'));

-- USERS table
create policy users_select on users for select to authenticated
  using (
    app_role() = 'admin'
    or id = app_user_id()
    or department_id = app_department_id()
  );
create policy users_admin_write on users for all to authenticated
  using (app_role() = 'admin') with check (app_role() = 'admin');
create policy users_update_self on users for update to authenticated
  using (id = app_user_id()) with check (id = app_user_id());

-- EVENTS: admin + coordinator manage
create policy events_write on events for all to authenticated
  using (app_role() in ('admin','coordinator'))
  with check (app_role() in ('admin','coordinator'));

-- EVENT REGISTRATIONS
create policy event_reg_select on event_registrations for select to authenticated
  using (
    app_role() in ('admin','coordinator')
    or student_id = app_student_id()
  );
create policy event_reg_student_write on event_registrations for all to authenticated
  using (student_id = app_student_id())
  with check (student_id = app_student_id());

-- ATTENDANCE
create policy attendance_select on attendance for select to authenticated
  using (
    app_role() = 'admin'
    or student_id = app_student_id()
    or faculty_id = app_faculty_id()
    or exists (select 1 from subjects s
               where s.id = attendance.subject_id
               and s.department_id = app_department_id()
               and app_role() = 'coordinator')
  );
create policy attendance_faculty_write on attendance for all to authenticated
  using (app_role() = 'admin' or faculty_id = app_faculty_id())
  with check (app_role() = 'admin' or faculty_id = app_faculty_id());

-- GRADES
create policy grades_select on grades for select to authenticated
  using (
    app_role() = 'admin'
    or student_id = app_student_id()
    or faculty_id = app_faculty_id()
    or exists (select 1 from subjects s
               where s.id = grades.subject_id
               and s.department_id = app_department_id()
               and app_role() = 'coordinator')
  );
create policy grades_faculty_write on grades for all to authenticated
  using (app_role() = 'admin' or faculty_id = app_faculty_id())
  with check (app_role() = 'admin' or faculty_id = app_faculty_id());

-- ANNOUNCEMENTS: admin/coordinator/faculty create
create policy announcements_write on announcements for all to authenticated
  using (app_role() in ('admin','coordinator','faculty'))
  with check (app_role() in ('admin','coordinator','faculty'));

-- REPORTS: admin all; author sees own
create policy reports_select on reports for select to authenticated
  using (app_role() = 'admin' or generated_by = app_user_id());
create policy reports_write on reports for all to authenticated
  using (app_role() in ('admin','coordinator','faculty'))
  with check (app_role() in ('admin','coordinator','faculty'));

-- AUDIT LOGS: admin read; any authenticated action can be logged
create policy audit_admin_read on audit_logs for select to authenticated
  using (app_role() = 'admin');
create policy audit_insert on audit_logs for insert to authenticated
  with check (true);

-- ─────────────────────────────────────────────────────────────────────────
-- 10. Seed reference data (safe, non-user)
-- ─────────────────────────────────────────────────────────────────────────
insert into departments (department_name, department_code, description) values
  ('Computer Science & Engineering', 'CSE', 'Computing, software and systems'),
  ('Electronics & Communication',    'ECE', 'Electronics, signals and communication'),
  ('Mechanical Engineering',         'MEE', 'Design, thermal and manufacturing'),
  ('Administration',                 'ADM', 'Campus administration')
on conflict (department_code) do nothing;

insert into rooms (room_number, building, floor, capacity, room_type) values
  ('A-101', 'Block A', 1, 60, 'classroom'),
  ('A-102', 'Block A', 1, 60, 'classroom'),
  ('LAB-1', 'Block B', 2, 30, 'lab'),
  ('AUD-1', 'Block C', 0, 250, 'auditorium')
on conflict (room_number) do nothing;
