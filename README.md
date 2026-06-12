# SkillGuard — Talent Intelligence & Role Readiness System

SkillGuard is an explainable candidate evaluation system that analyzes resume evidence against role expectations and job descriptions to produce readiness scores, interview routing decisions, and recruiter-friendly candidate rankings.

## Problem

Referral-stage and early hiring screening can become noisy when recruiters receive many resumes for one or more open roles. Manual review is time-consuming, and keyword-only matching often misses the difference between skills that are merely listed and skills that are actually demonstrated through projects, work experience, or public code.

SkillGuard reduces this screening effort by producing structured, explainable role-readiness signals based on resume evidence, job-description alignment, project depth, experience fit, fundamentals, optional GitHub project proof, and optional coding profile proof.

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
- Optional GitHub username
- Optional coding profile data
- Viewer type:
  - RECRUITER
  - CANDIDATE

### PDF Resume Analysis

- Resume PDF upload
- Target role
- Optional job description
- Optional GitHub username
- Optional coding profile data
- Viewer type:
  - RECRUITER
  - CANDIDATE

SkillGuard supports PDF resume upload with:

- Visible resume text extraction
- Hidden/clickable GitHub profile link detection from PDF links
- Automatic GitHub username resolution when a GitHub link is found
- GitHub project proof analysis using public repositories

### Batch Recruiter Analysis

- Multiple job descriptions
- Multiple candidate resumes
- Optional GitHub username per candidate
- Optional coding profile data per candidate

This allows SkillGuard to rank candidates for one role or group and rank candidates across multiple roles.

## Current Outputs

### Single Candidate Output

- Detected skills from resume
- Job-description skill extraction
- General role-map comparison
- Extracted profile links
- Resolved GitHub username
- Optional GitHub project proof signals
- Optional coding profile data
- Dynamic scoring weights
- Role Fit score
- Project Depth score
- Experience score
- Fundamentals / DSA score
- Final readiness score /100
- Interview routing recommendation:
  - DIRECT_INTERVIEW
  - PHONE_SCREEN
  - ASSESSMENT
  - NOT_READY

### PDF Candidate Output

The PDF endpoint returns all single-candidate analysis fields plus:

- Resume source type
- PDF page count
- Profile links extracted from visible text
- Profile links extracted from hidden PDF links
- Automatically resolved GitHub username when available

Example:

json {   "resumeSource": {     "type": "PDF",     "pageCount": 1   },   "extractedProfileLinks": {     "fromVisibleText": {       "githubUsername": null,       "githubUrl": null,       "leetCodeUsername": null,       "leetCodeUrl": null     },     "fromPdfLinks": {       "githubUsername": "sampleuser",       "githubUrl": "https://github.com/sampleuser",       "leetCodeUsername": null,       "leetCodeUrl": null     }   },   "resolvedGitHubUsername": "sampleuser" } 

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

SkillGuard uses dynamic scoring weights depending on whether the role or job description explicitly prioritizes fundamentals, DSA, algorithms, coding rounds, C++, or problem-solving.

### When Fundamentals / DSA Are Prioritized

text Final Score = Role Fit + Project Depth + Experience + Fundamentals  Role Fit      = /40 Project Depth = /25 Experience    = /20 Fundamentals  = /15 Total         = /100 

### When Fundamentals / DSA Are Not Explicitly Prioritized

text Final Score = Role Fit + Project Depth + Experience + Fundamentals  Role Fit      = /45 Project Depth = /30 Experience    = /20 Fundamentals  = /5 Total         = /100 

This prevents candidates from being heavily penalized for DSA when the role is primarily project, backend, frontend, or stack-focused.

## Role Fit

If a job description is provided, SkillGuard scores the candidate against the skills extracted from the job description.

If no job description is provided, SkillGuard falls back to the default role map.

text JD present: Role Fit = matched JD skills / total JD skills * roleFitMaxScore  JD absent: Role Fit = matched role-map skills / total role-map skills * roleFitMaxScore 

The system also keeps a separate generalRoleMatch field to show the default role-map comparison clearly.

## Project Depth

Project Depth measures whether skills are backed by project or work evidence.

Skill confidence levels:

- MENTIONED: skill appears but no strong evidence is found
- USED: skill appears in project/work context
- STRONG: skill has deeper evidence such as ownership, implementation, optimization, or repeated meaningful use

Scoring:

text USED skill   = +2 STRONG skill = +5 Maximum      = projectDepthMaxScore 

DSA skills are excluded from Project Depth because they are scored separately under Fundamentals.

## GitHub Project Proof Signals

SkillGuard supports GitHub public profile analysis through either:

- Manually provided githubUsername
- Automatically extracted GitHub link from resume PDF hidden/clickable links

GitHub is used as supporting project evidence, not as a replacement for resume or job-description matching.

### What GitHub Currently Verifies

SkillGuard fetches:

- Public GitHub profile
- Recent public repositories
- Repository languages
- Root package.json
- backend/package.json
- frontend/package.json

From package files, SkillGuard detects stack evidence such as:

- Express.js
- MongoDB
- JWT
- Bcrypt
- React
- Vite
- Tailwind CSS
- TypeScript

