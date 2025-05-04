// Enhanced Task interfaces with new fields
export interface AttachedDocument {
  secure_url: string
  public_id: string
  resource_type: string
  format: string
  bytes: number
  original_filename: string
  upload_timestamp: string
}

export interface Comment {
  text: string
  user_id: number
  timestamp: string
  user_name: string
}

export enum TaskStatus {
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
}

export enum ReviewStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export interface Task {
  id: number
  title: string
  description: string
  contribution: string
  status: string
  due_date: string
  latitude: number
  longitude: number
  location_name: string
  remarks: string
  related_project: string
  achieved_deliverables: string
  created_by: number
  company_served:
    | {
        name: string
        tin?: string
      }
    | string
  department?: {
    id: number
    name: string
  }
  reviewed?: boolean
  review_status?: string
  attached_documents?: AttachedDocument[] // New field for file attachments
  comments?: Comment[]
}

export interface TaskFormData extends Omit<Task, "id" | "attached_documents"> {
  attached_documents?: File[] // For form submission
}

export interface ReworkTaskData {
  taskId: number
  formData: FormData
  updatedFields: Partial<Task>
}
