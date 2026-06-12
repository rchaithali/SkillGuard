import { Link } from "react-router-dom";

function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <section className="mx-auto flex min-h-[80vh] max-w-6xl flex-col items-center justify-center text-center">
        <p className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200">
          SkillGuard · Talent Intelligence
        </p>

        <h1 className="mt-6 max-w-4xl text-5xl font-bold tracking-tight md:text-7xl">
          Verify candidate readiness with resume, role fit, and proof signals.
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          SkillGuard helps recruiters analyze resumes against job descriptions,
          detect missing skills, and validate project evidence using GitHub
          signals.
        </p>

        <Link
          to="/analyze"
          className="mt-8 rounded-2xl bg-cyan-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
        >
          Analyze Resume
        </Link>
      </section>
    </main>
  );
}

export default HomePage;