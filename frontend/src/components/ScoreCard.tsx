type ScoreCardData = {
  label: string;
  score: number;
  maxScore: number;
  percentage: number;
  status: "STRONG" | "MODERATE" | "LOW";
  reason: string;
};

type ScoreCardProps = {
  card: ScoreCardData;
};

function ScoreCard({ card }: ScoreCardProps) {
  return (
    <article className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">{card.label}</p>
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

      <p className="mt-4 text-sm leading-6 text-slate-400">{card.reason}</p>
    </article>
  );
}

export default ScoreCard;