"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, User as UserIcon, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CommonTable from "@/components/organism/commonTable";

// Dummy data for users
const dummyUsers = [
  {
    user_id: "1",
    username: "john.doe",
    email_id: "john.doe@company.com",
    first_name: "John",
    last_name: "Doe",
    mobile_number: "+971501234567",
    employee_code: "EMP001",
    role_id: 1,
    role_name: "Admin",
    department: "IT",
    designation: "Senior Developer",
    user_status: "Active",
    last_login: "2024-02-12 10:30:00",
    created_at: "2024-01-15 09:00:00",
  },
  {
    user_id: "2",
    username: "jane.smith",
    email_id: "jane.smith@company.com",
    first_name: "Jane",
    last_name: "Smith",
    mobile_number: "+971509876543",
    employee_code: "EMP002",
    role_id: 2,
    role_name: "Manager",
    department: "Sales",
    designation: "Sales Manager",
    user_status: "Active",
    last_login: "2024-02-12 08:15:00",
    created_at: "2024-01-20 10:00:00",
  },
  {
    user_id: "3",
    username: "mike.wilson",
    email_id: "mike.wilson@company.com",
    first_name: "Mike",
    last_name: "Wilson",
    mobile_number: "+971501112233",
    employee_code: "EMP003",
    role_id: 3,
    role_name: "User",
    department: "Marketing",
    designation: "Marketing Executive",
    user_status: "Inactive",
    last_login: "2024-02-10 14:20:00",
    created_at: "2024-02-01 11:30:00",
  },
];

// Dummy data for roles
const dummyRoles = [
  {
    role_id: "1",
    role_name: "Admin",
    role_description: "Full system access with all permissions",
    role_level: 1,
    created_at: "2024-01-01 00:00:00",
    created_by: "system",
  },
  {
    role_id: "2",
    role_name: "Manager",
    role_description: "Department level access and management",
    role_level: 2,
    created_at: "2024-01-01 00:00:00",
    created_by: "system",
  },
  {
    role_id: "3",
    role_name: "User",
    role_description: "Basic user access with limited permissions",
    role_level: 3,
    created_at: "2024-01-01 00:00:00",
    created_by: "system",
  },
];

export default function UsersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("users");

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
      render: (row: any) => (
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
      render: (row: any) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/settings/users/edit/${row.user_id}`)}
        >
          Edit
        </Button>
      ),
    },
  ];

  // Role columns configuration
  const roleColumns = [
    {
      key: "role_name",
      header: "Role Name",
      sortable: true,
      searchable: true,
      filterable: true,
    },
    {
      key: "role_description",
      header: "Description",
      sortable: true,
      searchable: true,
    },
    {
      key: "role_level",
      header: "Level",
      sortable: true,
      filterable: true,
      render: (row: any) => (
        <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
          Level {row.role_level}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Created At",
      sortable: true,
    },
    {
      key: "created_by",
      header: "Created By",
      sortable: true,
      filterable: true,
    },
    {
      key: "actions",
      header: "Actions",
      hiddenFromToggle: true,
      render: (row: any) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Edit
          </Button>
          <Button variant="outline" size="sm">
            Permissions
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
            Manage user accounts, roles and permissions
          </p>
        </div>
        <Button
          onClick={() =>
            router.push(
              activeTab === "users"
                ? "/settings/users/create"
                : "/settings/users/roles/create",
            )
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          {activeTab === "users" ? "Add User" : "Add Role"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Roles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
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
              <CommonTable
                data={dummyUsers}
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                System Roles
              </CardTitle>
              <CardDescription>
                Manage roles and their permission levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CommonTable
                data={dummyRoles}
                columns={roleColumns}
                searchPlaceholder="Search roles..."
                showPagination={true}
                perPage={10}
                striped={true}
                hover={true}
                sortable={true}
                exportable={true}
                showColumnToggle={true}
                emptyMessage="No roles found"
                onRowClick={(row) => console.log("Clicked role:", row.role_id)}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
