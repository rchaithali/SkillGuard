SkillGuard — Talent Intelligence & Role Readiness System (v1)

Problem
Referral-stage hiring is noisy and time-consuming. SkillGuard reduces manual screening by producing an explainable readiness score and structured interview recommendation—based on evidence of skills, not keyword-only matching.

Why rule-based (not ML)
	•	No labeled hiring data available (cold start)
	•	Need transparent, debuggable logic
	•	Faster iteration as a solo builder
	•	Trade-off: lower sophistication initially, but stable + explainable outputs

Inputs (v1)
	•	Resume text (paste/upload text)
	•	Optional: GitHub signals (later)
	•	Optional: LeetCode public stats (later)

Outputs (v1)
	•	Readiness score (0–100)
	•	Interview recommendation:
	•	≥ 80 → Direct interview
	•	60–79 → Phone screening
	•	< 40 → Assessment / alternate role suggestion
	•	Skill confidence levels:
	•	Mentioned
	•	Used (in projects)
	•	Strong (end-to-end / repeated evidence)
	•	DSA score handled separately (later combined or shown separately)
    