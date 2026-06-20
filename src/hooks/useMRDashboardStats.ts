import { useEffect, useState } from 'react';
import { getMRDashboard } from '@/src/services/mrService';

export const useMRDashboardStats = (mrId: string) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMRDashboard(mrId)
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false));
  }, [mrId]);

  return { stats, loading };
};
