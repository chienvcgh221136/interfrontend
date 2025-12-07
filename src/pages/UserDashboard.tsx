import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { UrlCard } from '@/components/UrlCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UTMBuilder } from '@/components/UTMBuilder';
import { urlApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { Link2, BarChart3, MousePointerClick, Plus, ChevronDown, ChevronUp, Save } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface UrlData {
  _id: string;
  originalUrl: string;
  shortCode: string;
  clicks: number;
  createdAt: string;
}

// Hàm tạo dữ liệu giả cho biểu đồ của user
const generateUserFakeData = (urls: UrlData[]) => {
  const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0);
  const days = 7;
  const clicksPerDay = [];
  let remaining = totalClicks;

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
  return { clicksPerDay };
};

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Shorten form state
  const [showForm, setShowForm] = useState(false);
  const [longUrl, setLongUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [utmParams, setUtmParams] = useState('');

  // Edit Modal State
  const [editingUrl, setEditingUrl] = useState<UrlData | null>(null);
  const [editOriginalUrl, setEditOriginalUrl] = useState('');
  const [editShortCode, setEditShortCode] = useState('');


  const { data: urls = [], isLoading: isLoadingUrls } = useQuery<UrlData[]>({
    queryKey: ['userUrls'],
    queryFn: async () => (await urlApi.getAll()).data,
  });

  const shortenMutation = useMutation({
    mutationFn: (data: { originalUrl: string; customCode?: string }) =>
      data.customCode
        ? urlApi.shortenCustom({ originalUrl: data.originalUrl, customCode: data.customCode })
        : urlApi.shorten({ originalUrl: data.originalUrl }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userUrls'] });
      toast.success('Link created!');
      setLongUrl('');
      setCustomCode('');
      setShowForm(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create link');
    },
  });

  const handleShortenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!longUrl.trim()) {
      toast.error('Please enter a URL');
      return;
    }
    let finalUrl = longUrl;
    if (utmParams) {
      const separator = longUrl.includes('?') ? '&' : '?';
      finalUrl = `${longUrl}${separator}${utmParams}`;
    }
    shortenMutation.mutate({ originalUrl: finalUrl, customCode: customCode || undefined });
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => urlApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userUrls'] });
      toast.success('Link deleted');
    },
    onError: () => toast.error('Failed to delete link'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { originalUrl?: string; shortCode?: string } }) =>
      urlApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userUrls'] });
      toast.success('Link updated successfully!');
      setEditingUrl(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update link');
    },
  });

  const handleOpenEditModal = (url: UrlData) => {
    setEditingUrl(url);
    setEditOriginalUrl(url.originalUrl);
    setEditShortCode(url.shortCode);
  };

  const handleUpdateSubmit = () => {
    if (!editingUrl) return;

    const changes: { originalUrl?: string; shortCode?: string } = {};
    if (editOriginalUrl !== editingUrl.originalUrl) {
      changes.originalUrl = editOriginalUrl;
    }
    if (editShortCode !== editingUrl.shortCode) {
      changes.shortCode = editShortCode;
    }

    if (Object.keys(changes).length > 0) {
      updateMutation.mutate({ id: editingUrl._id, data: changes });
    } else {
      toast('No changes were made.');
      setEditingUrl(null);
    }
  };

  const { stats, aggregatedAnalytics } = useMemo(() => {
    const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0);
    const stats = [
      { label: 'Total Links', value: urls.length, icon: Link2, color: 'text-primary' },
      { label: 'Total Clicks', value: totalClicks, icon: MousePointerClick, color: 'text-teal' },
      { label: 'Avg. Clicks', value: urls.length ? Math.round(totalClicks / urls.length) : 0, icon: BarChart3, color: 'text-accent' },
    ];
    const aggregatedAnalytics = generateUserFakeData(urls);
    return { stats, aggregatedAnalytics };
  }, [urls]);

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      
      <main className="flex-1 p-6 lg:p-8 lg:ml-0">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Welcome back, {user?.username}!</h1>
            <p className="text-muted-foreground">Here's what's happening with your links.</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-card rounded-xl border border-border p-6 card-hover"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-secondary flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Create Link Button */}
          <div className="mb-6">
            <Button
              onClick={() => setShowForm(!showForm)}
              variant="gradient"
              className="w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Link
              {showForm ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
            </Button>
          </div>

          {/* Create Link Form */}
          {showForm && (
            <div className="bg-card rounded-xl border border-border p-6 mb-8 animate-fade-in">
              <h3 className="text-lg font-semibold mb-4">Create a new short link</h3>
              <form onSubmit={handleShortenSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Long URL</label>
                    <Input
                      type="url"
                      placeholder="https://example.com/very-long-url"
                      value={longUrl}
                      onChange={(e) => setLongUrl(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Custom code (optional)</label>
                    <Input
                      placeholder="my-custom-link"
                      value={customCode}
                      onChange={(e) => setCustomCode(e.target.value)}
                    />
                  </div>
                </div>
                <UTMBuilder onUTMChange={setUtmParams} />
                <div className="flex gap-3">
                  <Button type="submit" variant="gradient" disabled={shortenMutation.isLoading}>
                    {shortenMutation.isLoading ? 'Creating...' : 'Create Link'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Aggregated Clicks Chart for User */}
          <div className="bg-card rounded-xl border border-border p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Your Clicks Over Time</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={aggregatedAnalytics?.clicksPerDay}>
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
                  <Line type="monotone" dataKey="clicks" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          

          {/* Recent Links */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Your Links</h2>
            {isLoadingUrls ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading...
              </div>
            ) : urls.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-xl border border-border">
                <Link2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No links yet. Create your first one!</p>
                <Button variant="gradient" onClick={() => setShowForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Link
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {urls.map((url) => (
                  <UrlCard
                    key={url._id}
                    id={url._id}
                    originalUrl={url.originalUrl}
                    shortCode={url.shortCode}
                    clicks={url.clicks}
                    createdAt={url.createdAt}
                    onDelete={deleteMutation.mutate}
                    onEdit={handleOpenEditModal as any}
                    onViewAnalytics={(code) => navigate(`/analytics/${code}`)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Edit Link Modal */}
          <Dialog open={!!editingUrl} onOpenChange={() => setEditingUrl(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Link</DialogTitle>
                <DialogDescription>
                  Modify the original URL or the custom short code.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-original-url">Original URL</Label>
                  <Input
                    id="edit-original-url"
                    value={editOriginalUrl}
                    onChange={(e) => setEditOriginalUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-short-code">Short Code</Label>
                  <div className="flex items-center">
                    <span className="px-3 py-2 bg-muted border border-r-0 border-border rounded-l-md text-sm text-muted-foreground">
                      {`${(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/https?:\/\//, '')}/`}
                    </span>
                    <Input
                      id="edit-short-code"
                      value={editShortCode}
                      onChange={(e) => setEditShortCode(e.target.value)}
                      className="rounded-l-none"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingUrl(null)}>Cancel</Button>
                <Button onClick={handleUpdateSubmit} disabled={updateMutation.isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  {updateMutation.isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}
