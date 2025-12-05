import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { UrlCard } from '@/components/UrlCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UTMBuilder } from '@/components/UTMBuilder';
import { urlApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { Link2, BarChart3, MousePointerClick, Plus, ChevronDown, ChevronUp } from 'lucide-react';

interface UrlData {
  _id: string;
  originalUrl: string;
  shortCode: string;
  clicks: number;
  createdAt: string;
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [urls, setUrls] = useState<UrlData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Shorten form state
  const [showForm, setShowForm] = useState(false);
  const [longUrl, setLongUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [utmParams, setUtmParams] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    try {
      const response = await urlApi.getAll();
      setUrls(response.data);
    } catch (error) {
      console.error('Failed to fetch URLs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!longUrl.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    setSubmitting(true);
    try {
      let finalUrl = longUrl;
      if (utmParams) {
        const separator = longUrl.includes('?') ? '&' : '?';
        finalUrl = `${longUrl}${separator}${utmParams}`;
      }

      await customCode
        ? urlApi.shortenCustom({ originalUrl: finalUrl, customCode })
        : urlApi.shorten({ originalUrl: finalUrl });

      toast.success('Link created!');
      setLongUrl('');
      setCustomCode('');
      setShowForm(false);
      fetchUrls();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create link');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await urlApi.delete(id);
      setUrls((prev) => prev.filter((url) => url._id !== id));
      toast.success('Link deleted');
    } catch (error) {
      toast.error('Failed to delete link');
    }
  };

  const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0);

  const stats = [
    { label: 'Total Links', value: urls.length, icon: Link2, color: 'text-primary' },
    { label: 'Total Clicks', value: totalClicks, icon: MousePointerClick, color: 'text-teal' },
    { label: 'Avg. Clicks', value: urls.length ? Math.round(totalClicks / urls.length) : 0, icon: BarChart3, color: 'text-accent' },
  ];

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
              <form onSubmit={handleShorten} className="space-y-4">
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
                  <Button type="submit" variant="gradient" disabled={submitting}>
                    {submitting ? 'Creating...' : 'Create Link'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Recent Links */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Your Links</h2>
            {loading ? (
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
                    onDelete={handleDelete}
                    onViewAnalytics={(code) => navigate(`/analytics/${code}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
