import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

export interface ProfileData {
  id?: string
  name: string
  email: string
  role?: string
}

export function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar dados do perfil
  const loadProfile = useCallback(async () => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Buscar dados do perfil na tabela profiles
      console.log('Buscando perfil para usuário:', user.id)
      const { data, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      console.log('Resultado da consulta:', { data, profileError })

      if (profileError) {
        // Verificar se a tabela não existe
        if (profileError.code === '42P01' || profileError.message?.includes('relation "profiles" does not exist')) {
          setError('Tabela profiles não encontrada. Execute o script SQL no Supabase para criar a tabela.')
          setLoading(false)
          return
        }

        // Se não existe perfil, criar um com dados básicos do usuário
        if (profileError.code === 'PGRST116') {
          const newProfile = {
            id: user.id,
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
            email: user.email || ''
          }

          const { error: insertError } = await supabase
            .from('users')
            .insert([newProfile])

          if (insertError) {
            throw insertError
          }

          setProfile(newProfile)
        } else {
          throw profileError
        }
      } else {
        setProfile(data)
      }
    } catch (err) {
      console.error('Erro ao carregar perfil:', err)
      console.error('Tipo do erro:', typeof err)
      console.error('Erro stringificado:', JSON.stringify(err, null, 2))

      let errorMessage = 'Erro ao carregar perfil'

      if (err instanceof Error) {
        errorMessage = err.message
      } else if (typeof err === 'object' && err !== null) {
        // Se for um objeto, tentar extrair informações úteis
        if ('message' in err) {
          errorMessage = String(err.message)
        } else if ('code' in err) {
          errorMessage = `Erro ${err.code}: ${JSON.stringify(err)}`
        } else {
          errorMessage = `Erro desconhecido: ${JSON.stringify(err)}`
        }
      } else {
        errorMessage = `Erro: ${String(err)}`
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Atualizar dados do perfil
  const updateProfile = async (updates: Partial<ProfileData>) => {
    if (!user || !profile) return

    try {
      setError(null)

      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)

      if (error) {
        throw error
      }

      // Atualizar estado local
      setProfile(prev => prev ? { ...prev, ...updates } : null)

      return { success: true }
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar perfil'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }


  useEffect(() => {
    loadProfile()
  }, [user, loadProfile])

  return {
    profile,
    loading,
    error,
    updateProfile,
    loadProfile
  }
}
