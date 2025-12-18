"use client";

import React, { useEffect, useState, useCallback } from "react";
import { roleService, UserRole } from "@/services/roleService";
import { useAuthLevel } from "@/hooks/useAuthLevel";
import { useAuth } from "@/contexts/AuthContext";
import { getUserOrganizationId } from "@/utils/permissions";
import Link from "next/link";

interface UserWithRole extends UserRole {
  user: {
    name: string;
    email: string;
    profile_type?: string;
  };
  organization?: {
    id: number;
    name: string;
  } | null;
}

export function UserRoleManager() {
  const { isAdmin, isOrganization, loading } = useAuthLevel();
  const { user } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [userOrgId, setUserOrgId] = useState<number | null>(null);

  const loadUsers = useCallback(async (orgId: number | null = null) => {
    try {
      setLoadingUsers(true);
      let usersData = await roleService.getAllUsersWithRoles();

      // Para usuários organization que não têm organização no resultado,
      // buscar via API (para usuários adicionais com metadata)
      // Buscar TODOS os usuários organization para garantir que temos as organizações
      const allOrgUsers = usersData.filter(
        u => u.user.profile_type === 'organization'
      );

      if (allOrgUsers.length > 0) {
        try {
          const response = await fetch('/api/users/organizations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userIds: allOrgUsers.map(u => u.user_id)
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const orgsMap = data.organizations || {};

            // Atualizar usuários com organizações encontradas
            usersData = usersData.map(user => {
              // Se já tem organização, manter
              if (user.organization) {
                return user;
              }
              // Se não tem, tentar buscar no mapa
              if (user.user.profile_type === 'organization' && orgsMap[user.user_id]) {
                return {
                  ...user,
                  organization: orgsMap[user.user_id]
                };
              }
              return user;
            });
          }
        } catch (error) {
          console.error('Erro ao buscar organizações adicionais:', error);
        }
      }

      // Filter users based on user type
      let filteredUsers = usersData;

      if (isOrganization && orgId !== null) {
        // Organization admins can only see users from their organization
        // AND only users with profile_type='organization'
        console.log('=== FILTERING USERS ===');
        console.log('Organization Admin Org ID:', orgId);
        console.log('Total users before filter:', usersData.length);
        console.log('Users before filter:', usersData.map(u => ({
          id: u.user_id,
          name: u.user.name,
          email: u.user.email,
          profile_type: u.user.profile_type,
          org_id: u.organization?.id,
          org_name: u.organization?.name
        })));

        filteredUsers = usersData.filter(u => {
          // Must be organization type
          if (u.user.profile_type !== 'organization') {
            return false;
          }

          // Must belong to the same organization
          const userOrgId = u.organization?.id;
          if (!userOrgId) {
            console.log(`User ${u.user.name} has no organization assigned`);
            return false;
          }

          const matches = userOrgId === orgId;
          console.log(`User ${u.user.name}: profile_type=${u.user.profile_type}, org_id=${userOrgId}, target_org_id=${orgId}, matches=${matches}`);

          return matches;
        });

        console.log('Filtered users count:', filteredUsers.length);
        console.log('Filtered users:', filteredUsers.map(u => ({
          name: u.user.name,
          email: u.user.email,
          org_id: u.organization?.id
        })));
        console.log('=== END FILTERING ===');
      }

      setUsers(filteredUsers);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoadingUsers(false);
    }
  }, [isOrganization]);

  useEffect(() => {
    const initialize = async () => {
      if (isOrganization && user) {
        // Get organization ID for organization admins
        // First try direct lookup
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

        console.log('Organization Admin - User Org ID:', orgId);
        setUserOrgId(orgId);

        // Load users after setting orgId
        if (orgId !== null) {
          loadUsers(orgId);
        }
      } else if (isAdmin) {
        // Super admin loads all users
        loadUsers(null);
      }
    };
    initialize();
  }, [isAdmin, isOrganization, user, loadUsers]);

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      setUpdating(userId);
      const success = await roleService.updateUserRole(userId, newRole);

      if (success) {
        // Recarregar lista com o orgId correto
        await loadUsers(isOrganization ? userOrgId : null);
      } else {
        alert('Erro ao atualizar role do usuário');
      }
    } catch (error) {
      console.error('Erro ao atualizar role:', error);
      alert('Erro ao atualizar role do usuário');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!isAdmin && !isOrganization) {
    return (
      <div className="text-center p-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Acesso Negado</h3>
        <p className="text-gray-600">Apenas administradores podem gerenciar usuários.</p>
      </div>
    );
  }

  if (loadingUsers) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Gerenciar Usuários</h3>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo de Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organização
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users
                .filter((user) => {
                  // Additional safety filter: if current user is organization admin,
                  // only show users from the same organization
                  if (isOrganization && userOrgId !== null) {
                    // Must be organization type
                    if (user.user.profile_type !== 'organization') {
                      return false;
                    }
                    // Must belong to the same organization
                    return user.organization?.id === userOrgId;
                  }
                  return true;
                })
                .map((user) => {
                const isSuperAdmin = user.role === 'admin' && user.user.profile_type === 'admin';
                const isOrganizationAdmin = user.role === 'admin' && user.user.profile_type === 'organization';
                const isRegularUser = user.role === 'user' || !user.user.profile_type || user.user.profile_type === 'user';

                return (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.user.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {user.user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isSuperAdmin ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Super Admin
                        </span>
                      ) : isOrganizationAdmin ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Organization Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Usuário
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.organization ? (
                        <Link
                          href={`/admin/organizacoes/${user.organization.id}`}
                          className="text-sm text-blue-600 hover:text-blue-900 hover:underline font-medium"
                        >
                          {user.organization.name}
                        </Link>
                      ) : isOrganizationAdmin ? (
                        <span className="text-sm text-gray-500 italic">Buscando...</span>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {isOrganization ? (
                        <span className="text-gray-400 text-xs">Apenas visualização</span>
                      ) : (
                        <div className="flex space-x-2">
                          {isSuperAdmin ? (
                            <button
                              onClick={() => handleRoleChange(user.user_id, 'user')}
                              disabled={updating === user.user_id}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            >
                              {updating === user.user_id ? 'Atualizando...' : 'Rebaixar a Usuário'}
                            </button>
                          ) : isRegularUser ? (
                            <button
                              onClick={() => handleRoleChange(user.user_id, 'admin')}
                              disabled={updating === user.user_id}
                              className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                            >
                              {updating === user.user_id ? 'Atualizando...' : 'Promover a Admin'}
                            </button>
                          ) : (
                            <span className="text-gray-400 text-xs">Apenas leitura</span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhum usuário encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
