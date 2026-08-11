"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Building2, BookMarked, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type Department = { _id: string; name: string; code: string; description?: string };
type Course = { _id: string; name: string; code: string; department?: string; credits?: number; description?: string };

const emptyDept = { name: "", code: "", description: "" };
const emptyCourse = { name: "", code: "", department: "", credits: "", description: "" };

export default function AdminAcademicsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingDept, setSavingDept] = useState(false);
  const [savingCourse, setSavingCourse] = useState(false);
  const [deptForm, setDeptForm] = useState(emptyDept);
  const [courseForm, setCourseForm] = useState(emptyCourse);

  function loadAll() {
    setLoading(true);
    Promise.all([
      fetch("/api/departments").then((r) => r.json()),
      fetch("/api/courses").then((r) => r.json()),
    ])
      .then(([deptJson, courseJson]) => {
        setDepartments(deptJson.departments ?? []);
        setCourses(courseJson.courses ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(loadAll, []);

  async function createDepartment(event: React.FormEvent) {
    event.preventDefault();
    setSavingDept(true);
    try {
      const res = await fetch("/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deptForm),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not create department");
        return;
      }
      toast.success("Department added");
      setDeptForm(emptyDept);
      loadAll();
    } finally {
      setSavingDept(false);
    }
  }

  async function createCourse(event: React.FormEvent) {
    event.preventDefault();
    setSavingCourse(true);
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...courseForm,
          credits: courseForm.credits ? Number(courseForm.credits) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not create course");
        return;
      }
      toast.success("Course added");
      setCourseForm(emptyCourse);
      loadAll();
    } finally {
      setSavingCourse(false);
    }
  }

  async function deleteDepartment(id: string) {
    const res = await fetch(`/api/departments/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Could not delete department");
      return;
    }
    toast.success("Department deleted");
    loadAll();
  }

  async function deleteCourse(id: string) {
    const res = await fetch(`/api/courses/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Could not delete course");
      return;
    }
    toast.success("Course deleted");
    loadAll();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Academics</h1>
        <p className="text-muted-foreground">Departments aur courses manage karo.</p>
      </div>

      {loading ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="size-5" />
                Departments
              </CardTitle>
              <CardDescription>
                Har department ka code users assign karte waqt use hota hai.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={createDepartment} className="space-y-3 rounded-lg border p-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="dept-name">Name</Label>
                    <Input
                      id="dept-name"
                      placeholder="Computer Science"
                      value={deptForm.name}
                      onChange={(e) => setDeptForm((f) => ({ ...f, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="dept-code">Code</Label>
                    <Input
                      id="dept-code"
                      placeholder="CS"
                      value={deptForm.code}
                      onChange={(e) => setDeptForm((f) => ({ ...f, code: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="dept-desc">Description</Label>
                  <Input
                    id="dept-desc"
                    placeholder="Optional"
                    value={deptForm.description}
                    onChange={(e) => setDeptForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <Button type="submit" size="sm" disabled={savingDept}>
                  {savingDept && <Loader2 className="size-4 animate-spin" />}
                  <Plus className="size-4" />
                  Add department
                </Button>
              </form>

              <div className="divide-y">
                {departments.length === 0 && (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    No departments yet.
                  </p>
                )}
                {departments.map((dept) => (
                  <div key={dept._id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 font-medium">
                        {dept.name}
                        <Badge variant="secondary" className="text-xs">
                          {dept.code}
                        </Badge>
                      </p>
                      {dept.description && (
                        <p className="truncate text-xs text-muted-foreground">
                          {dept.description}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive"
                      onClick={() => deleteDepartment(dept._id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookMarked className="size-5" />
                Courses
              </CardTitle>
              <CardDescription>
                Subjects aur courses with unique codes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={createCourse} className="space-y-3 rounded-lg border p-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="course-name">Name</Label>
                    <Input
                      id="course-name"
                      placeholder="Database Management"
                      value={courseForm.name}
                      onChange={(e) => setCourseForm((f) => ({ ...f, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="course-code">Code</Label>
                    <Input
                      id="course-code"
                      placeholder="CS301"
                      value={courseForm.code}
                      onChange={(e) => setCourseForm((f) => ({ ...f, code: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="course-dept">Department</Label>
                    <Input
                      id="course-dept"
                      placeholder="CS"
                      value={courseForm.department}
                      onChange={(e) => setCourseForm((f) => ({ ...f, department: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="course-credits">Credits</Label>
                    <Input
                      id="course-credits"
                      type="number"
                      min={0}
                      max={20}
                      placeholder="4"
                      value={courseForm.credits}
                      onChange={(e) => setCourseForm((f) => ({ ...f, credits: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="course-desc">Description</Label>
                  <Textarea
                    id="course-desc"
                    rows={2}
                    placeholder="Optional"
                    value={courseForm.description}
                    onChange={(e) => setCourseForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <Button type="submit" size="sm" disabled={savingCourse}>
                  {savingCourse && <Loader2 className="size-4 animate-spin" />}
                  <Plus className="size-4" />
                  Add course
                </Button>
              </form>

              <div className="divide-y">
                {courses.length === 0 && (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    No courses yet.
                  </p>
                )}
                {courses.map((course) => (
                  <div key={course._id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 font-medium">
                        {course.name}
                        <Badge variant="secondary" className="text-xs">
                          {course.code}
                        </Badge>
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {[course.department, course.credits ? `${course.credits} credits` : ""]
                          .filter(Boolean)
                          .join(" · ") || "No department"}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive"
                      onClick={() => deleteCourse(course._id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
