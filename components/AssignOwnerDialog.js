"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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

export default function AssignOwnerDialog({
  horseId,
  currentOwners,
  onSuccess,
}) {
  const [open, setOpen] = useState(false);
  const [owners, setOwners] = useState([]);
  const [selectedOwnerId, setSelectedOwnerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [ownerToRemove, setOwnerToRemove] = useState(null);

  useEffect(() => {
    if (open) {
      fetchOwners();
    }
  }, [open]);

  const fetchOwners = async () => {
    try {
      const res = await fetch("/api/users/owners");
      const data = await res.json();
      setOwners(data);
    } catch (error) {
      console.error("Error fetching owners:", error);
      toast.error("Failed to load owners");
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault(); // Prevent default dialog closing

    if (!selectedOwnerId) {
      toast.error("Please select an owner");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/horses/${horseId}/assign-owner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerId: selectedOwnerId }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Owner assigned successfully!");
        setSelectedOwnerId("");
        onSuccess();
        // Close dialog after success
        setOpen(false);
      } else {
        toast.error(data.error || "Failed to assign owner");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveClick = (owner) => {
    setOwnerToRemove(owner);
    setShowRemoveDialog(true);
  };

  const handleRemoveOwner = async () => {
    if (!ownerToRemove) return;

    try {
      const res = await fetch(
        `/api/horses/${horseId}/assign-owner?ownerId=${ownerToRemove.owner.id}`,
        {
          method: "DELETE",
        }
      );

      if (res.ok) {
        toast.success("Owner removed successfully!");
        onSuccess();
        setShowRemoveDialog(false);
        setOwnerToRemove(null);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to remove owner");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred");
    }
  };

  // Filter out already assigned owners
  const availableOwners = owners.filter(
    (owner) => !currentOwners.some((co) => co.owner.id === owner.id)
  );

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        size="sm"
        className="flex items-center gap-1 sm:gap-2 flex-1 sm:flex-none justify-center min-w-0"
      >
        <svg
          className="w-4 h-4 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        <span className="truncate">Assign Owner</span>
      </Button>

      {/* Main Assign Owner Dialog */}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleAssign}>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                Assign Owner
              </AlertDialogTitle>
            </AlertDialogHeader>

            {/* Current Owners */}
            {currentOwners.length > 0 && (
              <div className="border-b pb-4 mb-4">
                <h3 className="font-semibold mb-3">Current Owners</h3>
                <div className="space-y-2">
                  {currentOwners.map((ownership) => (
                    <div
                      key={ownership.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">
                          {ownership.owner.name}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {ownership.owner.email}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        type="button"
                        onClick={() => handleRemoveClick(ownership)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Owner */}
            <div>
              <h3 className="font-semibold mb-3">Add New Owner</h3>

              {availableOwners.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm">No available owners to assign</p>
                  <p className="text-xs mt-1">
                    All owners are already assigned to this horse
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <Label htmlFor="owner-select">Select Owner</Label>
                    <select
                      id="owner-select"
                      value={selectedOwnerId}
                      onChange={(e) => setSelectedOwnerId(e.target.value)}
                      className="w-full mt-1 border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      disabled={loading}
                    >
                      <option value="">-- Select an owner --</option>
                      {availableOwners.map((owner) => (
                        <option key={owner.id} value={owner.id}>
                          {owner.name} ({owner.email})
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>

            <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
              <AlertDialogCancel
                type="button"
                onClick={() => {
                  setSelectedOwnerId("");
                  setOpen(false);
                }}
                disabled={loading}
              >
                Cancel
              </AlertDialogCancel>
              {availableOwners.length > 0 && (
                <Button
                  type="submit"
                  disabled={loading || !selectedOwnerId}
                  className="bg-purple-600 hover:bg-purple-700 focus:ring-purple-600 flex-1"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Assigning...
                    </>
                  ) : (
                    "Assign Owner"
                  )}
                </Button>
              )}
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Owner Confirmation Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-red-600"
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
              </div>
              Remove Owner?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <strong>{ownerToRemove?.owner.name}</strong> as an owner of this
              horse? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveOwner}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Remove Owner
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
