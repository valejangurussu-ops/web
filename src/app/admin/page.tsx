"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthLevel } from "@/hooks/useAuthLevel";
import { useAuth } from "@/contexts/AuthContext";
import { getUserOrganizationId } from "@/utils/permissions";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default function AdminPage() {
  const router = useRouter();
  const { isOrganization, loading } = useAuthLevel();
  const { user } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const redirectOrganizationUser = async () => {
      if (loading || isRedirecting) return;

      if (isOrganization && user) {
        setIsRedirecting(true);

        // Get organization ID for organization admins
        let orgId = await getUserOrganizationId(user.id);

        // If not found, try via API (for additional users with metadata)
        if (!orgId) {
          try {
            const response = await fetch('/api/users/organizations', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ userIds: [user.id] }),
            });

            if (response.ok) {
              const data = await response.json();
              const org = data.organizations?.[user.id];
              if (org) {
                orgId = org.id;
              }
            }
          } catch (error) {
            console.error('Erro ao buscar organização via API:', error);
          }
        }

        if (orgId) {
          router.replace(`/admin/organizacoes/${orgId}`);
        } else {
          // Fallback: redirect to events if organization ID not found
          router.replace("/admin/eventos");
        }
      }
    };

    if (!loading && isOrganization && user) {
      redirectOrganizationUser();
    }
  }, [isOrganization, loading, user, router, isRedirecting]);

  if (loading || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (isOrganization) {
    return null; // Redirecionando...
  }

  return <AdminDashboard />;
}
