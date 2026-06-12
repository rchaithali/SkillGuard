import type { FormEvent } from "react";
import { useState } from "react";

type ScoreCard = {
  label: string;
  score: number;
  maxScore: number;
  percentage: number;
  status: "STRONG" | "MODERATE" | "LOW";
  reason: string;
};

type FrontendReport = {
  targetRole: string;
  finalScore: number;
  maxScore: number;
  recommendation: string;
  recommendationLabel: string;
  readinessLabel: string;
  scoreCards: ScoreCard[];
  topStrengths: string[];
  mainConcerns: string[];
  proofSignals: {
    githubVerified: boolean;
    githubUsername: string | null;
    hasRecentGitHubActivity: boolean;
    hasBackendGitHubSignals: boolean;
    hasFrontendGitHubSignals: boolean;
    detectedGitHubStack: string[];
    strongRepositories: string[];
  };
};

type AnalysisResponse = {
  message: string;
  targetRole: string;
  scoringSource: string;
  prioritizeFundamentals: boolean;
  resolvedGitHubUsername: string | null;
  resolvedLeetCodeUsername: string | null;
  roleFitScore?: {
    matchedSkills?: string[];
    missingSkills?: string[];
  };
  frontendReport: FrontendReport;
};

const API_BASE_URL = "http://localhost:5050";

