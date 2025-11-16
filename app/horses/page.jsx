import Link from "next/link";
import { getHorses } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function HorsesPage() {
  const horses = await getHorses();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Horses</h1>
          <p className="text-gray-600">Manage all horses in your care</p>
        </div>
        <Link href="/horses/new">
          <Button>Add New Horse</Button>
        </Link>
      </div>

      {horses.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500 mb-4">No horses found</p>
            <Link href="/horses/new">
              <Button>Add Your First Horse</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {horses.map((horse) => (
            <Link key={horse.id} href={`/horses/${horse.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {horse.name}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        horse.gender === "MALE"
                          ? "bg-blue-100 text-blue-800"
                          : horse.gender === "FEMALE"
                          ? "bg-pink-100 text-pink-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {horse.gender}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-1">{horse.breed}</p>
                  <p className="text-gray-500 text-sm mb-2">{horse.color}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Passport: {horse.passportNumber}</span>
                    <span>Owner: {horse.owner.name}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
