"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  User as UserIcon,
  Shield,
  Trash2,
  RefreshCw,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CommonTable from "@/components/organism/commonTable";
import { useToast } from "@/hooks/use-toast";
import { getAllUsers, deleteUser, type ApiUser } from "@/lib/api/user-api";
import { showSplashLoader, hideSplashLoader } from "@/utils/splash-loader";

export default function UsersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Delete dialog state
  const [userToDelete, setUserToDelete] = useState<ApiUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Fetch users
  const fetchUsers = async (page: number = 1) => {
    setIsLoading(true);
    showSplashLoader("Loading users...");
    try {
      const response = await getAllUsers(page, 10);
      setUsers(response.data);
      setTotalPages(response.pagination.totalPages);
      setCurrentPage(response.pagination.page);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch users";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        hideSplashLoader();
      }, 500);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle delete user
  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    showSplashLoader("Deleting user...");
    try {
      await deleteUser(userToDelete.user_id);
      setUsers((prev) =>
        prev.filter((u) => u.user_id !== userToDelete.user_id),
      );
      setUserToDelete(null);
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete user";
      setDeleteError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      hideSplashLoader();
      setIsDeleting(false);
    }
  };

  // User columns configuration
  const userColumns = [
    {
      key: "employee_code",
      header: "Employee Code",
      sortable: true,
      searchable: true,
      filterable: true,
    },
    {
      key: "first_name",
      header: "First Name",
      sortable: true,
      searchable: true,
      filterable: true,
    },
    {
      key: "last_name",
      header: "Last Name",
      sortable: true,
      searchable: true,
      filterable: true,
    },
    {
      key: "email_id",
      header: "Email",
      sortable: true,
      searchable: true,
    },
    {
      key: "mobile_number",
      header: "Mobile",
      sortable: true,
      searchable: true,
    },
    {
      key: "role_name",
      header: "Role",
      sortable: true,
      filterable: true,
    },
    {
      key: "department",
      header: "Department",
      sortable: true,
      filterable: true,
    },
    {
      key: "designation",
      header: "Designation",
      sortable: true,
      searchable: true,
    },
    {
      key: "user_status",
      header: "Status",
      sortable: true,
      filterable: true,
      render: (row: ApiUser) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            row.user_status === "Active"
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {row.user_status}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      hiddenFromToggle: true,
      render: (row: ApiUser) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/settings/users/edit/${row.user_id}`)}
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => {
              setUserToDelete(row);
              setDeleteError(null);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => fetchUsers(currentPage)}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => router.push("/settings/users/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            All Users
          </CardTitle>
          <CardDescription>
            View and manage all user accounts in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <p className="text-muted-foreground">Loading users...</p>
              </div>
            </div>
          ) : (
            <CommonTable
              data={users}
              columns={userColumns}
              searchPlaceholder="Search users..."
              showPagination={true}
              perPage={10}
              striped={true}
              hover={true}
              sortable={true}
              exportable={true}
              showColumnToggle={true}
              emptyMessage="No users found"
              onRowClick={(row) => console.log("Clicked user:", row.user_id)}
            />
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!userToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setUserToDelete(null);
            setDeleteError(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete User
            </DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                {userToDelete?.first_name} {userToDelete?.last_name}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {deleteError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{deleteError}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setUserToDelete(null);
                setDeleteError(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? "Deleting..." : "Yes, Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
