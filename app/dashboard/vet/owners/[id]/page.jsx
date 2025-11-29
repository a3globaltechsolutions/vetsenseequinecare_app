"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import toast from "react-hot-toast";
import Image from "next/image";

export default function OwnerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    fetchOwner();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchOwner = async () => {
    try {
      const res = await fetch(`/api/users/owners/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setOwner(data);
      } else {
        toast.error("Owner not found");
        router.push("/dashboard/vet/owners");
      }
    } catch (error) {
      toast.error("Failed to load owner");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/users/owners/${params.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Owner deleted successfully");
        router.push("/dashboard/vet/owners");
      } else {
        toast.error(data.error || "Failed to delete owner");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const formatOwnerName = (owner) => {
    return owner.title ? `${owner.title} ${owner.name}` : owner.name;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading owner details...</p>
        </div>
      </div>
    );
  }

  if (!owner) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/vet/owners">
              <Button variant="outline" size="sm">
                ← Back
              </Button>
            </Link>
            <div className="hidden lg:block">
              <h1 className="text-xl font-bold text-gray-900">
                {formatOwnerName(owner)}
              </h1>
              <p className="text-sm text-gray-600">Owner Details</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/dashboard/vet/owners/${owner.id}/edit`}>
              <Button variant="outline" size="sm">
                Edit
              </Button>
            </Link>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Owner Info */}
          <div className="md:col-span-1 space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-purple-600">
                    {owner.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {formatOwnerName(owner)}
                  </h2>
                  <Badge variant="secondary">OWNER</Badge>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{owner.email}</p>
                </div>
                {owner.phone && (
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{owner.phone}</p>
                  </div>
                )}
                {(owner.address || owner.state || owner.country) && (
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium">
                      {[owner.address, owner.state, owner.country]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Member Since</p>
                  <p className="font-medium">
                    {new Date(owner.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Horses Owned</p>
                  <p className="font-medium">
                    {owner.ownedHorses?.length || 0}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Horses */}
          <div className="md:col-span-2">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Owned Horses</h3>

              {owner.ownedHorses && owner.ownedHorses.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {owner.ownedHorses.map((ownership) => (
                    <Card
                      key={ownership.id}
                      className="p-4 hover:shadow-lg transition-shadow"
                    >
                      {ownership.horse.imageUrl ? (
                        <Image
                          src={ownership.horse.imageUrl}
                          alt={ownership.horse.name}
                          width={300}
                          height={200}
                          className="w-full h-32 object-cover rounded mb-3"
                        />
                      ) : (
                        <div className="w-full h-32 bg-gradient-to-br from-purple-100 to-purple-200 rounded mb-3 flex items-center justify-center">
                          <svg
                            className="w-12 h-12 text-purple-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                            />
                          </svg>
                        </div>
                      )}
                      <h4 className="font-bold mb-1">{ownership.horse.name}</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        {ownership.horse.breed || "Unknown breed"}
                      </p>
                      <Link href={`/horses/${ownership.horse.id}`}>
                        <Button size="sm" variant="outline" className="w-full">
                          View Horse
                        </Button>
                      </Link>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  <p className="text-lg font-medium mb-2">No horses assigned</p>
                  <p className="text-sm">
                    Assign horses to this owner from the horse detail page
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-[95vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <span className="break-words">
                Delete {formatOwnerName(owner)}?
              </span>
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to delete{" "}
                  <strong>{formatOwnerName(owner)}</strong>? This action cannot
                  be undone.
                </p>

                {/* Warning about horses if they exist */}
                {owner.ownedHorses && owner.ownedHorses.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                    <p className="font-semibold text-amber-900 mb-1">
                      Important Notice:
                    </p>
                    <ul className="list-disc list-inside text-amber-800 space-y-1">
                      <li>
                        This owner has {owner.ownedHorses.length} horse
                        {owner.ownedHorses.length !== 1 ? "s" : ""} assigned
                      </li>
                      <li>All horse assignments will be removed</li>
                      <li>Horses themselves will not be deleted</li>
                    </ul>
                  </div>
                )}

                {/* General warning */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                  <p className="font-semibold text-red-900 mb-1">
                    This will permanently delete:
                  </p>
                  <ul className="list-disc list-inside text-red-800 space-y-1">
                    <li>Owner account and all personal information</li>
                    <li>Login credentials</li>
                    <li>Ownership history</li>
                    <li>All associated data</li>
                  </ul>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
            <AlertDialogCancel
              disabled={deleting}
              className="m-0 sm:m-0"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 m-0 sm:m-0"
            >
              {deleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete Owner
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
