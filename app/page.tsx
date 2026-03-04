'use client';

import { useEffect, useState } from 'react';
import { Search, CheckCircle, Zap, Shield, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function HomePage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const { data } = await supabase
          .from('campaigns')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(6);
        
        setCampaigns(data || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  // Rest of your component JSX here (same as above but with loading state)
  // ...
}
