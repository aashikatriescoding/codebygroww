import { useEffect, useState } from "react";
import { getTickerHistory } from "../services/watchlistService";

const Sparkline = ({ ticker }) => {
  const [closes, setCloses] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getTickerHistory(ticker)
      .then((data) => {
        if (!cancelled) setCloses(data);
      })
      .catch(() => {
        if (!cancelled) setCloses([]);
      });
    return () => {
      cancelled = true;
    };
  }, [ticker]);

  if (!closes || closes.length < 2) {
    return <div className="sparkline-placeholder" />;
  }

  const width = 90;
  const height = 32;
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min || 1;

  const points = closes
    .map((price, i) => {
      const x = (i / (closes.length - 1)) * width;
      const y = height - ((price - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  const isUp = closes[closes.length - 1] >= closes[0];

  return (
    <svg width={width} height={height} className="sparkline">
      <polyline
        points={points}
        fill="none"
        stroke={isUp ? "#1a7f37" : "#c9251c"}
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default Sparkline;