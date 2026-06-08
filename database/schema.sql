-- NEXORITHM production relational schema draft for PostgreSQL.
-- Use a migration tool such as Prisma Migrate, Drizzle Kit, TypeORM migrations, or Flyway before production.

CREATE TABLE users (
  id UUID PRIMARY KEY,
  clerk_user_id TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  email TEXT UNIQUE NOT NULL,
  college_id UUID,
  role TEXT NOT NULL DEFAULT 'developer',
  is_open_for_hiring BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE colleges (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  country_code CHAR(2) NOT NULL DEFAULT 'IN'
);

ALTER TABLE users
  ADD CONSTRAINT users_college_id_fk FOREIGN KEY (college_id) REFERENCES colleges(id);

CREATE TABLE problems (
  id UUID PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  statement_html TEXT NOT NULL,
  success_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  xp_reward INTEGER NOT NULL,
  coin_reward INTEGER NOT NULL,
  is_premium BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE daily_challenges (
  id UUID PRIMARY KEY,
  challenge_date DATE NOT NULL,
  problem_id UUID NOT NULL REFERENCES problems(id),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  UNIQUE (challenge_date, difficulty)
);

CREATE TABLE test_cases (
  id UUID PRIMARY KEY,
  problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  input TEXT NOT NULL,
  expected_output TEXT NOT NULL,
  is_hidden BOOLEAN NOT NULL DEFAULT TRUE,
  position INTEGER NOT NULL
);

CREATE TABLE submissions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  problem_id UUID NOT NULL REFERENCES problems(id),
  language TEXT NOT NULL,
  code TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'accepted', 'wrong_answer', 'runtime_error', 'compilation_error', 'time_limit_exceeded')),
  runtime_ms INTEGER,
  memory_kb INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  judged_at TIMESTAMPTZ
);

CREATE TABLE submission_test_results (
  id UUID PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  test_case_id UUID NOT NULL REFERENCES test_cases(id),
  passed BOOLEAN NOT NULL,
  actual_output TEXT,
  runtime_ms INTEGER,
  memory_kb INTEGER
);

CREATE TABLE user_stats (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  xp INTEGER NOT NULL DEFAULT 0,
  coins INTEGER NOT NULL DEFAULT 0,
  reputation INTEGER NOT NULL DEFAULT 0,
  dev_rank INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  streak_shields INTEGER NOT NULL DEFAULT 0,
  solved_total INTEGER NOT NULL DEFAULT 0,
  solved_easy INTEGER NOT NULL DEFAULT 0,
  solved_medium INTEGER NOT NULL DEFAULT 0,
  solved_hard INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE reward_ledger (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  source_type TEXT NOT NULL,
  source_id UUID,
  xp_delta INTEGER NOT NULL DEFAULT 0,
  coin_delta INTEGER NOT NULL DEFAULT 0,
  reputation_delta INTEGER NOT NULL DEFAULT 0,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, source_type, source_id, reason)
);

CREATE TABLE missions (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  mission_type TEXT NOT NULL CHECK (mission_type IN ('Daily', 'Weekly', 'Monthly')),
  target_count INTEGER NOT NULL,
  xp_reward INTEGER NOT NULL,
  coin_reward INTEGER NOT NULL,
  active_from TIMESTAMPTZ NOT NULL,
  active_until TIMESTAMPTZ NOT NULL
);

CREATE TABLE user_mission_progress (
  user_id UUID NOT NULL REFERENCES users(id),
  mission_id UUID NOT NULL REFERENCES missions(id),
  current_count INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, mission_id)
);

CREATE TABLE badges (
  id UUID PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE user_badges (
  user_id UUID NOT NULL REFERENCES users(id),
  badge_id UUID NOT NULL REFERENCES badges(id),
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, badge_id)
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  provider TEXT NOT NULL DEFAULT 'razorpay',
  provider_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL,
  plan_code TEXT NOT NULL DEFAULT 'nexorithm_pro_monthly',
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE recruiter_organizations (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  billing_email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE recruiter_members (
  organization_id UUID NOT NULL REFERENCES recruiter_organizations(id),
  user_id UUID NOT NULL REFERENCES users(id),
  role TEXT NOT NULL DEFAULT 'member',
  PRIMARY KEY (organization_id, user_id)
);

CREATE TABLE interview_requests (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES recruiter_organizations(id),
  candidate_user_id UUID NOT NULL REFERENCES users(id),
  recruiter_user_id UUID NOT NULL REFERENCES users(id),
  role_title TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'requested',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX submissions_user_created_idx ON submissions(user_id, created_at DESC);
CREATE INDEX submissions_problem_status_idx ON submissions(problem_id, status);
CREATE INDEX user_stats_dev_rank_idx ON user_stats(dev_rank DESC);
CREATE INDEX users_username_idx ON users(username);
