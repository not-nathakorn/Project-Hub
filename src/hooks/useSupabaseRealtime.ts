import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import { SiteSettings } from '@/types/database.types';

/**
 * Custom hook for subscribing to Supabase Realtime changes
 * ใช้สำหรับ auto-refresh data เมื่อ Admin ทำการเปลี่ยนแปลงใน database
 * 
 * @param tableName - ชื่อ table ที่ต้องการ subscribe
 * @param onUpdate - callback function เมื่อมีการเปลี่ยนแปลง
 * @param options - options เพิ่มเติม
 */
interface UseRealtimeOptions {
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  schema?: string;
  filter?: string;
  enabled?: boolean;
}

export function useSupabaseRealtime<T>(
  tableName: string,
  onUpdate: (payload: { eventType: string; new: T | null; old: T | null }) => void,
  options: UseRealtimeOptions = {}
) {
  const { event = '*', schema = 'public', filter, enabled = true } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Use a ref to track the latest onUpdate callback
  // This prevents the subscription effect from re-running when the callback function identity changes
  const onUpdateRef = useRef(onUpdate);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    if (!enabled) return;

    const channelName = `realtime-${tableName}-${Date.now()}`;
    
    // Explicitly create the channel first
    const channelInstance = supabase.channel(channelName);
    
    const subscription = channelInstance
      .on(
        'postgres_changes',
        {
          event,
          schema,
          table: tableName,
          ...(filter && { filter }),
        },
        (payload: { eventType: string; new: T | null; old: T | null; [key: string]: unknown }) => {
          console.log(`[Realtime] ${tableName} updated:`, payload.eventType);
          onUpdateRef.current({
            eventType: payload.eventType,
            new: payload.new,
            old: payload.old,
          });
        }
      )
      .subscribe((status) => {
        console.log(`[Realtime] ${tableName} subscription status:`, status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    setChannel(subscription);

    return () => {
      console.log(`[Realtime] Unsubscribing from ${tableName}`);
      supabase.removeChannel(subscription);
      setIsConnected(false);
    };
  }, [tableName, event, schema, filter, enabled]);

  const unsubscribe = useCallback(() => {
    if (channel) {
      supabase.removeChannel(channel);
      setChannel(null);
      setIsConnected(false);
    }
  }, [channel]);

  return { isConnected, unsubscribe };
}

/**
 * Hook สำหรับดึงข้อมูลพร้อม auto-refresh
 * ใช้สำหรับ data ที่ต้องการ update อัตโนมัติเมื่อ Admin เปลี่ยนแปลง
 */
export function useRealtimeData<T>(
  tableName: string,
  fetchFn: () => Promise<T>,
  options: UseRealtimeOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchFn();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Subscribe to realtime updates
  const { isConnected } = useSupabaseRealtime(
    tableName,
    () => {
      // Re-fetch data when table changes
      fetchData();
    },
    options
  );

  return { data, loading, error, refetch: fetchData, isConnected };
}

/**
 * Hook สำหรับ Map Settings โดยเฉพาะ
 * ใช้ใน ThailandEducationMap component
 */
export function useMapSettings() {
  const [mapVisible, setMapVisible] = useState(true);
  const [enabledUniversities, setEnabledUniversities] = useState<string[]>([
    'north', 'northeast', 'central', 'south'
  ]);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('map_settings')
        .select('*')
        .single();

      if (!error && data) {
        setMapVisible(data.is_visible);
        setEnabledUniversities(data.enabled_universities || []);
      }
    } catch (error) {
      console.error('Error fetching map settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Subscribe to realtime changes
  useSupabaseRealtime<{ is_visible: boolean; enabled_universities: string[] }>(
    'map_settings',
    (payload) => {
      if (payload.new) {
        console.log('[Realtime] Map settings updated:', payload.new);
        setMapVisible(payload.new.is_visible);
        setEnabledUniversities(payload.new.enabled_universities || []);
      }
    }
  );

  return { mapVisible, enabledUniversities, loading, refetch: fetchSettings };
}

/**
 * Hook สำหรับ Site Settings
 * ใช้ใน Maintenance Mode และ Global Settings
 */
export function useSiteSettings() {
  // Initialize from localStorage if available
  const [settings, setSettings] = useState<SiteSettings>(() => {
    try {
      const cached = localStorage.getItem('site_settings_cache');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.warn('Failed to parse site settings cache', e);
    }
    
    return {
      id: '',
      site_name: 'CodeX',
      site_tagline: 'Developer Portfolio',
      contact_email: '',
      maintenance_mode: false,
      maintenance_message: 'เว็บไซต์กำลังปรับปรุง กรุณากลับมาใหม่ภายหลัง',
      maintenance_title: 'Under Maintenance',
      maintenance_detail: 'ขออภัยในความไม่สะดวก เรากำลังพัฒนาระบบเพื่อให้ดียิ่งขึ้น กรุณากลับมาใหม่ในภายหลัง',
      maintenance_duration: 'A few hours',
      google_analytics_id: '',
      available_for_work: true,
      social_linkedin: '',
      social_line: '',
      created_at: '',
      updated_at: ''
    };
  });

  // If we had cached data, start as not loading (stale-while-revalidate)
  // Otherwise, start as loading
  const [loading, setLoading] = useState(() => {
    return !localStorage.getItem('site_settings_cache');
  });

  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        setSettings(data);
        // Update cache
        localStorage.setItem('site_settings_cache', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error fetching site settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Listen for cross-tab updates (e.g. from Admin tab)
  useEffect(() => {
    const channel = new BroadcastChannel('site_settings_updates');
    channel.onmessage = () => {
      console.log('[Broadcast] Received update signal');
      fetchSettings();
    };
    return () => channel.close();
  }, [fetchSettings]);

  // Polling fallback to ensure freshness if Realtime fails
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSettings();
    }, 5000); // Poll every 5 seconds (reduced freq from 2s to save resources)
    return () => clearInterval(interval);
  }, [fetchSettings]);

  // Subscribe to realtime changes with aggressive update
  useSupabaseRealtime<SiteSettings>(
    'site_settings',
    (payload) => {
      console.log('[Realtime] Site settings event received:', payload);
      // Trigger a re-fetch to ensure we get the full valid data including new columns
      fetchSettings();
      
      if (payload.new) {
        // Optimistically merge, but trust fetchSettings for final truth
        const newSettings = { ...settings, ...(payload.new as SiteSettings) };
        setSettings(newSettings);
        localStorage.setItem('site_settings_cache', JSON.stringify(newSettings));
      }
    }
  );

  return { settings, loading, refetch: fetchSettings };
}
