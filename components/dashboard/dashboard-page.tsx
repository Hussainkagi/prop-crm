"use client";

import { IndianRupee, TrendingUp, Users, Phone } from "lucide-react";
import { StatCard } from "./stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

const projectData = [
  { name: "Skyline Heights", collected: 13000000, due: 11000000 },
];

const monthlyData = [
  { month: "Sep", collected: 5000000, target: 4500000 },
  { month: "Oct", collected: 4800000, target: 5000000 },
  { month: "Nov", collected: 5500000, target: 5200000 },
  { month: "Dec", collected: 6000000, target: 5800000 },
  { month: "Jan", collected: 7500000, target: 8000000 },
  { month: "Feb", collected: 13000000, target: 20000000 },
];

function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard & Reports</h1>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Collection"
          value="₹1.30Cr"
          subtitle="52.0% of target"
          icon={IndianRupee}
          color="blue"
        />
        <StatCard
          title="Collection Efficiency"
          value="52.0%"
          subtitle="₹1.30Cr / ₹2.50Cr"
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Active Customers"
          value="2"
          subtitle="2 defaulters"
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Total Calls"
          value="1"
          subtitle="1 successful (100.0%)"
          icon={Phone}
          color="orange"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Project-wise Collection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Project-wise Collection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis
                    className="text-xs"
                    tickFormatter={(value) => `${value / 1000000}M`}
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      `₹${(value / 10000000).toFixed(2)}Cr`,
                      "",
                    ]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="collected"
                    name="Collected"
                    fill="#22c55e"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="due"
                    name="Due"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Collection Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Monthly Collection Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis
                    className="text-xs"
                    tickFormatter={(value) => `${value / 1000000}M`}
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      `₹${(value / 10000000).toFixed(2)}Cr`,
                      "",
                    ]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="collected"
                    name="Collected"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ fill: "#22c55e" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    name="Target"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: "#3b82f6" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Charts Placeholder */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Phone className="h-4 w-4" />
              Call Outcomes Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
              No call data available
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Users className="h-4 w-4" />
              Customer Response Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
              No response data available
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
export default DashboardPage;
