type SkillMatchSectionProps = {
  matchedSkills?: string[];
  missingSkills?: string[];
};

function SkillMatchSection({
  matchedSkills = [],
  missingSkills = []
}: SkillMatchSectionProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-6">
      <h3 className="text-xl font-semibold text-white">
        Matched vs Missing Skills
      </h3>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {/* Skills found in the resume that match the target role/JD */}
        <div>
          <p className="text-sm font-medium text-emerald-200">
            Matched Skills
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {matchedSkills.length > 0 ? (
              matchedSkills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-100"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-sm text-slate-400">
                No matched skills detected.
              </p>
            )}
          </div>
        </div>

        {/* Skills required by the role/JD but missing from the resume */}
        <div>
          <p className="text-sm font-medium text-amber-200">Missing Skills</p>

          <div className="mt-3 flex flex-wrap gap-2">
            {missingSkills.length > 0 ? (
              missingSkills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-amber-400/10 px-3 py-1 text-xs text-amber-100"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-sm text-slate-400">
                No missing skills detected.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default SkillMatchSection;