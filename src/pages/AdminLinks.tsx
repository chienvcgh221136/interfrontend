import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { urlApi } from '@/lib/api';
import { truncateUrl } from '@/lib/utils';
import toast from 'react-hot-toast';
import { 
  Search, 
  Link2, 
  Trash2, 
  ExternalLink,
  Edit,
  BarChart3,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  owner?: { username: string };
}

export default function AdminLinks() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  // Edit Modal State
  const [editingUrl, setEditingUrl] = useState<UrlData | null>(null);
  const [editOriginalUrl, setEditOriginalUrl] = useState('');
  const [editShortCode, setEditShortCode] = useState('');

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const { data: urls = [], isLoading } = useQuery<UrlData[]>({
    queryKey: ['adminAllUrls'],
    queryFn: async () => (await urlApi.getAll()).data,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => urlApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAllUrls'] });
      toast.success('Link deleted');
    },
    onError: () => toast.error('Failed to delete link'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { originalUrl?: string; shortCode?: string } }) =>
      urlApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAllUrls'] });
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

  const filteredUrls = useMemo(() => {
    if (!search.trim()) return urls;
    const lowercasedSearch = search.toLowerCase();
    return urls.filter(
      (url) =>
        (url.originalUrl && url.originalUrl.toLowerCase().includes(lowercasedSearch)) ||
        (url.shortCode && url.shortCode.toLowerCase().includes(lowercasedSearch)) ||
        (url.owner?.username && url.owner.username.toLowerCase().includes(lowercasedSearch))
    );
  }, [search, urls]);

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

          {isLoading ? (
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
                      <th className="text-left p-4 font-medium text-muted-foreground">Owner</th>
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
                            {truncateUrl(url.originalUrl, 40)}
                          </span>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {url.owner?.username || 'N/A'}
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
                              <DropdownMenuItem onClick={() => handleOpenEditModal(url)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => deleteMutation.mutate(url._id)}
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
                {updateMutation.isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
