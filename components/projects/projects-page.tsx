"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Building,
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  RegisterProjectForm,
  type ProjectFormData,
} from "./forms/project-form";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Project {
  project_id: number;
  project_name: string;
  project_type: string;
  project_category: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  total_units: number;
  possession_status: string;
  project_status: string;
  construction_stage_percentage: number;
  status: string;
  launch_date: string;
  expected_completion_date: string;
  developer_name: string;
  created_at: string;
  updated_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────

function ProjectCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-36" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-5 w-28 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-52" />
            <Skeleton className="h-4 w-36" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        </div>
        <div className="mt-4 border-t pt-4">
          <Skeleton className="mb-2 h-4 w-20" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-28 rounded-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Status helpers ───────────────────────────────────────────────────────────

function getStatusVariant(
  status: string,
): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "Under Construction":
      return "default";
    case "Completed":
      return "secondary";
    case "On Hold":
      return "outline";
    case "Cancelled":
      return "destructive";
    default:
      return "default";
  }
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const LIMIT = 10;

  // ── fetch projects ──
  const fetchProjects = useCallback(async (page: number) => {
    setIsLoading(true);
    setFetchError(null);

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("crm_access_token")
        : null;

    try {
      const res = await fetch(
        `${BASE_URL}/projects?page=${page}&limit=${LIMIT}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      );

      if (!res.ok) {
        let msg = `Error ${res.status}`;
        try {
          const err = await res.json();
          msg = err?.message ?? err?.error ?? msg;
        } catch {
          /* ignore */
        }
        throw new Error(msg);
      }

      const json = await res.json();
      if (!json.success)
        throw new Error(json.message ?? "Failed to load projects.");

      setProjects(json.data);
      setPagination(json.pagination);
    } catch (err: unknown) {
      setFetchError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      // keep skeleton visible for at least 500ms so it doesn't flash
      setTimeout(() => setIsLoading(false), 500);
    }
  }, []);

  useEffect(() => {
    fetchProjects(currentPage);
  }, [currentPage, fetchProjects]);

  // ── after successful form submit, refresh list ──
  const handleRegister = (_data: ProjectFormData) => {
    setShowForm(false);
    setCurrentPage(1);
    fetchProjects(1);
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Project Management</h1>
          {pagination && !isLoading && (
            <p className="mt-1 text-sm text-muted-foreground">
              {pagination.total} project{pagination.total !== 1 ? "s" : ""}{" "}
              found
            </p>
          )}
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Project
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm ? (
        <RegisterProjectForm
          onSubmit={handleRegister}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <>
          {/* Fetch error */}
          {fetchError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{fetchError}</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-4 shrink-0"
                  onClick={() => fetchProjects(currentPage)}
                >
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Skeleton loading */}
          {isLoading && (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <ProjectCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Project list */}
          {!isLoading && !fetchError && (
            <>
              <div className="space-y-4">
                {projects.map((project) => (
                  <Card key={project.project_id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {project.project_name}
                          </CardTitle>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {project.locality}, {project.city}, {project.state}{" "}
                            — {project.pincode}
                          </p>
                        </div>
                        <div className="flex flex-wrap justify-end gap-2">
                          <Badge
                            variant={getStatusVariant(project.project_status)}
                          >
                            {project.project_status}
                          </Badge>
                          {project.project_category && (
                            <Badge variant="outline">
                              {project.project_category}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-3">
                        {/* Column 1 */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Building className="h-4 w-4 shrink-0" />
                            <span>{project.developer_name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 shrink-0" />
                            <span>
                              {project.locality}, {project.city}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 shrink-0" />
                            <span>
                              Launch: {formatDate(project.launch_date)}
                            </span>
                          </div>
                        </div>

                        {/* Column 2 */}
                        <div className="space-y-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Type:</span>{" "}
                            <span className="font-medium">
                              {project.project_type}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Total Units:
                            </span>{" "}
                            <span className="font-medium">
                              {project.total_units}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Possession:
                            </span>{" "}
                            <span className="font-medium">
                              {project.possession_status}
                            </span>
                          </div>
                        </div>

                        {/* Column 3 */}
                        <div className="space-y-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">
                              Expected Completion:
                            </span>{" "}
                            <span className="font-medium">
                              {formatDate(project.expected_completion_date)}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Status:
                            </span>{" "}
                            <span className="font-medium">
                              {project.status}
                            </span>
                          </div>
                          <div>
                            <div className="mb-1 flex items-center justify-between">
                              <span className="text-muted-foreground">
                                Progress:
                              </span>
                              <span className="font-medium">
                                {project.construction_stage_percentage}%
                              </span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                              <div
                                className="h-full bg-green-600 transition-all"
                                style={{
                                  width: `${project.construction_stage_percentage}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Empty state */}
              {projects.length === 0 && (
                <div className="rounded-lg border border-dashed py-16 text-center text-muted-foreground">
                  <Building className="mx-auto mb-3 h-10 w-10 opacity-30" />
                  <p className="font-medium">No projects found</p>
                  <p className="mt-1 text-sm">
                    Click &quot;Add New Project&quot; to register your first
                    project.
                  </p>
                </div>
              )}

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t pt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.totalPages}{" "}
                    &nbsp;·&nbsp; {pagination.total} total
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!pagination.hasPrevPage}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!pagination.hasNextPage}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default ProjectsPage;
