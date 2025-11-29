"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, AlertTriangle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const AdminDeleteUser = ({ params }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Unwrap params Promise
    Promise.resolve(params).then((resolvedParams) => {
      setUserId(resolvedParams.id);
    });
  }, [params]);

  useEffect(() => {
    if (!userId) return;

    async function loadUser() {
      try {
        const res = await fetch(`/api/users/${userId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch user");
        }
        const data = await res.json();
        setUser(data);
      } catch (err) {
        toast.error("Failed to load user");
        router.push("/dashboard/vet/users");
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [userId, router]);

  const handleDelete = async () => {
    if (!userId) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete user");
      }

      toast.success("User deleted successfully!");
      router.push("/dashboard/vet/all-users");
    } catch (error) {
      toast.error(error.message || "Failed to delete user");
      setDeleting(false);
      setShowDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading user...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-6">
          <p className="text-red-600">User not found.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/dashboard/vet/users/${userId}`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Delete User</h1>
                <p className="text-sm text-gray-600">
                  Permanently remove user account
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Warning Card */}
        <Card className="p-6 border-red-200 bg-red-50 mb-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-red-900 mb-2">
                Warning: This action cannot be undone!
              </h2>
              <p className="text-sm text-red-800 mb-3">
                Deleting this user will permanently remove:
              </p>
              <ul className="text-sm text-red-800 space-y-2 list-disc list-inside">
                <li>User account and all personal information</li>
                <li>
                  All horse ownership records ({user.ownedHorses?.length || 0}{" "}
                  horse
                  {user.ownedHorses?.length !== 1 ? "s" : ""})
                </li>
                <li>
                  All activity logs ({user.activityLogs?.length || 0} log
                  {user.activityLogs?.length !== 1 ? "s" : ""})
                </li>
                <li>Any associated medical records and documents</li>
                <li>Login credentials and access to the system</li>
              </ul>
              <p className="text-sm text-red-900 font-semibold mt-4">
                This action is PERMANENT and cannot be reversed!
              </p>
            </div>
          </div>
        </Card>

        {/* User Information Card */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            User Information to be Deleted
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium">
                {user.title ? `${user.title}. ${user.name}` : user.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Role</p>
              <p className="font-medium capitalize">{user.role}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-medium">{user.phone || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Owned Horses</p>
              <p className="font-medium">{user.ownedHorses?.length || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Activity Logs</p>
              <p className="font-medium">{user.activityLogs?.length || 0}</p>
            </div>
          </div>
        </Card>

        {/* Owned Horses List */}
        {user.ownedHorses?.length > 0 && (
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">
              Horses Owned by This User
            </h2>
            <div className="space-y-2">
              {user.ownedHorses.map((ownership) => (
                <div
                  key={ownership.id}
                  className="p-3 bg-gray-50 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{ownership.horse.name}</p>
                    <p className="text-sm text-gray-600">
                      {ownership.horse.breed} • {ownership.horse.age} years
                    </p>
                  </div>
                  <span className="text-xs text-red-600 font-medium">
                    Will be unassigned
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-3">
              Note: Horses will not be deleted, only the ownership records will
              be removed.
            </p>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="destructive"
            onClick={() => setShowDialog(true)}
            className="flex-1"
            disabled={deleting}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Delete User Permanently
          </Button>
          <Link href={`/dashboard/vet/users/${userId}`} className="flex-1">
            <Button variant="outline" className="w-full" disabled={deleting}>
              Cancel
            </Button>
          </Link>
        </div>
      </main>

      {/* Confirmation Dialog */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              Confirm User Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Are you absolutely sure you want to delete{" "}
                <strong className="text-gray-900">{user.name}</strong>?
              </p>
              <p className="text-red-600 font-semibold">
                This will permanently delete:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>The user account</li>
                <li>{user.ownedHorses?.length || 0} horse ownership records</li>
                <li>{user.activityLogs?.length || 0} activity logs</li>
              </ul>
              <p className="text-red-600 font-bold">
                This action CANNOT be undone!
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Yes, Delete User
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDeleteUser;
