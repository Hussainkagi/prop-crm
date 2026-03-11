"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApiProject {
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

interface CustomerPropertyPlanFormProps {
  customerId: number;
  onSuccess: () => void;
  onSkip: () => void;
  apiBaseUrl: string;
}

// ─── Step badge helper ────────────────────────────────────────────────────────

function StepBadge({
  number,
  label,
  active,
  done,
}: {
  number: number;
  label: string;
  active: boolean;
  done?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
          done
            ? "bg-green-500 text-white"
            : active
              ? "bg-purple-600 text-white"
              : "bg-gray-100 text-gray-400"
        }`}
      >
        {done ? "✓" : number}
      </span>
      <span
        className={`text-sm font-medium ${active ? "text-gray-900" : "text-gray-400"}`}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Project card skeleton ────────────────────────────────────────────────────

function ProjectCardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 p-4 space-y-2">
      <div className="flex items-start gap-3">
        <Skeleton className="mt-0.5 h-4 w-4 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-64" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CustomerPropertyPlanForm({
  customerId,
  onSuccess,
  onSkip,
  apiBaseUrl,
}: CustomerPropertyPlanFormProps) {
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  const [selectedProject, setSelectedProject] = useState<ApiProject | null>(
    null,
  );

  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Fetch projects on mount ──────────────────────────────────────────────
  useEffect(() => {
    const fetchProjects = async () => {
      setProjectsLoading(true);
      setProjectsError(null);

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("crm_access_token")
          : null;

      const [data] = await Promise.all([
        fetch(`${apiBaseUrl}/projects?page=1&limit=10`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })
          .then((res) => {
            if (!res.ok)
              throw new Error(`Error ${res.status}: ${res.statusText}`);
            return res.json();
          })
          .catch((err: Error) => {
            setProjectsError(err.message || "Failed to load projects");
            return null;
          }),
        // Enforce minimum 400ms skeleton
        new Promise((resolve) => setTimeout(resolve, 400)),
      ]);

      if (data?.success && Array.isArray(data.data)) {
        setProjects(data.data);
      }

      setProjectsLoading(false);
    };

    fetchProjects();
  }, [apiBaseUrl]);

  // ── Submit: PUT /api/customers/:id with plan_id = project_id ─────────────
  const handleSubmit = async () => {
    setSubmitError(null);

    if (!selectedProject) {
      setSubmitError("Please select a project.");
      return;
    }

    setSubmitLoading(true);

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("crm_access_token")
        : null;

    try {
      const res = await fetch(`${apiBaseUrl}/customers/${customerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ plan_id: selectedProject.project_id }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to update customer");

      onSuccess();
    } catch (err: unknown) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong",
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-2">
        <StepBadge number={1} label="Basic Info" active={false} done />
        <div className="h-px flex-1 bg-gray-200" />
        <StepBadge number={2} label="Property & Plan" active={true} />
      </div>

      <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
        ✓ Customer profile created (ID: {customerId}). Now assign a project.
      </div>

      {submitError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      {/* Project Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Select Project <span className="text-red-500">*</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {projectsError ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {projectsError}
            </div>
          ) : projectsLoading ? (
            <div className="space-y-3">
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
            </div>
          ) : projects.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No projects available.
            </p>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => {
                const isSelected =
                  selectedProject?.project_id === project.project_id;
                return (
                  <div
                    key={project.project_id}
                    onClick={() => setSelectedProject(project)}
                    className={`rounded-lg border p-4 cursor-pointer transition-all ${
                      isSelected
                        ? "border-purple-600 bg-purple-50 shadow-sm"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Radio dot */}
                      <div
                        className={`mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected ? "border-purple-600" : "border-gray-300"
                        }`}
                      >
                        {isSelected && (
                          <div className="h-2 w-2 rounded-full bg-purple-600" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900">
                            {project.project_name}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              project.project_status === "Active"
                                ? "bg-green-100 text-green-700"
                                : project.project_status === "Completed"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {project.project_status}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">
                            {project.project_category}
                          </span>
                        </div>

                        <p className="text-sm text-gray-500 mt-0.5">
                          {project.locality}, {project.city}, {project.state}
                        </p>

                        <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                          <span>
                            <span className="font-medium text-gray-700">
                              Type:
                            </span>{" "}
                            {project.project_type}
                          </span>
                          <span>
                            <span className="font-medium text-gray-700">
                              Units:
                            </span>{" "}
                            {project.total_units}
                          </span>
                          <span>
                            <span className="font-medium text-gray-700">
                              Possession:
                            </span>{" "}
                            {project.possession_status}
                          </span>
                          <span>
                            <span className="font-medium text-gray-700">
                              Developer:
                            </span>{" "}
                            {project.developer_name}
                          </span>
                        </div>

                        {/* Construction progress bar */}
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Construction progress</span>
                            <span>
                              {project.construction_stage_percentage}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-gray-200">
                            <div
                              className="h-1.5 rounded-full bg-purple-500 transition-all"
                              style={{
                                width: `${project.construction_stage_percentage}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between gap-3 pb-6">
        <Button variant="ghost" onClick={onSkip} disabled={submitLoading}>
          Skip for now
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={submitLoading || !selectedProject || projectsLoading}
        >
          {submitLoading ? "Saving..." : "Save & Finish"}
        </Button>
      </div>
    </div>
  );
}
