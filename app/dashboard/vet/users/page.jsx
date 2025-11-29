"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Eye, Users, UserCheck, PawPrint, Stethoscope } from "lucide-react";
import toast from "react-hot-toast";

export default function AllUsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users/");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      toast.error("Failed to load users. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ------------------------------
  // SUMMARY FIGURES
  // ------------------------------
  const totalUsers = users.length;
  const totalOwners = users.filter((u) => u.role === "OWNER").length;
  const totalVets = users.filter((u) => u.role === "VET").length;
  const ownersWithHorses = users.filter(
    (u) => u._count?.ownedHorses > 0
  ).length;

  // ------------------------------
  // SEARCH FILTER
  // ------------------------------
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const text = search.toLowerCase();
      return (
        u.name.toLowerCase().includes(text) ||
        u.email.toLowerCase().includes(text) ||
        u.role.toLowerCase().includes(text)
      );
    });
  }, [users, search]);

  // ------------------------------
  // PAGINATION
  // ------------------------------
  const totalPages = Math.ceil(filteredUsers.length / pageSize);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const nextPage = () => setCurrentPage((p) => (p < totalPages ? p + 1 : p));

  const prevPage = () => setCurrentPage((p) => (p > 1 ? p - 1 : p));

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

            <div className="hidden md:flex flex-col">
              <h1 className="text-xl font-bold text-gray-900">All Users</h1>
              <p className="text-sm text-gray-600">Manage all users</p>
            </div>

            {/* Add New User Button */}
            <div className="ml-auto">
              <Link href="/dashboard/vet/users/new">
                <Button
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  + Add New User
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex md:hidden flex-col mb-5">
          <h1 className="text-xl font-bold text-gray-900">All Users</h1>
          <p className="text-sm text-gray-600">Manage all users</p>
        </div>
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Users</p>
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold">{totalUsers}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">All Owners</p>
              <UserCheck className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold">{totalOwners}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Owners with Horses</p>
              <PawPrint className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-3xl font-bold">{ownersWithHorses}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Vets</p>
              <Stethoscope className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold">{totalVets}</p>
          </Card>
        </div>

        {/* Search Input */}
        <div className="mb-6">
          <Input
            placeholder="Search users by name, email or role..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="max-w-md"
          />
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading users...</p>
          </div>
        ) : (
          <>
            {/* USERS TABLE */}
            <div className="bg-white border rounded-lg shadow-sm overflow-auto">
              <Table className="min-w-[600px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.title}.</TableCell>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell className="capitalize">{u.role}</TableCell>

                      <TableCell className="text-right">
                        <Link href={`/dashboard/vet/users/${u.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" /> View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}

                  {paginatedUsers.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-6 text-gray-500"
                      >
                        {search ? "No matching users found" : "No users found"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls - Only show if we have users */}
            {filteredUsers.length > 0 && (
              <div className="flex items-center justify-between mt-6">
                <Button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  variant="outline"
                >
                  Previous
                </Button>

                <p className="text-sm text-gray-600">
                  Page <strong>{currentPage}</strong> of{" "}
                  <strong>{totalPages}</strong>
                </p>

                <Button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
