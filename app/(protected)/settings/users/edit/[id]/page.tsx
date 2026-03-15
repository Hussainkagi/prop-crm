"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserForm } from "@/components/settings/user-form";
import { useToast } from "@/hooks/use-toast";
import {
  getUserById,
  getAllRoles,
  type ApiUser,
  type ApiRole,
} from "@/lib/api/user-api";
import { showSplashLoader, hideSplashLoader } from "@/utils/splash-loader";

export default function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<ApiUser | null>(null);
  const [roles, setRoles] = useState<Array<{ id: number; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Resolve params and fetch user and form data
  useEffect(() => {
    const loadData = async () => {
      try {
        const { id } = await params;
        setUserId(id);
        setIsLoading(true);
        showSplashLoader("Loading user and form data...");

        const [userRes, rolesRes] = await Promise.all([
          getUserById(parseInt(id)),
          getAllRoles(),
        ]);

        setUser(userRes.data);

        setRoles(
          rolesRes.data.map((role: ApiRole) => ({
            id: role.role_id,
            name: role.role_name,
          })),
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load data";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        router.push("/settings/users");
      } finally {
        setTimeout(() => {
          hideSplashLoader();
        }, 500);
        setIsLoading(false);
      }
    };

    loadData();
  }, [params, router, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading user...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">User Not Found</h2>
          <p className="text-muted-foreground">The user could not be loaded.</p>
        </div>
        <Button onClick={() => router.push("/settings/users")}>
          Back to Users
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Edit User</h2>
          <p className="text-muted-foreground">
            Update {user.first_name} {user.last_name}'s information
          </p>
        </div>
      </div>

      <UserForm
        user={user}
        isEdit={true}
        roles={roles}
        onSuccess={() => {
          router.push("/settings/users");
        }}
      />
    </div>
  );
}
