"use client";

import { useState } from "react";
import { Plus, Building, MapPin, Calendar, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  RegisterProjectForm,
  type ProjectFormData,
} from "./forms/project-form";

interface Project {
  id: string;
  developer_id: string;
  project_name: string;
  project_type: string;
  project_category: string;
  rera_registration_number: string;
  locality: string;
  city: string;
  state: string;
  total_units: number;
  sold_units: number;
  number_of_towers: number;
  project_status: string;
  possession_status: string;
  launch_date: string;
  expected_completion_date: string;
  construction_stage_percentage: number;
  amenities: string[];
  // Display helpers
  developerName?: string;
  fullAddress?: string;
}

const initialProjects: Project[] = [
  {
    id: "1",
    developer_id: "1",
    developerName: "Skyline Builders Pvt Ltd",
    project_name: "Skyline Heights",
    project_type: "Residential",
    project_category: "Luxury",
    rera_registration_number: "RERA/MH/2024/001",
    locality: "Andheri East",
    city: "Mumbai",
    state: "Maharashtra",
    fullAddress: "Andheri East, Mumbai, Maharashtra",
    total_units: 120,
    sold_units: 85,
    number_of_towers: 3,
    project_status: "Under Construction",
    possession_status: "Under Construction",
    launch_date: "2024-01-15",
    expected_completion_date: "2026-12-31",
    construction_stage_percentage: 45,
    amenities: ["Swimming Pool", "Gym", "Club House", "Children's Play Area"],
  },
];

function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [showForm, setShowForm] = useState(false);

  const handleRegister = (data: ProjectFormData) => {
    // Map form data to project structure
    const project: Project = {
      id: Date.now().toString(),
      developer_id: data.developer_id,
      developerName: getDeveloperName(data.developer_id), // Helper function to get name
      project_name: data.project_name,
      project_type: data.project_type,
      project_category: data.project_category,
      rera_registration_number: data.rera_registration_number,
      locality: data.locality,
      city: data.city,
      state: data.state,
      fullAddress: `${data.locality}, ${data.city}, ${data.state}`,
      total_units: parseInt(data.total_units) || 0,
      sold_units: 0,
      number_of_towers: parseInt(data.number_of_towers) || 0,
      project_status: data.project_status,
      possession_status: data.possession_status,
      launch_date: data.launch_date,
      expected_completion_date: data.expected_completion_date,
      construction_stage_percentage:
        parseInt(data.construction_stage_percentage) || 0,
      amenities: data.amenities,
    };

    setProjects((prev) => [...prev, project]);
    setShowForm(false);
  };

  // Helper function to map developer_id to name
  const getDeveloperName = (developerId: string): string => {
    const developerMap: Record<string, string> = {
      "1": "Skyline Builders Pvt Ltd",
      "2": "Green Valley Developers",
      "3": "Metro Properties",
    };
    return developerMap[developerId] || "Unknown Developer";
  };

  const getStatusVariant = (
    status: string,
  ): "default" | "secondary" | "outline" | "destructive" => {
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
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Project Management</h1>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Project
          </Button>
        )}
      </div>

      {showForm ? (
        <RegisterProjectForm
          onSubmit={handleRegister}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <>
          <div className="space-y-4">
            {projects.map((project) => (
              <Card key={project.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {project.project_name}
                      </CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">
                        RERA: {project.rera_registration_number}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={getStatusVariant(project.project_status)}>
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
                    {/* Column 1: Basic Info */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building className="h-4 w-4" />
                        <span>{project.developerName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{project.fullAddress}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Launch: {project.launch_date}</span>
                      </div>
                    </div>

                    {/* Column 2: Project Details */}
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Type:</span>{" "}
                        <span className="font-medium">
                          {project.project_type}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Units:</span>{" "}
                        <span className="font-medium">
                          {project.sold_units}/{project.total_units}
                        </span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          (
                          {Math.round(
                            (project.sold_units / project.total_units) * 100,
                          )}
                          % sold)
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Towers:</span>{" "}
                        <span className="font-medium">
                          {project.number_of_towers}
                        </span>
                      </div>
                    </div>

                    {/* Column 3: Status & Progress */}
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          Possession:
                        </span>{" "}
                        <span className="font-medium">
                          {project.possession_status}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Completion:
                        </span>{" "}
                        <span className="font-medium">
                          {project.expected_completion_date}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Progress:</span>{" "}
                        <span className="font-medium">
                          {project.construction_stage_percentage}%
                        </span>
                        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-secondary">
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

                  {/* Amenities */}
                  {project.amenities && project.amenities.length > 0 && (
                    <div className="mt-4 border-t pt-4">
                      <p className="mb-2 text-sm font-medium">Amenities:</p>
                      <div className="flex flex-wrap gap-2">
                        {project.amenities.map((amenity, index) => (
                          <Badge key={index} variant="secondary">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {projects.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              No projects registered yet. Click the button above to add a new
              project.
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ProjectsPage;
