"use client";

import { Moon, Sun, Palette } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/contexts/theme-context";
import { cn } from "@/lib/utils";

const themeColors = [
  { value: "blue", label: "Blue", color: "bg-blue-500" },
  { value: "green", label: "Green", color: "bg-green-500" },
  { value: "purple", label: "Purple", color: "bg-purple-500" },
  { value: "orange", label: "Orange", color: "bg-orange-500" },
  { value: "red", label: "Red", color: "bg-red-500" },
  { value: "teal", label: "Teal", color: "bg-teal-500" },
] as const;

export default function AppearancePage() {
  const { mode, color, setMode, setColor } = useTheme();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Appearance</h2>
        <p className="text-muted-foreground">
          Customize how the application looks on your device
        </p>
      </div>

      <div className="grid gap-6">
        {/* Dark Mode Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {mode === "dark" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
              Dark Mode
            </CardTitle>
            <CardDescription>
              Switch between light and dark theme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode">Enable Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Adjust the appearance to reduce eye strain
                </p>
              </div>
              <Switch
                id="dark-mode"
                checked={mode === "dark"}
                onCheckedChange={(checked) =>
                  setMode(checked ? "dark" : "light")
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Theme Color Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Theme Color
            </CardTitle>
            <CardDescription>
              Choose your preferred accent color for buttons and highlights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
              {themeColors.map((themeColor) => (
                <button
                  key={themeColor.value}
                  onClick={() => setColor(themeColor.value)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all hover:bg-muted",
                    color === themeColor.value
                      ? "border-primary bg-muted"
                      : "border-transparent",
                  )}
                >
                  <div
                    className={cn("h-8 w-8 rounded-full", themeColor.color)}
                  />
                  <span className="text-xs font-medium">
                    {themeColor.label}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