### GitHub as Project Proof

GitHub does not directly improve Role Fit.

Instead, GitHub provides a small Project Depth boost only when the resume claims a skill and GitHub package files confirm that same stack.

Example:

text Resume mentions: Express.js, MongoDB GitHub confirms: Express.js, MongoDB Result: small project-proof boost in Project Depth 

This keeps the scoring explainable and prevents GitHub from inventing skills that are not present in the resume.

### GitHub Boost Rule

text GitHub proof boost applies only to Project Depth. Maximum boost: +4 

Boost is based on:

- Confirmed overlap between resume skills and GitHub-detected stack
- Presence of strong recent GitHub project repositories

Example output:

text GitHub added a +4 project-proof boost: GitHub confirmed TypeScript, React, Express.js, MongoDB, JWT, Bcrypt in public project repositories; 2 strong GitHub project repo(s) were found. 

### Safe Fallback

If the GitHub username is invalid or GitHub data cannot be fetched, SkillGuard returns:

json {   "githubSignals": null } 

The main resume/JD analysis still works normally.

## Experience

Experience is scored using:

text Experience Score = Level Fit + Relevant Experience Evidence + Practical Proof 

Breakdown:

text Level Fit                    = /7 Relevant Experience Evidence = /8 Practical Proof              = /5 Total                        = /20 

Experience level handling:

- Fresher roles: strong projects can be enough; internship/fellowship/training improves the score
- Junior roles: projects alone are not enough; around 9-12 months or 1-3 years of real experience is treated as stronger fit
- Mid/Senior/Lead roles: professional years and role-relevant evidence matter more

## Fundamentals / DSA

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

When the role or JD explicitly asks for DSA, algorithms, C++, coding rounds, competitive programming, LeetCode, CodeChef, Codeforces, or problem-solving:

text Each distinct DSA/fundamentals signal = +3 Maximum = 15 

When the role or JD does not explicitly prioritize fundamentals:

text Each distinct DSA/fundamentals signal = +1 Maximum = 5 

This treats DSA as an additional signal instead of a major penalty for stack-focused roles.

## Coding Profile / DSA Proof Signals

SkillGuard supports optional coding profile evidence through codingProfile.

Coding profile data is used as supporting proof for DSA/fundamentals evidence, similar to how GitHub is used as proof for project stack evidence.

### Current Coding Profile Input

SkillGuard currently accepts structured coding profile data such as:

json {   "codingProfile": {     "platform": "LEETCODE",     "username": "sample_user",     "totalSolved": 160,     "easySolved": 100,     "mediumSolved": 55,     "hardSolved": 5,     "contestRating": 1500   } } 

Supported platforms:

- LEETCODE
- CODECHEF
- CODEFORCES
- OTHER

### DSA Proof Levels

SkillGuard classifies coding profile evidence into proof levels:

- NONE
- BASIC
- INTERMEDIATE
- ADVANCED

The classification considers both total solved count and difficulty distribution.

### Basic Proof

text totalSolved >= 20 

This indicates some consistent problem-solving practice.

### Intermediate Proof

text (totalSolved >= 75 AND mediumSolved >= 20) OR mediumSolved >= 30 OR contestRating >= 1400 

This indicates meaningful DSA practice beyond easy-only solving.

### Advanced Proof

text (totalSolved >= 150 AND mediumSolved >= 50 AND hardSolved >= 5) OR (mediumSolved >= 70 AND hardSolved >= 10) OR contestRating >= 1700 

This prevents easy-only volume from being treated as advanced DSA evidence.

For example:

text 150 easy problems only → not ADVANCED 120 total with 55 medium and 10 hard → INTERMEDIATE 160 total with 55 medium and 5 hard → ADVANCED 

### How Coding Profile Proof Is Used

Coding profile evidence does not inflate the score beyond the Fundamentals cap.

Instead, it strengthens the explanation when resume DSA signals are already detected.

Example output:

text Detected 6 distinct DSA/fundamentals signal(s). Coding profile proof: LEETCODE (advanced_user) shows advanced problem-solving evidence with 160 solved problem(s). 

This keeps the system explainable:

text Resume → claims DSA/fundamentals Coding profile → supports DSA practice evidence 

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
- GitHub proof signals when available
- Coding profile proof signals when available
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

### PDF Resume Analysis

http POST /api/analyze/pdf 

Expected form-data fields:

text resumeFile      File    Resume PDF targetRole      Text    Target role name jobDescription  Text    Optional job description viewerType      Text    RECRUITER or CANDIDATE githubUsername  Text    Optional GitHub username codingProfile   Text    Optional JSON string 

### Batch Recruiter Analysis

http POST /api/analyze/batch 

## Current Tech Stack

- Node.js
- TypeScript
- Express.js
- Multer
- PDF parsing
- GitHub public API integration
- Rule-based scoring logic
- Modular backend architecture

## Planned Improvements

- Cleaner report structure for frontend display(done)
- MongoDB-based saved reports/history
- React + Tailwind frontend dashboard
- LeetCode/coding profile link extraction display
- Optional coding profile stat fetching
- Deployment and screenshots