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
  name: string;
  developer: string;
  location: string;
  type: string;
  totalUnits: number;
  soldUnits: number;
  totalValue: string;
  collectedValue: string;
  status: "ACTIVE" | "COMPLETED" | "ON_HOLD";
  startDate: string;
}

const initialProjects: Project[] = [
  {
    id: "1",
    name: "Skyline Heights",
    developer: "Skyline Builders Pvt Ltd",
    location: "Andheri East, Mumbai",
    type: "Residential",
    totalUnits: 120,
    soldUnits: 85,
    totalValue: "₹2.50Cr",
    collectedValue: "₹1.30Cr",
    status: "ACTIVE",
    startDate: "2024-01-15",
  },
];

function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [showForm, setShowForm] = useState(false);

  const handleRegister = (data: ProjectFormData) => {
    const project: Project = {
      id: Date.now().toString(),
      name: data.projectInfo.name,
      developer: data.projectInfo.developer,
      location: data.projectInfo.location,
      type: data.projectInfo.type,
      totalUnits: parseInt(data.details.totalUnits) || 0,
      soldUnits: 0,
      totalValue: data.details.totalValue || "₹0",
      collectedValue: "₹0",
      status: "ACTIVE",
      startDate: data.details.launchDate,
    };
    setProjects((prev) => [...prev, project]);
    setShowForm(false);
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <Badge
                      variant={
                        project.status === "ACTIVE"
                          ? "default"
                          : project.status === "COMPLETED"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {project.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building className="h-4 w-4" />
                    <span>{project.developer}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{project.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Started: {project.startDate}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Units:</span>{" "}
                        <span className="font-medium">
                          {project.soldUnits}/{project.totalUnits}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Type:</span>{" "}
                        <span className="font-medium capitalize">
                          {project.type}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <IndianRupee className="h-4 w-4 text-muted-foreground" />
                      <span>
                        <span className="font-medium text-green-600">
                          {project.collectedValue}
                        </span>
                        <span className="text-muted-foreground">
                          {" "}
                          / {project.totalValue}
                        </span>
                      </span>
                    </div>
                  </div>
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