function AnalyzePage() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState("Junior Backend Developer");
  const [jobDescription, setJobDescription] = useState(
    "We need a junior backend developer with Node.js, REST API, PostgreSQL, Redis, Docker and AWS experience."
  );

  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(
    null
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleAnalyzeResume = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!resumeFile) {
      setErrorMessage("Please upload a resume PDF before analyzing.");
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage("");
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      formData.append("resumeFile", resumeFile);
      formData.append("targetRole", targetRole);
      formData.append("jobDescription", jobDescription);
      formData.append("viewerType", "RECRUITER");

      const response = await fetch(`${API_BASE_URL}/api/analyze/pdf`, {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Resume analysis failed.");
      }

      setAnalysisResult(data);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while analyzing the resume.";

      setErrorMessage(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const report = analysisResult?.frontendReport;

  return (
    <main className="min-h-screen px-6 py-8 text-slate-100">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-cyan-950/30 backdrop-blur">
          <div className="w-fit rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-sm font-medium text-cyan-200">
            SkillGuard · Talent Intelligence
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl">
                Analyze role readiness with resume + proof signals.
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300 md:text-lg">
                Upload a resume PDF, compare it against a target role, and get a
                recruiter-friendly readiness report with score breakdown,
                strengths, missing skills, and GitHub-backed evidence.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                Current mode
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                Recruiter Analysis
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Frontend uses the cleaned{" "}
                <span className="font-mono text-cyan-300">frontendReport</span>{" "}
                structure from the backend.
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[420px_1fr]">
          <form
            onSubmit={handleAnalyzeResume}
            className="h-fit rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-slate-950/40 backdrop-blur"
          >
            <h2 className="text-2xl font-semibold text-white">
              Analyze Candidate
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Start with PDF upload. Later we can add candidate view, saved
              reports, and batch ranking.
            </p>

            <div className="mt-6 flex flex-col gap-5">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-300">
                  Resume PDF
                </span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(event) =>
                    setResumeFile(event.target.files?.[0] || null)
                  }
                  className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-300 file:mr-4 file:rounded-xl file:border-0 file:bg-cyan-400 file:px-4 file:py-2 file:font-semibold file:text-slate-950 hover:border-cyan-400/40"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-300">
                  Target Role
                </span>
                <input
                  value={targetRole}
                  onChange={(event) => setTargetRole(event.target.value)}
                  className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition hover:border-cyan-400/40 focus:border-cyan-400"
                  placeholder="Example: Junior Backend Developer"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-300">
                  Job Description
                </span>
                <textarea
                  value={jobDescription}
                  onChange={(event) => setJobDescription(event.target.value)}
                  rows={8}
                  className="resize-none rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition hover:border-cyan-400/40 focus:border-cyan-400"
                  placeholder="Paste the job description here..."
                />
              </label>

              {errorMessage && (
                <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isAnalyzing}
                className="rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Resume"}
              </button>
            </div>
          </form>

          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-slate-950/40 backdrop-blur">
            {!report ? (
              <div className="flex min-h-[540px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-8 text-center">
                <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2 text-sm text-cyan-200">
                  Waiting for analysis
                </div>
                <h2 className="mt-5 text-3xl font-semibold text-white">
                  Upload a PDF to generate the report.
                </h2>
                <p className="mt-3 max-w-xl text-slate-400">
                  The report will show final score, role fit, project depth,
                  experience, fundamentals, GitHub proof, strengths, and missing
                  skills.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <div className="grid gap-4 md:grid-cols-[220px_1fr]">
                  <div className="rounded-3xl border border-cyan-400/30 bg-cyan-400/10 p-6">
                    <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">
                      Final Score
                    </p>
                    <p className="mt-4 text-6xl font-bold text-white">
                      {report.finalScore}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      out of {report.maxScore}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
                    <p className="text-sm text-slate-400">Target role</p>
                    <h2 className="mt-1 text-3xl font-semibold text-white">
                      {report.targetRole}
                    </h2>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <span className="rounded-full bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-200">
                        {report.readinessLabel}
                      </span>
                      <span className="rounded-full bg-violet-400/10 px-4 py-2 text-sm font-medium text-violet-200">
                        {report.recommendationLabel}
                      </span>
                      <span className="rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-300">
                        {analysisResult.scoringSource}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {report.scoreCards.map((card) => (
                    <article
                      key={card.label}
                      className="rounded-3xl border border-white/10 bg-slate-950/60 p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm text-slate-400">
                            {card.label}
                          </p>
                          <p className="mt-2 text-3xl font-bold text-white">
                            {card.score}/{card.maxScore}
                          </p>
                        </div>
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">
                          {card.status}
                        </span>
                      </div>

                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-cyan-400"
                          style={{ width: `${card.percentage}%` }}
                        />
                      </div>

                      <p className="mt-4 text-sm leading-6 text-slate-400">
                        {card.reason}
                      </p>
                    </article>
                  ))}
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
                    <h3 className="text-xl font-semibold text-white">
                      Top Strengths
                    </h3>
                    <div className="mt-4 flex flex-col gap-3">
                      {report.topStrengths.length > 0 ? (
                        report.topStrengths.map((strength) => (
                          <p
                            key={strength}
                            className="rounded-2xl bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100"
                          >
                            {strength}
                          </p>
                        ))
                      ) : (
                        <p className="text-sm text-slate-400">
                          No major strengths detected yet.
                        </p>
                      )}
                    </div>
                  </section>

                  <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
                    <h3 className="text-xl font-semibold text-white">
                      Main Concerns
                    </h3>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {report.mainConcerns.length > 0 ? (
                        report.mainConcerns.map((concern) => (
                          <span
                            key={concern}
                            className="rounded-full bg-amber-400/10 px-4 py-2 text-sm text-amber-100"
                          >
                            {concern}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-slate-400">
                          No major missing skills detected.
                        </p>
                      )}
                    </div>
                  </section>
                </div>

                <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        GitHub Proof Signals
                      </h3>
                      <p className="mt-1 text-sm text-slate-400">
                        Public repository evidence detected from the resume PDF.
                      </p>
                    </div>

                    <span className="w-fit rounded-full bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200">
                      {report.proofSignals.githubVerified
                        ? `Verified: ${report.proofSignals.githubUsername}`
                        : "Not verified"}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl bg-white/[0.04] p-4">
                      <p className="text-sm text-slate-400">Recent activity</p>
                      <p className="mt-1 font-semibold text-white">
                        {report.proofSignals.hasRecentGitHubActivity
                          ? "Detected"
                          : "Not detected"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white/[0.04] p-4">
                      <p className="text-sm text-slate-400">Backend signals</p>
                      <p className="mt-1 font-semibold text-white">
                        {report.proofSignals.hasBackendGitHubSignals
                          ? "Detected"
                          : "Not detected"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white/[0.04] p-4">
                      <p className="text-sm text-slate-400">Frontend signals</p>
                      <p className="mt-1 font-semibold text-white">
                        {report.proofSignals.hasFrontendGitHubSignals
                          ? "Detected"
                          : "Not detected"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="text-sm font-medium text-slate-300">
                      Detected GitHub Stack
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {report.proofSignals.detectedGitHubStack.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="text-sm font-medium text-slate-300">
                      Strong Repositories
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {report.proofSignals.strongRepositories.map((repo) => (
                        <span
                          key={repo}
                          className="rounded-full bg-violet-400/10 px-3 py-1 text-xs text-violet-100"
                        >
                          {repo}
                        </span>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
                  <h3 className="text-xl font-semibold text-white">
                    Matched vs Missing Skills
                  </h3>

                  <div className="mt-5 grid gap-5 lg:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-emerald-200">
                        Matched Skills
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {analysisResult.roleFitScore?.matchedSkills?.map(
                          (skill) => (
                            <span
                              key={skill}
                              className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-100"
                            >
                              {skill}
                            </span>
                          )
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-amber-200">
                        Missing Skills
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {analysisResult.roleFitScore?.missingSkills?.map(
                          (skill) => (
                            <span
                              key={skill}
                              className="rounded-full bg-amber-400/10 px-3 py-1 text-xs text-amber-100"
                            >
                              {skill}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </section>
        </section>
      </section>
    </main>
  );
}

export default AnalyzePage;