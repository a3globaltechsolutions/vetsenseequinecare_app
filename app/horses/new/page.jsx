"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createHorse } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function NewHorsePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(formData) {
    setLoading(true);
    setError("");

    const result = await createHorse(formData);

    if (result.success) {
      router.push("/horses");
    } else {
      setError(result.error);
    }
    setLoading(false);
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Horse</h1>
          <p className="text-gray-600">Register a new horse in the system</p>
        </div>
        <Link href="/horses">
          <Button variant="outline">Back to Horses</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Horse Information</h2>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Horse Name *
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Enter horse name"
                />
              </div>

              <div>
                <label
                  htmlFor="breed"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Breed *
                </label>
                <Input
                  id="breed"
                  name="breed"
                  type="text"
                  required
                  placeholder="Enter breed"
                />
              </div>

              <div>
                <label
                  htmlFor="color"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Color *
                </label>
                <Input
                  id="color"
                  name="color"
                  type="text"
                  required
                  placeholder="Enter color"
                />
              </div>

              <div>
                <label
                  htmlFor="dateOfBirth"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Date of Birth *
                </label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="gender"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Gender *
                </label>
                <select
                  id="gender"
                  name="gender"
                  required
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                >
                  <option value="">Select gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="GELDING">Gelding</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="ownerId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Owner ID *
                </label>
                <Input
                  id="ownerId"
                  name="ownerId"
                  type="text"
                  required
                  placeholder="Enter owner user ID"
                />
                <p className="text-xs text-gray-500 mt-1">
                  For now, use an existing user ID. We&apos;ll add client
                  selection later.
                </p>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating Horse..." : "Create Horse"}
              </Button>
              <Link href="/horses">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
