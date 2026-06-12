type GitHubProofSignals = {
  githubVerified: boolean;
  githubUsername: string | null;
  hasRecentGitHubActivity: boolean;
  hasBackendGitHubSignals: boolean;
  hasFrontendGitHubSignals: boolean;
  detectedGitHubStack: string[];
  strongRepositories: string[];
};

type GitHubProofSectionProps = {
  proofSignals: GitHubProofSignals;
};

function GitHubProofSection({ proofSignals }: GitHubProofSectionProps) {
  return (
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
          {proofSignals.githubVerified
            ? `Verified: ${proofSignals.githubUsername}`
            : "Not verified"}
        </span>
      </div>

      {/* High-level GitHub evidence flags */}
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">Recent activity</p>
          <p className="mt-1 font-semibold text-white">
            {proofSignals.hasRecentGitHubActivity ? "Detected" : "Not detected"}
          </p>
        </div>

        <div className="rounded-2xl bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">Backend signals</p>
          <p className="mt-1 font-semibold text-white">
            {proofSignals.hasBackendGitHubSignals ? "Detected" : "Not detected"}
          </p>
        </div>

        <div className="rounded-2xl bg-white/[0.04] p-4">
          <p className="text-sm text-slate-400">Frontend signals</p>
          <p className="mt-1 font-semibold text-white">
            {proofSignals.hasFrontendGitHubSignals
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
          {proofSignals.detectedGitHubStack.length > 0 ? (
            proofSignals.detectedGitHubStack.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300"
              >
                {skill}
              </span>
            ))
          ) : (
            <p className="text-sm text-slate-400">No stack signals detected.</p>
          )}
        </div>
      </div>

      <div className="mt-5">
        <p className="text-sm font-medium text-slate-300">
          Strong Repositories
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {proofSignals.strongRepositories.length > 0 ? (
            proofSignals.strongRepositories.map((repo) => (
              <span
                key={repo}
                className="rounded-full bg-violet-400/10 px-3 py-1 text-xs text-violet-100"
              >
                {repo}
              </span>
            ))
          ) : (
            <p className="text-sm text-slate-400">
              No strong repositories detected.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default GitHubProofSection;