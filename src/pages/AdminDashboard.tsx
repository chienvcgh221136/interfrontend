import { useEffect, useState } from 'react';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { urlApi, userApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Link2, Users, MousePointerClick, TrendingUp } from 'lucide-react';

interface UrlData {
  _id: string;
  originalUrl: string;
  shortCode: string;
  clicks: number;
  createdAt: string;
}

interface UserData {
  _id: string;
  username: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [urls, setUrls] = useState<UrlData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [urlsRes, usersRes] = await Promise.all([
          urlApi.getAll(),
          userApi.getAll(),
        ]);
        setUrls(urlsRes.data);
        setUsers(usersRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0);

  const stats = [
    { 
      label: 'Total Users', 
      value: users.length, 
      icon: Users, 
      color: 'bg-purple/20 text-purple',
      trend: '+12%'
    },
    { 
      label: 'Total Links', 
      value: urls.length, 
      icon: Link2, 
      color: 'bg-primary/20 text-primary',
      trend: '+8%'
    },
    { 
      label: 'Total Clicks', 
      value: totalClicks, 
      icon: MousePointerClick, 
      color: 'bg-teal/20 text-teal',
      trend: '+23%'
    },
    { 
      label: 'Avg. Clicks/Link', 
      value: urls.length ? Math.round(totalClicks / urls.length) : 0, 
      icon: TrendingUp, 
      color: 'bg-accent/20 text-accent',
      trend: '+5%'
    },
  ];

  const recentUsers = users.slice(0, 5);
  const recentUrls = urls.slice(0, 5);

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.username}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-card rounded-xl border border-border p-6 card-hover"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                    {stat.trend}
                  </span>
                </div>
                <p className="text-3xl font-bold">{stat.value.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Users */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Users</h2>
              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : recentUsers.length === 0 ? (
                <p className="text-muted-foreground">No users yet</p>
              ) : (
                <div className="space-y-3">
                  {recentUsers.map((u) => (
                    <div
                      key={u._id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple/20 flex items-center justify-center text-purple font-semibold">
                          {u.username[0].toUpperCase()}
                        </div>
                        <span className="font-medium">{u.username}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Links */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Links</h2>
              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : recentUrls.length === 0 ? (
                <p className="text-muted-foreground">No links yet</p>
              ) : (
                <div className="space-y-3">
                  {recentUrls.map((url) => (
                    <div
                      key={url._id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                    >
                      <div className="flex-1 min-w-0 mr-4">
                        <p className="text-sm font-medium text-primary truncate">
                          /{url.shortCode}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {url.originalUrl}
                        </p>
                      </div>
                      <span className="text-sm font-medium whitespace-nowrap">
                        {url.clicks} clicks
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
