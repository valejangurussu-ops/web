export interface Organization {
  id: number;
  name: string;
  whatsapp: string | null;
  location: string | null;
  location_link: string | null;
  slogan: string | null;
  website: string | null;
  created_at: string;
}

export interface OrganizationFormData {
  name: string;
  whatsapp: string;
  location: string;
  location_link: string;
  slogan: string;
  website: string;
}

export type CreateOrganizationData = OrganizationFormData;
export type UpdateOrganizationData = Partial<OrganizationFormData>;
