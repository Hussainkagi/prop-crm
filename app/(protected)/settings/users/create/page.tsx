"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserForm } from "@/components/settings/user-form";
import { useToast } from "@/hooks/use-toast";
import { getAllRoles, type ApiRole } from "@/lib/api/user-api";
import { showSplashLoader, hideSplashLoader } from "@/utils/splash-loader";

export default function CreateUserPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [roles, setRoles] = useState<Array<{ id: number; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      showSplashLoader("Loading roles...");
      try {
        const rolesRes = await getAllRoles();

        setRoles(
          rolesRes.data.map((role: ApiRole) => ({
            id: role.role_id,
            name: role.role_name,
          })),
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load roles";
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

    loadData();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading form data...</p>
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
          <h2 className="text-2xl font-bold">Create New User</h2>
          <p className="text-muted-foreground">Add a new user to the system</p>
        </div>
      </div>

      <UserForm
        roles={roles}
        onSuccess={() => {
          router.push("/settings/users");
        }}
      />
    </div>
  );
}
