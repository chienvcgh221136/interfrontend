import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { urlApi } from '@/lib/api';
import { 
  ArrowLeft, 
  MousePointerClick, 
  Globe, 
  Smartphone, 
  Monitor,
  Tablet,
  TrendingUp,
  Calendar
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

// Generate fake analytics data
const generateFakeData = (clicks: number) => {
  const days = 7;
  const clicksPerDay = [];
  let remaining = clicks;

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayClicks = i === 0 ? remaining : Math.floor(Math.random() * (remaining / (i + 1)) * 1.5);
    remaining -= dayClicks;
    clicksPerDay.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      clicks: Math.max(0, dayClicks),
    });
  }

  const sources = [
    { name: 'Direct', value: Math.floor(clicks * 0.4) },
    { name: 'Social', value: Math.floor(clicks * 0.25) },
    { name: 'Referral', value: Math.floor(clicks * 0.2) },
    { name: 'Email', value: Math.floor(clicks * 0.15) },
  ];

  const devices = [
    { name: 'Desktop', value: Math.floor(clicks * 0.45), icon: Monitor },
    { name: 'Mobile', value: Math.floor(clicks * 0.45), icon: Smartphone },
    { name: 'Tablet', value: Math.floor(clicks * 0.1), icon: Tablet },
  ];

  const countries = [
    { name: 'United States', clicks: Math.floor(clicks * 0.35) },
    { name: 'Vietnam', clicks: Math.floor(clicks * 0.2) },
    { name: 'United Kingdom', clicks: Math.floor(clicks * 0.15) },
    { name: 'Germany', clicks: Math.floor(clicks * 0.1) },
    { name: 'Others', clicks: Math.floor(clicks * 0.2) },
  ];

  return { clicksPerDay, sources, devices, countries };
};

const COLORS = ['#ff6b4a', '#8b5cf6', '#14b8a6', '#f59e0b'];

export default function Analytics() {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [urlData, setUrlData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await urlApi.getAll();
        const url = response.data.find((u: any) => u.shortCode === shortCode);
        if (url) {
          setUrlData(url);
          setAnalytics(generateFakeData(url.clicks || 0));
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [shortCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  if (!urlData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Link not found</p>
          <Button asChild>
            <Link to="/">Go Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to={-1 as any}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <h1 className="text-2xl font-bold mb-2">Link Analytics</h1>
          <a
            href={`${baseUrl}/${shortCode}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {baseUrl}/{shortCode}
          </a>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <MousePointerClick className="w-5 h-5 text-primary" />
              </div>
              <span className="text-muted-foreground">Total Clicks</span>
            </div>
            <p className="text-3xl font-bold">{urlData.clicks || 0}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
              <span className="text-muted-foreground">Avg. Daily</span>
            </div>
            <p className="text-3xl font-bold">{Math.round((urlData.clicks || 0) / 7)}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-teal/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-teal" />
              </div>
              <span className="text-muted-foreground">Created</span>
            </div>
            <p className="text-lg font-bold">
              {new Date(urlData.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Clicks Over Time */}
          <div className="bg-card rounded-xl border border-border p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Clicks Over Time</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics?.clicksPerDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="clicks"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold mb-4">Traffic Sources</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics?.sources}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analytics?.sources.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {analytics?.sources.map((source: any, index: number) => (
                <div key={source.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-muted-foreground">{source.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Devices */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold mb-4">Devices</h2>
            <div className="space-y-4">
              {analytics?.devices.map((device: any) => {
                const percentage = urlData.clicks 
                  ? Math.round((device.value / urlData.clicks) * 100) 
                  : 0;
                return (
                  <div key={device.name}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <device.icon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{device.name}</span>
                      </div>
                      <span className="text-sm font-medium">{percentage}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full gradient-bg rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Countries */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Top Countries</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.countries} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="clicks" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Note about fake data */}
        <p className="text-xs text-muted-foreground text-center mt-8">
          Note: Detailed analytics data is simulated for demonstration purposes.
        </p>
      </div>
    </div>
  );
}
