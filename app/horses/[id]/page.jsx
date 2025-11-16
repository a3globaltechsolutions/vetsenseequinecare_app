import Link from "next/link";
import { getHorseById } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default async function HorseDetailPage({ params }) {
  const { id } = await params; // ✅ FIXED
  const horse = await getHorseById(id);

  if (!horse) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Horse Not Found
          </h1>
          <Link href="/horses">
            <Button>Back to Horses</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{horse.name}</h1>
          <p className="text-gray-600">Passport: {horse.passportNumber}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/horses/${horse.id}/edit`}>
            <Button variant="outline">Edit</Button>
          </Link>
          <Link href="/horses">
            <Button variant="outline">Back to Horses</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Basic Information</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Breed:</span>
              <span className="font-medium">{horse.breed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Color:</span>
              <span className="font-medium">{horse.color}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Gender:</span>
              <span className="font-medium">{horse.gender}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date of Birth:</span>
              <span className="font-medium">
                {new Date(horse.dateOfBirth).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Ownership</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Owner:</span>
              <span className="font-medium">{horse.owner.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Owner Email:</span>
              <span className="font-medium">{horse.owner.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Assigned Vet:</span>
              <span className="font-medium">{horse.vet.name}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <h2 className="text-lg font-semibold">Medical Summary</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {horse.medicalRecords.length}
                </p>
                <p className="text-sm text-blue-600">Medical Records</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {horse.vaccinations.length}
                </p>
                <p className="text-sm text-green-600">Vaccinations</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">0</p>
                <p className="text-sm text-orange-600">Due Vaccinations</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">0</p>
                <p className="text-sm text-purple-600">Lab Tests</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
