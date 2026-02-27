"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const INTERVAL_MS = 30_000;

export default function LiveRefresh() {
  const router = useRouter();
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    // Tick every second to update the "X seconds ago" counter
    const ticker = setInterval(() => setSecondsAgo((s) => s + 1), 1000);

    // Refresh the server data every 30 seconds
    const refresher = setInterval(() => {
      router.refresh();
      setSecondsAgo(0);
    }, INTERVAL_MS);

    return () => {
      clearInterval(ticker);
      clearInterval(refresher);
    };
  }, [router]);

  return (
    <span className="text-xs text-zinc-600">
      {secondsAgo < 5 ? "Just updated" : `Updated ${secondsAgo}s ago`} · auto-refreshes every 30s
    </span>
  );
}
