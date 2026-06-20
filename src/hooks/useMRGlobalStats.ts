import { useEffect, useState } from 'react';
import { getMRS, getVisitsToday, getMRLocations } from '@/src/services/mrService';

export const useMRGlobalStats = () => {
  const [mrs, setMRS] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mrRes, visitRes, locRes] = await Promise.all([
          getMRS(),
          getVisitsToday(),
          getMRLocations(),
        ]);
        setMRS(Array.isArray(mrRes.data) ? mrRes.data : []);
        setVisits(Array.isArray(visitRes.data) ? visitRes.data : []);
        setLocations(Array.isArray(locRes.data) ? locRes.data : []);
      } catch (e) {
        console.error('useMRGlobalStats error', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { mrs, visits, locations, loading };
};
