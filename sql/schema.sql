-- ============================================================
--  APLIKASI.JOB — Database Schema (Sequelize / MySQL)
--  Roles: admin | applicant | company | recruiter
-- ============================================================

CREATE DATABASE IF NOT EXISTS job_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE job_portal;

-- ── 1. USERS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  email       VARCHAR(100)  NOT NULL UNIQUE,
  password    VARCHAR(255)  NOT NULL,
  role        ENUM('admin','applicant','company','recruiter') DEFAULT 'applicant',
  company_id  INT NULL,                    -- untuk recruiter: ID perusahaan tempat bekerja
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── 2. PROFILES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT          NOT NULL UNIQUE,
  full_name        VARCHAR(120),
  phone            VARCHAR(20),
  gender           ENUM('laki-laki','perempuan'),
  date_of_birth    DATE,
  bio              TEXT,
  photo_url        VARCHAR(255),
  location         VARCHAR(120),
  education        VARCHAR(200),
  education_level  ENUM('SMA/SMK','D3','S1','S2','S3'),
  experience_years INT          DEFAULT 0,
  skills           JSON,
  cv_url           VARCHAR(255),
  linkedin_url     VARCHAR(255),
  github_url       VARCHAR(255),
  created_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── 3. COMPANIES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS companies (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  owner_user_id INT NULL,
  name          VARCHAR(160) NOT NULL,
  email         VARCHAR(120),
  phone         VARCHAR(20),
  description   TEXT,
  website       VARCHAR(255),
  location      VARCHAR(120),
  industry      VARCHAR(100),
  company_size  ENUM('1-10','11-50','51-200','201-500','500+'),
  logo_url      VARCHAR(255),
  is_verified   TINYINT(1)   DEFAULT 0,
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_companies_owner FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Tambahkan FK company_id di users setelah tabel companies dibuat
ALTER TABLE users
  ADD CONSTRAINT fk_users_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL;

-- ── 4. JOB CATEGORIES ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS job_categories (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed kategori umum
INSERT IGNORE INTO job_categories (name) VALUES
  ('Teknologi Informasi'),
  ('Keuangan & Akuntansi'),
  ('Pemasaran & Iklan'),
  ('Desain & Kreatif'),
  ('Penjualan'),
  ('Sumber Daya Manusia'),
  ('Pendidikan'),
  ('Kesehatan'),
  ('Teknik'),
  ('Hukum'),
  ('Logistik & Distribusi'),
  ('Layanan Pelanggan'),
  ('Manajemen'),
  ('Lainnya');

-- ── 5. JOBS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jobs (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  company_id           INT          NOT NULL,
  category_id          INT          NULL,
  title                VARCHAR(160) NOT NULL,
  description          TEXT,
  location             VARCHAR(120),
  job_type             ENUM('full-time','part-time','contract','internship','freelance') DEFAULT 'full-time',
  education_required   ENUM('SMA/SMK','D3','S1','S2','S3'),
  experience_min_years INT          DEFAULT 0,
  salary_min           BIGINT       NULL,
  salary_max           BIGINT       NULL,
  required_skills      JSON,
  deadline             DATE,
  status               ENUM('open','closed') DEFAULT 'open',
  created_at           TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_jobs_company  FOREIGN KEY (company_id)  REFERENCES companies(id)      ON DELETE CASCADE,
  CONSTRAINT fk_jobs_category FOREIGN KEY (category_id) REFERENCES job_categories(id) ON DELETE SET NULL
);

-- ── 6. APPLICATIONS (LAMARAN) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS applications (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  job_id            INT  NOT NULL,
  applicant_user_id INT  NOT NULL,
  cover_letter      TEXT,
  status            ENUM('Applied','Reviewed','Interview','Accepted','Rejected') DEFAULT 'Applied',
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_job_applicant (job_id, applicant_user_id),
  CONSTRAINT fk_app_job      FOREIGN KEY (job_id)            REFERENCES jobs(id)  ON DELETE CASCADE,
  CONSTRAINT fk_app_applicant FOREIGN KEY (applicant_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── 7. INTERVIEWS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS interviews (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT          NOT NULL,
  scheduled_at   DATETIME     NOT NULL,
  meeting_link   VARCHAR(255),
  location       VARCHAR(255),
  notes          TEXT,
  status         ENUM('scheduled','completed','cancelled') DEFAULT 'scheduled',
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_interview_app FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

-- ── 8. SHORTLISTS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shortlists (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT NOT NULL,
  recruiter_id   INT NOT NULL,
  notes          TEXT,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_shortlist_app_recruiter (application_id, recruiter_id),
  CONSTRAINT fk_shortlist_app      FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
  CONSTRAINT fk_shortlist_recruiter FOREIGN KEY (recruiter_id)   REFERENCES users(id)        ON DELETE CASCADE
);

-- ── 9. AUDIT LOGS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  actor_user_id INT          NULL,
  entity_type   VARCHAR(40)  NOT NULL,
  entity_id     INT          NOT NULL,
  action        VARCHAR(40)  NOT NULL,
  from_status   VARCHAR(40)  NULL,
  to_status     VARCHAR(40)  NULL,
  meta          JSON         NULL,
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_actor FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL
);
