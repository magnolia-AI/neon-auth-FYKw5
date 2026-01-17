'use client';

import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertCircle, CheckCircle2, Loader2, User, Shield, Mail, Hash, Calendar, Trash2, AlertTriangle } from 'lucide-react';

export default function AccountSettingsPage() {
  const { data, isPending: isSessionPending } = authClient.useSession();
  const user = data?.user;

  const [name, setName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Verification dialog state
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'send' | 'verify'>('send');
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Delete account dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const resetVerificationDialog = () => {
    setVerificationStep('send');
    setVerificationMessage(null);
    setOtpCode('');
  };

  const handleOpenVerifyDialog = () => {
    resetVerificationDialog();
    setVerifyDialogOpen(true);
  };

  const handleSendVerificationEmail = async () => {
    if (!user?.email) return;
    
    setIsSendingVerification(true);
    setVerificationMessage(null);

    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: user.email,
        type: 'email-verification',
      });

      if (error) {
        setVerificationMessage({ type: 'error', text: error.message || 'Failed to send verification email' });
      } else {
        setVerificationMessage({ type: 'success', text: 'Code sent! Check your inbox.' });
        setVerificationStep('verify');
      }
    } catch {
      setVerificationMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setIsSendingVerification(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode.trim() || !user?.email) {
      setVerificationMessage({ type: 'error', text: 'Please enter the verification code' });
      return;
    }

    setIsVerifyingOtp(true);
    setVerificationMessage(null);

    try {
      const { error } = await authClient.emailOtp.verifyEmail({
        email: user.email,
        otp: otpCode.trim(),
      });

      if (error) {
        setVerificationMessage({ type: 'error', text: error.message || 'Invalid verification code' });
      } else {
        setVerificationMessage({ type: 'success', text: 'Email verified successfully!' });
        setTimeout(() => {
          setVerifyDialogOpen(false);
          window.location.reload();
        }, 1500);
      }
    } catch {
      setVerificationMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setDeleteError('Please type DELETE to confirm');
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const { error } = await authClient.deleteUser();

      if (error) {
        setDeleteError(error.message || 'Failed to delete account');
      } else {
        // Redirect to home after successful deletion
        window.location.href = '/';
      }
    } catch {
      setDeleteError('An unexpected error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user?.name]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateMessage(null);

    try {
      const { error } = await authClient.updateUser({
        name,
      });

      if (error) {
        setUpdateMessage({ type: 'error', text: error.message || 'Failed to update profile' });
      } else {
        setUpdateMessage({ type: 'success', text: 'Profile updated successfully' });
      }
    } catch {
      setUpdateMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isSessionPending) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              You need to be signed in to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-muted/30">
      <div className="container max-w-4xl mx-auto py-10 px-4">
        <div className="space-y-1 mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and profile information</p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                {updateMessage && (
                  <Alert variant={updateMessage.type === 'error' ? 'destructive' : 'default'} className={updateMessage.type === 'success' ? 'border-green-500 text-green-700 dark:text-green-400' : ''}>
                    {updateMessage.type === 'error' ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                    <AlertDescription>{updateMessage.text}</AlertDescription>
                  </Alert>
                )}
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      value={user.email || ''}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Contact support to change your email
                    </p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save changes'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle>Account Details</CardTitle>
                  <CardDescription>Your account information and status</CardDescription>
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* User ID */}
                <div className="rounded-lg border bg-card p-4 space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Hash className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wide">User ID</span>
                  </div>
                  <p className="font-mono text-sm truncate" title={user.id}>
                    {user.id}
                  </p>
                </div>

                {/* Account Created */}
                <div className="rounded-lg border bg-card p-4 space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wide">Member Since</span>
                  </div>
                  <p className="text-sm font-medium">
                    {user.createdAt 
                      ? new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'N/A'
                    }
                  </p>
                </div>

                {/* Email Verification Status */}
                <div className={`rounded-lg border p-4 space-y-3 ${user.emailVerified ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900' : 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900'}`}>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wide">Email Status</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {user.emailVerified ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium text-green-700 dark:text-green-300">Verified</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Not verified</span>
                      </>
                    )}
                  </div>
                  {!user.emailVerified && (
                    <Button 
                      variant="secondary"
                      size="sm" 
                      onClick={handleOpenVerifyDialog}
                      className="w-full"
                    >
                      <Mail className="mr-2 h-3 w-3" />
                      Verify now
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200 dark:border-red-900">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
                  <CardDescription>Irreversible and destructive actions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <Separator className="bg-red-200 dark:bg-red-900" />
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20">
                <div className="space-y-1">
                  <p className="font-medium text-red-900 dark:text-red-200">Delete Account</p>
                  <p className="text-sm text-red-700/90 dark:text-red-300/80">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                </div>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    setDeleteConfirmText('');
                    setDeleteError(null);
                    setDeleteDialogOpen(true);
                  }}
                  className="shrink-0"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Email Verification Dialog */}
      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Verify your email
            </DialogTitle>
            <DialogDescription>
              {verificationStep === 'send' 
                ? `We'll send a verification code to ${user.email}`
                : `Enter the 6-digit code sent to ${user.email}`
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {verificationMessage && (
              <Alert variant={verificationMessage.type === 'error' ? 'destructive' : 'default'} className={verificationMessage.type === 'success' ? 'border-green-500 text-green-700 dark:text-green-400' : ''}>
                {verificationMessage.type === 'error' ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
                <AlertDescription>{verificationMessage.text}</AlertDescription>
              </Alert>
            )}

            {verificationStep === 'verify' && (
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-lg tracking-widest"
                  maxLength={6}
                  autoFocus
                />
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {verificationStep === 'send' ? (
              <Button 
                onClick={handleSendVerificationEmail} 
                disabled={isSendingVerification}
                className="w-full sm:w-auto"
              >
                {isSendingVerification ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send verification code'
                )}
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={handleSendVerificationEmail}
                  disabled={isSendingVerification}
                  className="w-full sm:w-auto"
                >
                  {isSendingVerification ? 'Sending...' : 'Resend code'}
                </Button>
                <Button 
                  onClick={handleVerifyOtp}
                  disabled={isVerifyingOtp || otpCode.length < 6}
                  className="w-full sm:w-auto"
                >
                  {isVerifyingOtp ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify'
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              This action is permanent and cannot be undone. All your data will be permanently deleted.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You will lose access to your account and all associated data immediately.
              </AlertDescription>
            </Alert>

            {deleteError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{deleteError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="confirm-delete">
                Type <span className="font-mono font-bold">DELETE</span> to confirm
              </Label>
              <Input
                id="confirm-delete"
                type="text"
                placeholder="DELETE"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
                className="font-mono"
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isDeleting || deleteConfirmText !== 'DELETE'}
              className="w-full sm:w-auto"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
