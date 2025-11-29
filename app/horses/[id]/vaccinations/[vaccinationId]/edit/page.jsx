/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import toast from "react-hot-toast";
import { addYears } from "date-fns";

export default function EditVaccinationPage() {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentVet, setCurrentVet] = useState(null);

  const [formData, setFormData] = useState({
    vaccineName: "",
    dateGiven: "",
    nextDue: "",
    batchNumber: "",
    administeredBy: "",
    certificateNo: "",
    notes: "",
  });

  // Nigerian standard vaccines (same as Add)
  const nigerianVaccines = [
    "African Horse Sickness",
    "Tetanus",
    "Equine Influenza",
    "Rabies",
    "Strangles",
  ];

  useEffect(() => {
    fetchVaccination();
    fetchCurrentVet();
  }, [params.vaccinationId]);

  const fetchCurrentVet = async () => {
    try {
      const res = await fetch("/api/auth/session");
      if (res.ok) {
        const session = await res.json();
        setCurrentVet(session.user);

        if (session?.user?.name) {
          setFormData((prev) => ({
            ...prev,
            administeredBy:
              prev.administeredBy ||
              `${session.user.name} (${session.user.title || "DVM"})`,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching vet:", error);
    }
  };

  const fetchVaccination = async () => {
    try {
      const res = await fetch(
        `/api/horses/${params.id}/vaccinations/${params.vaccinationId}`
      );

      if (!res.ok) {
        toast.error("Vaccination not found");
        return router.push(`/horses/${params.id}`);
      }

      const data = await res.json();

      setFormData({
        vaccineName: data.vaccineName,
        dateGiven: new Date(data.dateGiven).toISOString().split("T")[0],
        nextDue: new Date(data.nextDue).toISOString().split("T")[0],
        batchNumber: data.batchNumber || "",
        administeredBy: data.administeredBy || "",
        certificateNo: data.certificateNo || "",
        notes: data.notes || "",
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to load vaccination");
    } finally {
      setLoading(false);
    }
  };

  // Auto-recalculate next due date
  const handleDateChange = (e) => {
    const dateGiven = e.target.value;
    const nextDue = addYears(new Date(dateGiven), 1)
      .toISOString()
      .split("T")[0];

    setFormData({ ...formData, dateGiven, nextDue });
  };

  const handleQuickSelect = (vaccineName) => {
    setFormData({ ...formData, vaccineName });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.vaccineName.trim()) {
      return toast.error("Vaccine name is required");
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

      if (!res.ok) {
        return toast.error(data.error || "Update failed");
      }

      toast.success("Vaccination updated!");
      router.push(`/horses/${params.id}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading vaccination...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href={`/horses/${params.id}`}>
            <Button variant="outline" size="sm">
              ← Back
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Edit Vaccination</h1>
            <p className="text-sm text-gray-600">
              Modify existing vaccination record
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6">
        <Card className="p-8 space-y-6">
          {/* Quick Select */}
          <div>
            <Label>Quick Select (Nigerian Standards)</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {nigerianVaccines.map((v) => (
                <Button
                  key={v}
                  type="button"
                  size="sm"
                  variant={formData.vaccineName === v ? "default" : "outline"}
                  onClick={() => handleQuickSelect(v)}
                  className={
                    formData.vaccineName === v
                      ? "bg-purple-600 hover:bg-purple-700"
                      : ""
                  }
                >
                  {v}
                </Button>
              ))}
            </div>
          </div>

          {/* Vaccine Name */}
          <div>
            <Label>Vaccine Name</Label>
            <Input
              value={formData.vaccineName}
              onChange={(e) =>
                setFormData({ ...formData, vaccineName: e.target.value })
              }
              required
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date Given</Label>
              <Input
                type="date"
                value={formData.dateGiven}
                onChange={handleDateChange}
                required
              />
            </div>

            <div>
              <Label>Next Due</Label>
              <Input
                type="date"
                value={formData.nextDue}
                onChange={(e) =>
                  setFormData({ ...formData, nextDue: e.target.value })
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                Auto-calculated: 1 year after date given
              </p>
            </div>
          </div>

          {/* Batch + Certificate */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Batch Number</Label>
              <Input
                value={formData.batchNumber}
                onChange={(e) =>
                  setFormData({ ...formData, batchNumber: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Certificate Number</Label>
              <Input
                value={formData.certificateNo}
                onChange={(e) =>
                  setFormData({ ...formData, certificateNo: e.target.value })
                }
              />
            </div>
          </div>

          {/* Administered By */}
          <div>
            <Label>Administered By</Label>
            <Input
              value={formData.administeredBy}
              onChange={(e) =>
                setFormData({ ...formData, administeredBy: e.target.value })
              }
            />
          </div>

          {/* Notes */}
          <div>
            <Label>Notes</Label>
            <textarea
              rows={3}
              className="w-full border rounded-md p-2"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            ></textarea>
          </div>

          {/* Save */}
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
              className="flex-1 bg-purple-600 hover:bg-purple-700"
              onClick={handleSubmit}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
