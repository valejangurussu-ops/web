"use client";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import UserForm from "@/components/forms/UserForm";
import { User, UserFormData } from "@/types/user";
import { userService } from "@/services/userService";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function EditarUsuario() {
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = params.id as string;

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const userData = await userService.getUserById(userId);
        if (userData) {
          setUser(userData);
        } else {
          setError("Usuário não encontrado");
        }
      } catch (err) {
        console.error("Erro ao carregar usuário:", err);
        setError("Erro ao carregar usuário");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadUser();
    }
  }, [userId]);

       const handleSubmit = async (userData: UserFormData) => {
         try {
           setIsSubmitting(true);
           await userService.updateUser(userId, userData);
           router.push(`/admin/usuarios/${userId}`);
         } catch (error) {
           console.error("Erro ao atualizar usuário:", error);
           throw error;
         } finally {
           setIsSubmitting(false);
         }
       };

       const handleCancel = () => {
         router.push(`/admin/usuarios/${userId}`);
       };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-gray-500 dark:text-gray-400">Carregando usuário...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-red-500 dark:text-red-400">{error || "Usuário não encontrado"}</div>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb
        pageTitle={`Editar - ${user.name}`}
        breadcrumbs={[
          { label: "Usuários", href: "/admin/usuarios" },
          { label: user.name, href: `/admin/usuarios/${user.id}` },
          { label: "Editar", href: `/admin/usuarios/${user.id}/editar` }
        ]}
      />
      <div className="space-y-6">
        <ComponentCard title="Editar Usuário">
          <UserForm
            user={user}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isSubmitting}
          />
        </ComponentCard>
      </div>
    </div>
  );
}
