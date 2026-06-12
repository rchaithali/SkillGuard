import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="border-b border-white/10 bg-slate-950/80 px-6 py-4 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link to="/" className="text-lg font-bold text-cyan-300">
          SkillGuard
        </Link>

        <div className="flex items-center gap-4 text-sm text-slate-300">
          <Link to="/" className="hover:text-white">
            Home
          </Link>

          <Link to="/analyze" className="hover:text-white">
            Analyze
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;