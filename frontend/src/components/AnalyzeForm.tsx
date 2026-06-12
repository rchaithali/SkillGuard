import type { FormEvent } from "react";

type AnalyzeFormProps = {
  resumeFile: File | null;
  setResumeFile: (file: File | null) => void;
  targetRole: string;
  setTargetRole: (value: string) => void;
  jobDescription: string;
  setJobDescription: (value: string) => void;
  errorMessage: string;
  isAnalyzing: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

function AnalyzeForm({
  setResumeFile,
  targetRole,
  setTargetRole,
  jobDescription,
  setJobDescription,
  errorMessage,
  isAnalyzing,
  onSubmit
}: AnalyzeFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="h-fit rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-slate-950/40 backdrop-blur"
    >
      <h2 className="text-2xl font-semibold text-white">Analyze Candidate</h2>

      <p className="mt-2 text-sm text-slate-400">
        Start with PDF upload. Later we can add candidate view, saved reports,
        and batch ranking.
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
  );
}

export default AnalyzeForm;