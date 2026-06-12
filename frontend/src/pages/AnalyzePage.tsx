import { useState } from "react";
import type { FormEvent } from "react";
import AnalyzeForm from "../components/AnalyzeForm.js";
import GitHubProofSection from "../components/GitHubProofSection.js";
import ReportSummary from "../components/ReportSummary.js";
import ScoreCard from "../components/ScoreCard.js";
import SkillMatchSection from "../components/SkillMatchSection.js";
import StrengthConcernSection from "../components/StrengthConcernSection.js";
import {
  analyzeResumePdf,
  type AnalysisResponse
} from "../services/analysisApi.js";

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

  // Handles form submit and stores the backend analysis result.
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
      const data = await analyzeResumePdf({
        resumeFile,
        targetRole,
        jobDescription
      });

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
          <AnalyzeForm
            resumeFile={resumeFile}
            setResumeFile={setResumeFile}
            targetRole={targetRole}
            setTargetRole={setTargetRole}
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            errorMessage={errorMessage}
            isAnalyzing={isAnalyzing}
            onSubmit={handleAnalyzeResume}
          />

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
                <ReportSummary
                  finalScore={report.finalScore}
                  maxScore={report.maxScore}
                  targetRole={report.targetRole}
                  readinessLabel={report.readinessLabel}
                  recommendationLabel={report.recommendationLabel}
                  scoringSource={analysisResult.scoringSource}
                />

                {/* Reusable score cards from backend frontendReport */}
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {report.scoreCards.map((card) => (
                    <ScoreCard key={card.label} card={card} />
                  ))}
                </div>

                <StrengthConcernSection
                  topStrengths={report.topStrengths}
                  mainConcerns={report.mainConcerns}
                />

                <GitHubProofSection proofSignals={report.proofSignals} />

                <SkillMatchSection
                  matchedSkills={analysisResult.roleFitScore?.matchedSkills}
                  missingSkills={analysisResult.roleFitScore?.missingSkills}
                />
              </div>
            )}
          </section>
        </section>
      </section>
    </main>
  );
}

export default AnalyzePage;