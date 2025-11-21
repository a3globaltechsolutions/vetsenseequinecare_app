"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import CloudinaryUpload from "@/components/CloudinaryUpload";
import toast from "react-hot-toast";

export default function NewMedicalRecordPage() {
  const params = useParams();
  const router = useRouter();
  const [horse, setHorse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    diagnosis: "",
    treatment: "",
    notes: "",
    recordDate: new Date().toISOString().split("T")[0],
    attachments: [],
  });

  useEffect(() => {
    fetchHorse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchHorse = async () => {
    try {
      const res = await fetch(`/api/horses/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setHorse(data);
      }
    } catch (error) {
      console.error("Error fetching horse:", error);
    }
  };

  const handleAddAttachment = (url) => {
    setFormData({
      ...formData,
      attachments: [...formData.attachments, url],
    });
  };

  const handleRemoveAttachment = (index) => {
    setFormData({
      ...formData,
      attachments: formData.attachments.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.diagnosis.trim() || !formData.treatment.trim()) {
      toast.error("Diagnosis and treatment are required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/horses/${params.id}/medical`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Medical record added successfully!");
        router.push(`/horses/${params.id}`);
        router.refresh();
      } else {
        toast.error(data.error || "Failed to add medical record");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
                Add Medical Record
              </h1>
              <p className="text-sm text-gray-600">
                {horse ? `For ${horse.name}` : "Loading..."}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto p-6">
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Record Date */}
            <div>
              <Label htmlFor="recordDate">Record Date</Label>
              <Input
                id="recordDate"
                type="date"
                value={formData.recordDate}
                onChange={(e) =>
                  setFormData({ ...formData, recordDate: e.target.value })
                }
                className="mt-1"
              />
            </div>

            {/* Diagnosis */}
            <div>
              <Label htmlFor="diagnosis">
                Diagnosis <span className="text-red-500">*</span>
              </Label>
              <Input
                id="diagnosis"
                value={formData.diagnosis}
                onChange={(e) =>
                  setFormData({ ...formData, diagnosis: e.target.value })
                }
                placeholder="e.g., Mild colic, Lameness, Respiratory infection"
                required
                className="mt-1"
              />
            </div>

            {/* Treatment */}
            <div>
              <Label htmlFor="treatment">
                Treatment <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="treatment"
                value={formData.treatment}
                onChange={(e) =>
                  setFormData({ ...formData, treatment: e.target.value })
                }
                placeholder="Describe the treatment administered..."
                required
                rows={4}
                className="w-full mt-1 border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Any additional observations or follow-up instructions..."
                rows={3}
                className="w-full mt-1 border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Attachments */}
            <div>
              <Label className="mb-2 block">Attachments (Optional)</Label>
              <CloudinaryUpload onUploadComplete={handleAddAttachment} />
              {formData.attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">Attached Files:</p>
                  {formData.attachments.map((url, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded"
                    >
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline truncate flex-1"
                      >
                        Attachment {index + 1}
                      </a>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveAttachment(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {loading ? "Adding Record..." : "Add Medical Record"}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}
