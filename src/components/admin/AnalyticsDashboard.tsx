import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Loader2, RefreshCcw, Trash2, Globe, Monitor, Smartphone, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    visitors: 0,
    pageViews: 0,
    chartData: [] as any[],
    topPages: [] as any[],
    referrers: [] as any[],
    os: [] as any[],
    devices: [] as any[],
    countries: [] as any[]
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('website_visits')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        setStats({
          visitors: 0,
          pageViews: 0,
          chartData: [],
          topPages: [],
          referrers: [],
          os: [],
          devices: [],
          countries: []
        });
        setLoading(false);
        return;
      }

      // 1. Process Chart Data
      const dailyStats = data.reduce((acc: any, visit: any) => {
        const date = new Date(visit.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!acc[date]) acc[date] = { name: date, visitors: new Set(), pageViews: 0 };
        
        acc[date].pageViews++;
        if (visit.session_id) acc[date].visitors.add(visit.session_id);
        
        return acc;
      }, {});

      const chartData = Object.values(dailyStats).map((day: any) => ({
        ...day,
        visitors: day.visitors.size
      }));

      // Helper to process counts
      const processCount = (key: string, labelKey?: string) => {
        const counts = data.reduce((acc: any, visit: any) => {
          const val = visit[key] || 'Unknown';
          acc[val] = (acc[val] || 0) + 1;
          return acc;
        }, {});
        return Object.entries(counts)
          .map(([name, count]) => ({ name, count }))
          .sort((a: any, b: any) => b.count - a.count)
          .slice(0, 5);
      };

      // Unique Visitors
      const uniqueVisitors = new Set(data.map((v: any) => v.session_id)).size;

      setStats({
        visitors: uniqueVisitors,
        pageViews: data.length,
        chartData,
        topPages: processCount('page_path'),
        referrers: processCount('referrer'),
        os: processCount('os'),
        devices: processCount('device_type'),
        countries: processCount('country')
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleResetData = async () => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบข้อมูลสถิติทั้งหมด? การกระทำนี้ไม่สามารถย้อนกลับได้')) return;
    
    setLoading(true);
    try {
      // Method 1: Try to delete with a very broad condition
      const { data, error, count } = await supabase
        .from('website_visits')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')
        .select();
      
      if (error) {
        console.error('Delete error:', error);
        
        // If RLS blocks delete, show helpful error message
        if (error.code === '42501' || error.message.includes('policy')) {
          toast.error('ไม่มีสิทธิ์ลบข้อมูล - กรุณาเพิ่ม DELETE policy ใน Supabase');
          toast.info('รัน SQL: CREATE POLICY "Allow delete" ON website_visits FOR DELETE USING (true);');
        } else {
          toast.error(`เกิดข้อผิดพลาด: ${error.message}`);
        }
        return;
      }
      
      console.log('Deleted records:', count);
      
      // Reset stats immediately
      setStats({
        visitors: 0,
        pageViews: 0,
        chartData: [],
        topPages: [],
        referrers: [],
        os: [],
        devices: [],
        countries: []
      });
      
      toast.success(`ล้างข้อมูลเรียบร้อย (ลบ ${count || 0} รายการ)`);
      
      // Fetch fresh data to confirm
      await fetchAnalytics();
    } catch (error) {
      console.error('Error resetting data:', error);
      toast.error('เกิดข้อผิดพลาดในการล้างข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8 p-2 md:p-4">
      {/* Header Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={fetchAnalytics} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <RefreshCcw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
        <Button variant="destructive" size="sm" onClick={handleResetData} className="opacity-80 hover:opacity-100">
          <Trash2 className="w-4 h-4 mr-2" />
          Reset Data
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Total Visitors" value={stats.visitors} icon={<Activity className="w-5 h-5 text-blue-500" />} sub="Unique Sessions" />
        <Card title="Page Views" value={stats.pageViews} icon={<Monitor className="w-5 h-5 text-purple-500" />} sub="Total Loads" />
        <Card title="Avg. Duration" value="--" icon={<RefreshCcw className="w-5 h-5 text-green-500" />} sub="Coming Soon" />
      </div>

      {/* Main Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Traffic Overview
          </h3>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.chartData}>
              <defs>
                <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))', 
                  borderRadius: '12px', 
                  border: '1px solid hsl(var(--border))',
                  color: 'hsl(var(--popover-foreground))'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="visitors" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorVisitors)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ListCard title="Top Pages" icon={<Monitor />} data={stats.topPages} />
        <ListCard title="Referrers" icon={<Globe />} data={stats.referrers} />
        <ListCard title="Operating Systems" icon={<Monitor />} data={stats.os} />
        <ListCard title="Devices" icon={<Smartphone />} data={stats.devices} />
        <ListCard title="Countries" icon={<Globe />} data={stats.countries} />
      </div>
    </div>
  );
};

// Sub-components for cleaner code
const Card = ({ title, value, icon, sub }: any) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"
  >
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <h4 className="text-3xl font-bold mt-2 gradient-text">{value}</h4>
      </div>
      <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
        {icon}
      </div>
    </div>
    <div className="mt-4 text-xs text-muted-foreground flex items-center gap-1">
      <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
      {sub}
    </div>
  </motion.div>
);

const ListCard = ({ title, icon, data }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"
  >
    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
      {React.cloneElement(icon, { className: "w-5 h-5 text-primary" })}
      {title}
    </h3>
    <div className="space-y-3">
      {data.map((item: any, i: number) => (
        <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-100 dark:border-slate-700">
          <span className="text-sm font-medium text-foreground/80 truncate max-w-[70%]">{item.name}</span>
          <span className="text-xs font-bold bg-primary/20 text-primary px-2 py-1 rounded-lg">{item.count}</span>
        </div>
      ))}
      {data.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">No data available</p>
      )}
    </div>
  </motion.div>
);
