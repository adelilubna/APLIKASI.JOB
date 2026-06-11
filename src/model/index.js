const User = require("./userModel");
const Profile = require("./profileModel");
const Company = require("./companyModel");
const Category = require("./categoryModel");
const Job = require("./jobModel");
const Application = require("./applicationModel");
const Interview = require("./interviewModel");
const Shortlist = require("./shortlistModel");
const AuditLog = require("./auditLogModel");

// User <-> Profile (1:1)
User.hasOne(Profile, { foreignKey: "user_id", as: "profile" });
Profile.belongsTo(User, { foreignKey: "user_id", as: "user" });

// User <-> Company (owner)
User.hasMany(Company, { foreignKey: "owner_user_id", as: "companies" });
Company.belongsTo(User, { foreignKey: "owner_user_id", as: "owner" });

// Category <-> Job
Category.hasMany(Job, { foreignKey: "category_id", as: "jobs" });
Job.belongsTo(Category, { foreignKey: "category_id", as: "category" });

// Company <-> Job
Company.hasMany(Job, { foreignKey: "company_id", as: "jobs" });
Job.belongsTo(Company, { foreignKey: "company_id", as: "company" });

// Job <-> Application
Job.hasMany(Application, { foreignKey: "job_id", as: "applications" });
Application.belongsTo(Job, { foreignKey: "job_id", as: "job" });

// User (applicant) <-> Application
User.hasMany(Application, { foreignKey: "applicant_user_id", as: "applications" });
Application.belongsTo(User, { foreignKey: "applicant_user_id", as: "applicant" });

// Application <-> Interview
Application.hasMany(Interview, { foreignKey: "application_id", as: "interviews" });
Interview.belongsTo(Application, { foreignKey: "application_id", as: "application" });

// Application <-> Shortlist
Application.hasMany(Shortlist, { foreignKey: "application_id", as: "shortlists" });
Shortlist.belongsTo(Application, { foreignKey: "application_id", as: "application" });

// User (recruiter) <-> Shortlist
User.hasMany(Shortlist, { foreignKey: "recruiter_id", as: "shortlisted" });
Shortlist.belongsTo(User, { foreignKey: "recruiter_id", as: "recruiter" });

// User <-> AuditLog
User.hasMany(AuditLog, { foreignKey: "actor_user_id", as: "auditLogs" });
AuditLog.belongsTo(User, { foreignKey: "actor_user_id", as: "actor" });

module.exports = { User, Profile, Company, Category, Job, Application, Interview, Shortlist, AuditLog };
