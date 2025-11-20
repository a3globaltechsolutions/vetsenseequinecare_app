"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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

  const handleAssign = async () => {
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
        setOpen(false);
        setSelectedOwnerId("");
        onSuccess();
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

  const handleRemoveOwner = async (ownerId) => {
    if (!confirm("Are you sure you want to remove this owner?")) {
      return;
    }

    try {
      const res = await fetch(
        `/api/horses/${horseId}/assign-owner?ownerId=${ownerId}`,
        {
          method: "DELETE",
        }
      );

      if (res.ok) {
        toast.success("Owner removed successfully!");
        onSuccess();
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
        className="w-full"
      >
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
            d="M12 4v16m8-8H4"
          />
        </svg>
        Assign Owner
      </Button>

      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Assign Owner</h2>
                <button
                  onClick={() => setOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Current Owners */}
            {currentOwners.length > 0 && (
              <div className="p-6 border-b">
                <h3 className="font-semibold mb-3">Current Owners</h3>
                <div className="space-y-2">
                  {currentOwners.map((ownership) => (
                    <div
                      key={ownership.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {ownership.owner.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {ownership.owner.email}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveOwner(ownership.owner.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Owner */}
            <div className="p-6">
              <h3 className="font-semibold mb-3">Add New Owner</h3>

              {availableOwners.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
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
                    >
                      <option value="">-- Select an owner --</option>
                      {availableOwners.map((owner) => (
                        <option key={owner.id} value={owner.id}>
                          {owner.name} ({owner.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAssign}
                      disabled={loading || !selectedOwnerId}
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                    >
                      {loading ? "Assigning..." : "Assign Owner"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
