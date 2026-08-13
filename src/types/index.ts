export type Role = "STUDENT" | "ADMIN" | "STAFF";

export type Category =
  | "WIFI"
  | "CLASSROOM"
  | "HOSTEL"
  | "LAB"
  | "MAINTENANCE"
  | "CLEANLINESS";

export type Status = "PENDING" | "IN_PROGRESS" | "RESOLVED" | "REJECTED";

export type Priority = "LOW" | "MED" | "HIGH" | "URGENT";

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: Role;
  image?: string | null;
}

export interface ComplaintDTO {
  id: string;
  title: string;
  description: string;
  category: Category;
  status: Status;
  priority: Priority;
  location: string;
  roomTag?: string | null;
  imageUrl?: string | null;
  userId: string;
  user?: Pick<UserDTO, "id" | "name" | "image">;
  assignedToId?: string | null;
  assignedTo?: Pick<UserDTO, "id" | "name"> | null;
  department?: string | null;
  upvoteCount: number;
  hasUpvoted?: boolean;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
}

export const CATEGORY_META: Record<
  Category,
  { label: string; icon: string; color: string }
> = {
  WIFI: { label: "WiFi", icon: "wifi", color: "#38bdf8" },
  CLASSROOM: { label: "Classroom", icon: "presentation", color: "#a78bfa" },
  HOSTEL: { label: "Hostel", icon: "building-2", color: "#fb923c" },
  LAB: { label: "Lab", icon: "flask-conical", color: "#34d399" },
  MAINTENANCE: { label: "Maintenance", icon: "wrench", color: "#f87171" },
  CLEANLINESS: { label: "Cleanliness", icon: "sparkles", color: "#facc15" },
};

export const PRIORITY_META: Record<
  Priority,
  { label: string; color: string; glow: string }
> = {
  LOW: { label: "Low", color: "#4ade80", glow: "rgba(74,222,128,0.55)" },
  MED: { label: "Medium", color: "#facc15", glow: "rgba(250,204,21,0.55)" },
  HIGH: { label: "High", color: "#fb923c", glow: "rgba(251,146,60,0.6)" },
  URGENT: { label: "Urgent", color: "#f87171", glow: "rgba(248,113,113,0.65)" },
};

export const STATUS_META: Record<
  Status,
  { label: string; color: string; glow: string }
> = {
  PENDING: { label: "Pending", color: "#94a3b8", glow: "rgba(148,163,184,0.5)" },
  IN_PROGRESS: {
    label: "In Progress",
    color: "#38bdf8",
    glow: "rgba(56,189,248,0.6)",
  },
  RESOLVED: { label: "Resolved", color: "#4ade80", glow: "rgba(74,222,128,0.6)" },
  REJECTED: { label: "Rejected", color: "#f87171", glow: "rgba(248,113,113,0.5)" },
};

export const STATUS_FLOW: Status[] = [
  "PENDING",
  "IN_PROGRESS",
  "RESOLVED",
  "REJECTED",
];
