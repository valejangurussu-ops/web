"use client";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { User } from "@/types/user";
import { userService } from "@/services/userService";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function DetalhesUsuario() {
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
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

  const handleEdit = () => {
    router.push(`/admin/usuarios/${userId}/editar`);
  };

  const handleDelete = async () => {
    if (!user) return;

    if (confirm(`Tem certeza que deseja excluir o usuário ${user.name}?`)) {
      try {
        await userService.deleteUser();
        router.push("/admin/usuarios");
      } catch (error) {
        console.error("Erro ao excluir usuário:", error);
        alert("Erro ao excluir usuário");
      }
    }
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
        pageTitle={`Detalhes - ${user.name}`}
        breadcrumbs={[
          { label: "Usuários", href: "/admin/usuarios" },
          { label: user.name, href: `/admin/usuarios/${user.id}` }
        ]}
      />
      <div className="space-y-6">
        {/* Informações Básicas */}
        <ComponentCard title="Informações Básicas">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-brand-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-2xl">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {user.name}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
              </div>
            </div>
          </div>
        </ComponentCard>

        {/* Detalhes Completos */}
        <ComponentCard title="Detalhes Completos">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nome Completo
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{user.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Data de Nascimento
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {new Date(user.birthDate).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Telefone
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{user.phone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Criado em
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {new Date(user.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Última atualização
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {new Date(user.updatedAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </ComponentCard>

        {/* Ações */}
        <ComponentCard title="Ações">
          <div className="flex space-x-4">
            <button
              onClick={handleEdit}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-brand-500 border border-transparent rounded-lg hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Editar Usuário
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Excluir Usuário
            </button>
            <button
              onClick={() => router.push("/usuarios")}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Voltar
            </button>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
