"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import CloudinaryUpload from "@/components/CloudinaryUpload";
import toast from "react-hot-toast";

export default function NewHorsePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    age: "",
    color: "",
    sex: "STALLION",
    microchip: "",
    imageUrl: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Horse name is required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/horses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          age: formData.age ? parseInt(formData.age) : null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Horse added successfully!");
        router.push("/dashboard/vet");
        router.refresh();
      } else {
        toast.error(data.error || "Failed to add horse");
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
            <Link href="/dashboard/vet">
              <Button variant="outline" size="sm">
                ← Back
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Add New Horse</h1>
              <p className="text-sm text-gray-600">
                Create a new horse profile
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto p-6">
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Horse Image */}
            <div>
              <Label className="text-base font-semibold">Horse Image</Label>
              <p className="text-sm text-gray-600 mb-3">
                Upload a clear photo of the horse
              </p>
              <CloudinaryUpload
                onUploadComplete={(url) =>
                  setFormData({ ...formData, imageUrl: url })
                }
                currentImage={formData.imageUrl}
              />
            </div>

            <div className="border-t pt-6">
              <h3 className="text-base font-semibold mb-4">
                Basic Information
              </h3>
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <Label htmlFor="name">
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Thunder"
                    required
                    className="mt-1"
                  />
                </div>

                {/* Breed */}
                <div>
                  <Label htmlFor="breed">Breed</Label>
                  <Input
                    id="breed"
                    value={formData.breed}
                    onChange={(e) =>
                      setFormData({ ...formData, breed: e.target.value })
                    }
                    placeholder="e.g., Arabian, Thoroughbred"
                    className="mt-1"
                  />
                </div>

                {/* Age and Color */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="age">Age (years)</Label>
                    <Input
                      id="age"
                      type="number"
                      min="0"
                      max="50"
                      value={formData.age}
                      onChange={(e) =>
                        setFormData({ ...formData, age: e.target.value })
                      }
                      placeholder="e.g., 5"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      value={formData.color}
                      onChange={(e) =>
                        setFormData({ ...formData, color: e.target.value })
                      }
                      placeholder="e.g., Bay, Chestnut"
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Sex */}
                <div>
                  <Label htmlFor="sex">Sex</Label>
                  <select
                    id="sex"
                    value={formData.sex}
                    onChange={(e) =>
                      setFormData({ ...formData, sex: e.target.value })
                    }
                    className="w-full mt-1 border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="STALLION">Stallion</option>
                    <option value="MARE">Mare</option>
                    <option value="GELDING">Gelding</option>
                  </select>
                </div>

                {/* Microchip */}
                <div>
                  <Label htmlFor="microchip">Microchip Number</Label>
                  <Input
                    id="microchip"
                    value={formData.microchip}
                    onChange={(e) =>
                      setFormData({ ...formData, microchip: e.target.value })
                    }
                    placeholder="15-digit number"
                    maxLength="15"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Optional: 15-digit ISO microchip number
                  </p>
                </div>
              </div>
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
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Adding Horse...
                  </span>
                ) : (
                  "Add Horse"
                )}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}
