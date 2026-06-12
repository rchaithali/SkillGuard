 type StrengthConcernSectionProps = {
  topStrengths: string[];
  mainConcerns: string[];
};

function StrengthConcernSection({
  topStrengths,
  mainConcerns
}: StrengthConcernSectionProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Candidate strengths from backend frontendReport */}
      <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
        <h3 className="text-xl font-semibold text-white">Top Strengths</h3>

        <div className="mt-4 flex flex-col gap-3">
          {topStrengths.length > 0 ? (
            topStrengths.map((strength) => (
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

      {/* Candidate gaps/missing skills from backend frontendReport */}
      <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
        <h3 className="text-xl font-semibold text-white">Main Concerns</h3>

        <div className="mt-4 flex flex-wrap gap-2">
          {mainConcerns.length > 0 ? (
            mainConcerns.map((concern) => (
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
  );
}

export default StrengthConcernSection;