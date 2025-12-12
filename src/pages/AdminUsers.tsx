import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { userApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { 
  Search, 
  Users, 
  Trash2, 
  Edit, 
  MoreVertical,
  User,
  ExternalLink,
  ChevronDown
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
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

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
  urls: UrlData[]; // Thêm trường này
}

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Edit modal state
  const [editUser, setEditUser] = useState<UserData | null>(null);
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const baseUrl = import.meta.env.VITE_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (search.trim()) {
      const filtered = users.filter((user) =>
        user.username.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [search, users]);

  const fetchUsers = async () => {
    try {
      const response = await userApi.getAll();
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await userApi.delete(id);
      setUsers((prev) => prev.filter((user) => user._id !== id));
      toast.success('User deleted');
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const openEditModal = (user: UserData) => {
    setEditUser(user);
    setEditUsername(user.username);
    setEditPassword('');
  };

  const handleEdit = async () => {
    if (!editUser) return;

    setSaving(true);
    try {
      const updateData: { username?: string; password?: string } = {};
      if (editUsername !== editUser.username) {
        updateData.username = editUsername;
      }
      if (editPassword) {
        updateData.password = editPassword;
      }

      if (Object.keys(updateData).length === 0) {
        toast.error('No changes to save');
        setSaving(false);
        return;
      }

      await userApi.update(editUser._id, updateData);
      setUsers((prev) =>
        prev.map((u) =>
          u._id === editUser._id ? { ...u, username: editUsername } : u
        )
      );
      toast.success('User updated');
      setEditUser(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold">User Management</h1>
              <p className="text-muted-foreground">Manage all registered users</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
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
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {search ? 'No users found matching your search' : 'No users yet'}
              </p>
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="text-left p-4 font-medium text-muted-foreground w-full">User & Links</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Shortened links</th>
                      <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="border-t border-border">
                        <td className="p-4" colSpan={3}> {/* Colspan 3 để bao gồm cả cột "Shortened links" */}
                          <details className="group">
                            <summary className="flex items-center justify-between cursor-pointer list-none">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-purple/20 flex items-center justify-center text-purple font-semibold">
                                  {user.username[0].toUpperCase()}
                                </div>
                                <div>
                                  <span className="font-medium">{user.username}</span>
                                  <p className="text-xs text-muted-foreground">
                                    Created on {new Date(user.createdAt).toLocaleDateString()} | {user.urls?.length || 0} link(s)
                                  </p>
                                </div>
                            </div>
                              <div className="flex items-center">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => openEditModal(user)}>
                                      <Edit className="w-4 h-4 mr-2" />
                                      Edit User
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleDelete(user._id)}
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete User
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                                <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform group-open:rotate-180" />
                              </div>
                            </summary>
                            <div className="pl-12 pt-4 space-y-2">
                              {user.urls?.length > 0 ? user.urls.map(url => (
                                <div key={url._id} className="flex items-center justify-between text-sm p-2 rounded-md bg-secondary/30">
                                  <a href={`${baseUrl}/${url.shortCode}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                                    /{url.shortCode} <ExternalLink className="w-3 h-3" />
                                  </a>
                                  <span className="text-muted-foreground">{url.clicks} clicks</span>
                                </div>
                              )) : (
                                <p className="text-sm text-muted-foreground">This user has not created any links.</p>
                              )}
                            </div>
                          </details>
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

      {/* Edit User Modal */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-username">Username</Label>
              <Input
                id="edit-username"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">New Password (optional)</Label>
              <Input
                id="edit-password"
                type="password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
