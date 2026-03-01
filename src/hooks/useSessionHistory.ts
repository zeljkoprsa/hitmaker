import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '../context/AuthContext';
import { SessionHistoryEntry } from '../core/types/SessionTypes';
import { supabase } from '../lib/supabase';

const computeStreak = (entries: SessionHistoryEntry[]): number => {
  if (!entries.length) return 0;
  const ONE_DAY = 86_400_000;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = new Set(
    entries.map(e => {
      const d = new Date(e.completedAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  );
  let start = today.getTime();
  if (!days.has(start)) {
    start -= ONE_DAY;
    if (!days.has(start)) return 0;
  }
  let streak = 0;
  for (let d = start; days.has(d); d -= ONE_DAY) streak++;
  return streak;
};

export const useSessionHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<SessionHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [streak, setStreak] = useState(0);

  const loadHistory = useCallback(async () => {
    if (!user) {
      setHistory([]);
      setStreak(0);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('session_history')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(90);

      if (error) throw error;

      const entries: SessionHistoryEntry[] = (data ?? []).map(r => ({
        id: r.id,
        sessionId: r.session_id ?? null,
        sessionName: r.session_name,
        completedAt: r.completed_at,
        blocksCompleted: r.blocks_completed,
        totalDurationMinutes: Number(r.total_duration_minutes),
      }));

      setHistory(entries);
      setStreak(computeStreak(entries));
    } catch (err) {
      console.error('Error loading session history:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return { history, loading, streak, loadHistory };
};
