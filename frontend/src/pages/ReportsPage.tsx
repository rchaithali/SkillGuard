function ReportsPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <p className="text-sm font-semibold text-cyan-300">
            SkillGuard · Saved Reports
          </p>

          <h1 className="mt-4 text-4xl font-bold">
            Candidate Analysis History
          </h1>

          <p className="mt-4 max-w-2xl text-slate-300">
            This page will later show saved candidate reports from MongoDB,
            including role fit scores, recommendations, and GitHub proof
            signals.
          </p>

          <div className="mt-8 rounded-2xl border border-dashed border-white/10 bg-slate-950/60 p-8 text-center">
            <p className="text-lg font-semibold text-white">
              No saved reports yet.
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Once report history is connected, analyzed resumes will appear
              here.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ReportsPage;