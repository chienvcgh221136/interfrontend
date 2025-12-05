import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { urlApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { 
  Search, 
  Link2, 
  Trash2, 
  ExternalLink,
  BarChart3,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UrlData {
  _id: string;
  originalUrl: string;
  shortCode: string;
  clicks: number;
  createdAt: string;
}

export default function AdminLinks() {
  const navigate = useNavigate();
  const [urls, setUrls] = useState<UrlData[]>([]);
  const [filteredUrls, setFilteredUrls] = useState<UrlData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchUrls();
  }, []);

  useEffect(() => {
    if (search.trim()) {
      const filtered = urls.filter(
        (url) =>
          url.originalUrl.toLowerCase().includes(search.toLowerCase()) ||
          url.shortCode.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredUrls(filtered);
    } else {
      setFilteredUrls(urls);
    }
  }, [search, urls]);

  const fetchUrls = async () => {
    try {
      const response = await urlApi.getAll();
      setUrls(response.data);
      setFilteredUrls(response.data);
    } catch (error) {
      console.error('Failed to fetch URLs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return;
    
    try {
      await urlApi.delete(id);
      setUrls((prev) => prev.filter((url) => url._id !== id));
      toast.success('Link deleted');
    } catch (error) {
      toast.error('Failed to delete link');
    }
  };

  const truncateUrl = (url: string, maxLength: number = 40) => {
    return url.length > maxLength ? url.substring(0, maxLength) + '...' : url;
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold">All Links</h1>
              <p className="text-muted-foreground">Manage all shortened links in the system</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search links..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading...
            </div>
          ) : filteredUrls.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <Link2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {search ? 'No links found matching your search' : 'No links in the system'}
              </p>
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="text-left p-4 font-medium text-muted-foreground">Short Link</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Original URL</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Clicks</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Created</th>
                      <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUrls.map((url) => (
                      <tr key={url._id} className="border-t border-border hover:bg-secondary/30 transition-colors">
                        <td className="p-4">
                          <a
                            href={`${baseUrl}/${url.shortCode}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline font-medium flex items-center gap-1"
                          >
                            /{url.shortCode}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          <span title={url.originalUrl}>
                            {truncateUrl(url.originalUrl)}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-medium">{url.clicks}</span>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {new Date(url.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/analytics/${url.shortCode}`)}>
                                <BarChart3 className="w-4 h-4 mr-2" />
                                Analytics
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(url._id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
