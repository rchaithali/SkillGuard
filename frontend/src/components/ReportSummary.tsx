type ReportSummaryProps = {
  finalScore: number;
  maxScore: number;
  targetRole: string;
  readinessLabel: string;
  recommendationLabel: string;
  scoringSource: string;
};

function ReportSummary({
  finalScore,
  maxScore,
  targetRole,
  readinessLabel,
  recommendationLabel,
  scoringSource
}: ReportSummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-[220px_1fr]">
      {/* Main final score card */}
      <div className="rounded-3xl border border-cyan-400/30 bg-cyan-400/10 p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">
          Final Score
        </p>

        <p className="mt-4 text-6xl font-bold text-white">{finalScore}</p>

        <p className="mt-1 text-sm text-slate-400">out of {maxScore}</p>
      </div>

      {/* Role and recommendation summary */}
      <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
        <p className="text-sm text-slate-400">Target role</p>

        <h2 className="mt-1 text-3xl font-semibold text-white">
          {targetRole}
        </h2>

        <div className="mt-5 flex flex-wrap gap-3">
          <span className="rounded-full bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-200">
            {readinessLabel}
          </span>

          <span className="rounded-full bg-violet-400/10 px-4 py-2 text-sm font-medium text-violet-200">
            {recommendationLabel}
          </span>

          <span className="rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-300">
            {scoringSource}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ReportSummary;