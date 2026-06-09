# SkillGuard — Talent Intelligence & Role Readiness System

SkillGuard is an explainable candidate evaluation system that analyzes resume evidence against role expectations and job descriptions to produce readiness scores, interview routing decisions, and recruiter-friendly candidate rankings.

## Problem

Referral-stage and early hiring screening can become noisy when recruiters receive many resumes for one or more open roles. Manual review is time-consuming, and keyword-only matching often misses the difference between skills that are merely listed and skills that are actually demonstrated through projects or work experience.

SkillGuard reduces this screening effort by producing structured, explainable role-readiness signals based on resume evidence, job-description alignment, project depth, experience fit, and fundamentals.

## Why Rule-Based Logic

SkillGuard currently uses explainable rule-based heuristics instead of ML because:

- No labeled hiring dataset is available at the cold-start stage
- Scoring decisions need to be transparent and debuggable
- Rule-based logic allows faster iteration as a solo builder
- Recruiter-facing outputs should be explainable, not black-box predictions

The trade-off is lower sophistication than a trained ML model, but the system remains stable, understandable, and easy to improve.

## Current Inputs

### Single Candidate Analysis

- Resume text
- Target role
- Optional job description
- Viewer type:
  - RECRUITER
  - CANDIDATE

### Batch Recruiter Analysis

- Multiple job descriptions
- Multiple candidate resumes

This allows SkillGuard to rank candidates for one role or group and rank candidates across multiple roles.

## Current Outputs

### Single Candidate Output

- Detected skills from resume
- Job-description skill extraction
- General role-map comparison
- Role Fit score /40
- Project Depth score /25
- Experience score /20
- Fundamentals / DSA score /15
- Final readiness score /100
- Interview routing recommendation:
  - DIRECT_INTERVIEW
  - PHONE_SCREEN
  - ASSESSMENT
  - NOT_READY

### Viewer-Specific Output

For recruiter view:

- Final score
- Recommendation
- Matched and missing skills
- Score breakdown
- Candidate feedback availability flag

For candidate view:

- Strengths
- Actionable improvement recommendations
- Missing-skill improvement guidance without exposing a separate negative gaps section

## Scoring Breakdown

text Final Score = Role Fit + Project Depth + Experience + Fundamentals  Role Fit        = /40 Project Depth   = /25 Experience      = /20 Fundamentals    = /15 Total           = /100 

## Role Fit /40

If a job description is provided, SkillGuard scores the candidate against the skills extracted from the job description.

If no job description is provided, SkillGuard falls back to the default role map.

text JD present: Role Fit = matched JD skills / total JD skills * 40  JD absent: Role Fit = matched role-map skills / total role-map skills * 40 

The system also keeps a separate generalRoleMatch field to show the default role-map comparison clearly.

## Project Depth /25

Project Depth measures whether skills are backed by project or work evidence.

Skill confidence levels:

- MENTIONED: skill appears but no strong evidence is found
- USED: skill appears in project/work context
- STRONG: skill has deeper evidence such as ownership, implementation, optimization, or repeated meaningful use

Scoring:

text USED skill   = +2 STRONG skill = +5 Maximum      = 25 

DSA skills are excluded from Project Depth because they are scored separately under Fundamentals.

## Experience /20

Experience is scored using:

text Experience Score = Level Fit + Relevant Experience Evidence + Practical Proof 

Breakdown:

text Level Fit                    = /7 Relevant Experience Evidence = /8 Practical Proof              = /5 

Experience level handling:

- Fresher roles: strong projects can be enough; internship/fellowship/training improves the score
- Junior roles: projects alone are not enough; around 9–12 months or 1–3 years of real experience is treated as stronger fit
- Mid/Senior/Lead roles: professional years and role-relevant evidence matter more

## Fundamentals / DSA /15

Fundamentals are scored using distinct DSA and CS signals such as:

- DSA
- Arrays
- Strings
- Hashing
- Trees
- Graphs
- Dynamic Programming
- Time Complexity
- Recursion
- Sliding Window
- Two Pointers

Scoring:

text Each distinct DSA/fundamentals signal = +3 Maximum = 15 

## Batch Recruiter Ranking

SkillGuard supports recruiter batch screening.

### One Role, Multiple Candidates

Recruiter provides one job description and multiple resumes.

Output:

- Candidates ranked from highest match to lowest match
- Final score
- Recommendation
- Matched skills
- Missing skills
- Score breakdown

### Multiple Roles, Multiple Candidates

Recruiter provides multiple job descriptions and multiple resumes.

Output:

- Candidates are grouped under every role they match
- Grouping is non-exclusive
- A candidate can appear under multiple roles
- Candidates are ranked within each role by final score

This supports referral-style screening where recruiters may need to identify the best candidates across several open roles.

## API Endpoints

### Single Candidate Analysis

http POST /api/analyze 

### Batch Recruiter Analysis

http POST /api/analyze/batch 

## Current Tech Stack

- Node.js
- TypeScript
- Express.js
- Rule-based scoring logic
- Modular backend architecture

## Planned Improvements

- GitHub public API signal integration
- LeetCode / DSA signal integration
- Cleaner report structure for frontend display
- MongoDB-based saved reports/history
- React + Tailwind frontend dashboard
- Deployment and screenshots