import { useEffect, useState } from 'react';

import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface SubscriptionState {
  isPro: boolean;
  loading: boolean;
}

export const useSubscription = (): SubscriptionState => {
  const { user } = useAuth();
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsPro(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    supabase
      .from('subscriptions')
      .select('plan, status')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error('Error loading subscription:', error);
          setIsPro(false);
        } else {
          setIsPro(data?.plan === 'pro' && data?.status === 'active');
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  return { isPro, loading };
};
