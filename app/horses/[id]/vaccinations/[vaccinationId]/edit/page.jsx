"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import toast from "react-hot-toast";

export default function EditVaccinationPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    vaccineName: "",
    dateGiven: "",
    nextDue: "",
    batchNumber: "",
    notes: "",
  });

  useEffect(() => {
    fetchVaccination();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.vaccinationId]);

  const fetchVaccination = async () => {
    try {
      const res = await fetch(
        `/api/horses/${params.id}/vaccinations/${params.vaccinationId}`
      );
      if (res.ok) {
        const data = await res.json();
        setFormData({
          vaccineName: data.vaccineName || "",
          dateGiven: new Date(data.dateGiven).toISOString().split("T")[0],
          nextDue: new Date(data.nextDue).toISOString().split("T")[0],
          batchNumber: data.batchNumber || "",
          notes: data.notes || "",
        });
      } else {
        toast.error("Vaccination not found");
        router.push(`/horses/${params.id}`);
      }
    } catch (error) {
      console.error("Error fetching vaccination:", error);
      toast.error("Failed to load vaccination");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.vaccineName.trim() || !formData.dateGiven) {
      toast.error("Vaccine name and date given are required");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(
        `/api/horses/${params.id}/vaccinations/${params.vaccinationId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      if (res.ok) {
        toast.success("Vaccination updated successfully!");
        router.push(`/horses/${params.id}`);
        router.refresh();
      } else {
        toast.error(data.error || "Failed to update vaccination");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vaccination...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/horses/${params.id}`}>
              <Button variant="outline" size="sm">
                ← Back
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Edit Vaccination
              </h1>
              <p className="text-sm text-gray-600">
                Update vaccination details
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto p-6">
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Vaccine Name */}
            <div>
              <Label htmlFor="vaccineName">
                Vaccine Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="vaccineName"
                value={formData.vaccineName}
                onChange={(e) =>
                  setFormData({ ...formData, vaccineName: e.target.value })
                }
                placeholder="e.g., Tetanus Toxoid"
                required
                className="mt-1"
              />
            </div>

            {/* Date Given and Next Due */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dateGiven">
                  Date Given <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="dateGiven"
                  type="date"
                  value={formData.dateGiven}
                  onChange={(e) =>
                    setFormData({ ...formData, dateGiven: e.target.value })
                  }
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="nextDue">Next Due Date</Label>
                <Input
                  id="nextDue"
                  type="date"
                  value={formData.nextDue}
                  onChange={(e) =>
                    setFormData({ ...formData, nextDue: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
            </div>

            {/* Batch Number */}
            <div>
              <Label htmlFor="batchNumber">Batch Number</Label>
              <Input
                id="batchNumber"
                value={formData.batchNumber}
                onChange={(e) =>
                  setFormData({ ...formData, batchNumber: e.target.value })
                }
                placeholder="e.g., TT-2024-001"
                className="mt-1"
              />
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Any additional notes..."
                rows={3}
                className="w-full mt-1 border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={saving}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}
