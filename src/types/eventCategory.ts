export interface EventCategory {
  id: number;
  label: string;
  color: string; // HEX color
  created_at: string;
}

export interface EventCategoryFormData {
  label: string;
  color: string;
}

export type CreateEventCategoryData = EventCategoryFormData;
export type UpdateEventCategoryData = Partial<EventCategoryFormData>;
