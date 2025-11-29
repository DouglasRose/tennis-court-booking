import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Link2, Plus, Pencil, Trash2, Eye, EyeOff, CheckCircle2, Copy, RefreshCw, AlertTriangle } from 'lucide-react';
import { Separator } from './ui/separator';
import { toast } from 'sonner';

export interface ConnectedAccount {
  id: string;
  name: string;
  username: string;
  password: string;
  addedDate: string;
  lastUsed?: string;
  status: 'active' | 'error';
}

interface ConnectedAccountsSectionProps {
  accounts: ConnectedAccount[];
  onAdd: (account: Omit<ConnectedAccount, 'id' | 'addedDate' | 'status'>) => void;
  onEdit: (id: string, updates: Partial<ConnectedAccount>) => void;
  onDelete: (id: string) => void;
}

// Generate a secure random password
const generateSecurePassword = (): string => {
  const length = 16;
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*-_=+';
  const allChars = uppercase + lowercase + numbers + symbols;
  
  let password = '';
  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

export function ConnectedAccountsSection({ accounts, onAdd, onEdit, onDelete }: ConnectedAccountsSectionProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);
  const [editingAccount, setEditingAccount] = useState<ConnectedAccount | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [showFormPassword, setShowFormPassword] = useState(false);

  const resetForm = () => {
    setFormData({ name: '', username: '', password: generateSecurePassword() });
    setShowFormPassword(true);
  };

  const openAddDialog = () => {
    setFormData({ name: '', username: '', password: generateSecurePassword() });
    setShowFormPassword(true);
    setIsAddDialogOpen(true);
  };

  const regeneratePassword = () => {
    setFormData({ ...formData, password: generateSecurePassword() });
    toast.success('New password generated');
  };

  const copyPassword = (password: string) => {
    navigator.clipboard.writeText(password);
    toast.success('Password copied to clipboard');
  };

  const handleAdd = () => {
    if (formData.name && formData.username && formData.password) {
      onAdd(formData);
      resetForm();
      setIsAddDialogOpen(false);
    }
  };

  const handleEdit = () => {
    if (editingAccount && formData.name && formData.username && formData.password) {
      onEdit(editingAccount.id, {
        name: formData.name,
        username: formData.username,
        password: formData.password,
      });
      resetForm();
      setIsEditDialogOpen(false);
      setEditingAccount(null);
    }
  };

  const handleDelete = () => {
    if (deleteAccountId) {
      onDelete(deleteAccountId);
      setDeleteAccountId(null);
    }
  };

  const openEditDialog = (account: ConnectedAccount) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      username: account.username,
      password: account.password,
    });
    setIsEditDialogOpen(true);
  };

  const togglePasswordVisibility = (accountId: string) => {
    setShowPassword(prev => ({
      ...prev,
      [accountId]: !prev[accountId],
    }));
  };

  const maskPassword = (password: string) => {
    return '•'.repeat(password.length);
  };

  return (
    <Card className="p-8">
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-slate-900 mb-1">
              <Link2 className="size-5 inline mr-2" />
              Connected Booking Accounts
            </h3>
            <p className="text-slate-600">
              Manage your tennis court booking website credentials
            </p>
          </div>
          <Button onClick={openAddDialog}>
            <Plus className="size-4 mr-2" />
            Add Account
          </Button>
        </div>

        {accounts.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
            <Link2 className="size-12 mx-auto text-slate-400 mb-4" />
            <h4 className="text-slate-900 mb-2">No accounts connected</h4>
            <p className="text-slate-600 mb-4">
              Connect your tennis booking website account to enable automated bookings
            </p>
            <Button onClick={openAddDialog}>
              <Plus className="size-4 mr-2" />
              Add Your First Account
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-slate-900">{account.name}</h4>
                      <Badge
                        variant={account.status === 'active' ? 'default' : 'destructive'}
                        className="gap-1"
                      >
                        {account.status === 'active' && <CheckCircle2 className="size-3" />}
                        {account.status === 'active' ? 'Active' : 'Error'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-slate-600">
                      <div className="flex items-center gap-2">
                        <span className="w-24">Username:</span>
                        <span>{account.username}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-24">Password:</span>
                        <span className="font-mono">
                          {showPassword[account.id] ? account.password : maskPassword(account.password)}
                        </span>
                        <button
                          onClick={() => togglePasswordVisibility(account.id)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          {showPassword[account.id] ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </button>
                        <button
                          onClick={() => copyPassword(account.password)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <Copy className="size-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-24">Added:</span>
                        <span>{account.addedDate}</span>
                      </div>
                      {account.lastUsed && (
                        <div className="flex items-center gap-2">
                          <span className="w-24">Last used:</span>
                          <span>{account.lastUsed}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(account)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteAccountId(account.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Account Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
        setIsAddDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Add Booking Account</DialogTitle>
            <DialogDescription>
              Connect your tennis court booking website account
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 overflow-y-auto">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertTriangle className="size-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-amber-900">
                    <strong>Important Security Requirement</strong>
                  </p>
                  <p className="text-amber-800">
                    For your security, you must use the randomly generated password below. Go to the tennis booking website 
                    and change your account password to match this one.
                  </p>
                  <p className="text-amber-800">
                    This ensures that even if our system is compromised, hackers won't gain access to your personal passwords 
                    used for banking, email, or other sensitive accounts.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="add-name">Account Name</Label>
              <Input
                id="add-name"
                placeholder="e.g., My Main Account"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <p className="text-slate-600 mt-1">
                A friendly name to identify this account
              </p>
            </div>

            <Separator />

            <div>
              <Label htmlFor="add-username">Tennis Website Username</Label>
              <Input
                id="add-username"
                placeholder="Your booking site username or email"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Generated Secure Password</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={regeneratePassword}
                  >
                    <RefreshCw className="size-4 mr-2" />
                    Generate New
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => copyPassword(formData.password)}
                  >
                    <Copy className="size-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </div>
              <div className="relative">
                <Input
                  id="add-password"
                  type={showFormPassword ? 'text' : 'password'}
                  value={formData.password}
                  readOnly
                  className="font-mono bg-slate-50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowFormPassword(!showFormPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showFormPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              <p className="text-slate-600 mt-1">
                Copy this password and set it on the tennis booking website
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-900">
                <strong>Setup Steps:</strong>
              </p>
              <ol className="text-blue-800 mt-2 space-y-1 ml-4 list-decimal">
                <li>Copy the generated password above</li>
                <li>Go to the tennis booking website</li>
                <li>Log in with your current credentials</li>
                <li>Change your password to the generated one</li>
                <li>Come back here and complete the setup</li>
              </ol>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={!formData.name || !formData.username}>
              <Plus className="size-4 mr-2" />
              Add Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Account Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) {
          resetForm();
          setEditingAccount(null);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Booking Account</DialogTitle>
            <DialogDescription>
              Update your account name, username, or reset the password
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-name">Account Name</Label>
              <Input
                id="edit-name"
                placeholder="e.g., My Main Account"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <Separator />

            <div>
              <Label htmlFor="edit-username">Tennis Website Username</Label>
              <Input
                id="edit-username"
                placeholder="Your booking site username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Secure Password</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={regeneratePassword}
                  >
                    <RefreshCw className="size-4 mr-2" />
                    Reset Password
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => copyPassword(formData.password)}
                  >
                    <Copy className="size-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </div>
              <div className="relative">
                <Input
                  id="edit-password"
                  type={showFormPassword ? 'text' : 'password'}
                  value={formData.password}
                  readOnly
                  className="font-mono bg-slate-50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowFormPassword(!showFormPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showFormPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              <p className="text-slate-600 mt-1">
                Click "Reset Password" to generate a new one, then update it on the tennis website
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              resetForm();
              setEditingAccount(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteAccountId} onOpenChange={(open) => !open && setDeleteAccountId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this connected account? This action cannot be undone.
              Any automated bookings using this account will be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}