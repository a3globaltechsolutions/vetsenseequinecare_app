import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

async function getClients() {
  try {
    const clients = await prisma.user.findMany({
      where: { role: "CLIENT" },
      include: {
        horsesOwned: {
          select: { id: true, name: true },
        },
      },
      orderBy: { name: "asc" },
    });
    return clients;
  } catch (error) {
    console.error("Error fetching clients:", error);
    return [];
  }
}

export default async function ClientsPage() {
  const session = await getSession();
  if (!session) redirect("/auth/signin");

  const clients = await getClients();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600">Manage all horse owners</p>
        </div>
        <Link href="/clients/new">
          <Button>Add New Client</Button>
        </Link>
      </div>

      {clients.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500 mb-4">No clients found</p>
            <Link href="/clients/new">
              <Button>Add Your First Client</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <Card key={client.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  {client.name}
                </h3>
                <p className="text-gray-600 mb-3">{client.email}</p>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    {client.horsesOwned.length} horse
                    {client.horsesOwned.length !== 1 ? "s" : ""}
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    Client
                  </span>
                </div>

                {client.horsesOwned.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-500 mb-2">Horses:</p>
                    <div className="space-y-1">
                      {client.horsesOwned.slice(0, 3).map((horse) => (
                        <div
                          key={horse.id}
                          className="flex items-center text-sm"
                        >
                          <span className="w-2 h-2 bg-primary-600 rounded-full mr-2"></span>
                          {horse.name}
                        </div>
                      ))}
                      {client.horsesOwned.length > 3 && (
                        <p className="text-xs text-gray-500">
                          +{client.horsesOwned.length - 3} more
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  <Link href={`/clients/${client.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      View
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
