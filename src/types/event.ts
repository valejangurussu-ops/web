export interface Event {
  id: number;
  title: string;
  image: string | null;
  description: string | null;
  location: string | null;
  instructions: string | null;
  organization_id: number | null;
  event_category_id: number | null;
  created_at: string;
  organization?: {
    id: number;
    name: string;
  };
  category?: {
    id: number;
    label: string;
    color: string;
  };
}

export interface EventFormData {
  title: string;
  image: string | null;
  description: string;
  location: string;
  instructions: string;
  organization_id: number | null;
  event_category_id: number | null;
}

export type CreateEventData = EventFormData;
export type UpdateEventData = Partial<EventFormData>;
