"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  createUser,
  updateUser,
  type ApiUser,
  type CreateUserPayload,
} from "@/lib/api/user-api";

const userFormSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters"),
  email_id: z.string().email("Please enter a valid email address"),
  first_name: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be at most 50 characters"),
  last_name: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be at most 50 characters"),
  mobile_number: z.string().refine((val) => {
    // UAE mobile format: +971 followed by 9 digits (e.g., +971 543636870)
    const uaeRegex = /^\+971\s?\d{9}$/;
    return uaeRegex.test(val.replace(/\s+/g, ""));
  }, "Please enter a valid UAE mobile number (e.g., +971 543636870)"),
  employee_code: z
    .string()
    .min(1, "Employee code is required")
    .max(50, "Employee code must be at most 50 characters"),
  role_id: z.string().refine((val) => val !== "", "Please select a role"),
  department: z
    .string()
    .min(1, "Department is required")
    .max(50, "Department must be at most 50 characters"),
  designation: z
    .string()
    .min(1, "Designation is required")
    .max(50, "Designation must be at most 50 characters"),
  developer_id: z
    .string()
    .refine((val) => val !== "", "Please select a developer"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional()
    .or(z.literal("")),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  user?: ApiUser;
  isEdit?: boolean;
  onSuccess?: () => void;
  roles?: Array<{ id: number; name: string }>;
  developers?: Array<{ id: number; name: string }>;
}

export function UserForm({
  user,
  isEdit = false,
  onSuccess,
  roles = [],
  developers = [],
}: UserFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: user?.username || "",
      email_id: user?.email_id || "",
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      mobile_number: user?.mobile_number || "",
      employee_code: user?.employee_code || "",
      role_id: user?.role_id?.toString() || "",
      department: user?.department || "",
      designation: user?.designation || "",
      developer_id: user?.developer_id?.toString() || "",
      password: "",
    },
  });

  async function onSubmit(data: UserFormValues) {
    setIsLoading(true);
    try {
      if (isEdit && user) {
        // Update existing user
        await updateUser(user.user_id, {
          first_name: data.first_name,
          last_name: data.last_name,
          mobile_number: data.mobile_number,
          role_id: parseInt(data.role_id),
          department: data.department,
          designation: data.designation,
          developer_id: parseInt(data.developer_id),
        });

        toast({
          title: "Success",
          description: "User updated successfully",
        });
      } else {
        // Create new user
        if (!data.password) {
          toast({
            title: "Error",
            description: "Password is required for new users",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        await createUser({
          username: data.username,
          password: data.password,
          email_id: data.email_id,
          first_name: data.first_name,
          last_name: data.last_name,
          mobile_number: data.mobile_number,
          employee_code: data.employee_code,
          role_id: parseInt(data.role_id),
          department: data.department,
          designation: data.designation,
          developer_id: parseInt(data.developer_id),
        });

        toast({
          title: "Success",
          description: "User created successfully",
        });
      }

      onSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "Edit User" : "Create New User"}</CardTitle>
        <CardDescription>
          {isEdit ? "Update user information" : "Add a new user to the system"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Username */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="john.doe"
                        {...field}
                        disabled={isEdit}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* First Name */}
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Last Name */}
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Mobile Number */}
              <FormField
                control={form.control}
                name="mobile_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+971 543636870" {...field} />
                    </FormControl>
                    <FormDescription>
                      UAE format: +971 followed by 9 digits
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Employee Code */}
              <FormField
                control={form.control}
                name="employee_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee Code</FormLabel>
                    <FormControl>
                      <Input placeholder="EMP001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Department */}
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input placeholder="IT" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Designation */}
              <FormField
                control={form.control}
                name="designation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Designation</FormLabel>
                    <FormControl>
                      <Input placeholder="Senior Developer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Role */}
              <FormField
                control={form.control}
                name="role_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id.toString()}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Developer */}
              <FormField
                control={form.control}
                name="developer_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Developer</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a developer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {developers.map((dev) => (
                          <SelectItem key={dev.id} value={dev.id.toString()}>
                            {dev.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              {!isEdit && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter a secure password"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Must be at least 8 characters long
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Processing..."
                  : isEdit
                    ? "Update User"
                    : "Create User"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
