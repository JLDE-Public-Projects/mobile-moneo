import {
  useMutation,
  UseMutationResult,
  useQuery,
  UseQueryResult,
} from '@tanstack/react-query';
import { getRepositories } from '@/services/container';
import {
  AuthSession,
  AuthUser,
  LoginPayload,
  RegisterPayload,
  UpdateProfileInput,
} from '@/services/auth/auth.types';
import { useAuthStore } from '@/store/authStore';

/**
 * Mutación de inicio de sesión.
 *
 * Une las tres capas sin acoplarlas: obtiene la implementación activa del
 * repositorio desde el contenedor (no sabe si es mock/SQLite/API), delega la
 * petición en TanStack Query y, al tener éxito, guarda la sesión en el store
 * global de Zustand.
 */
export function useLoginMutation(): UseMutationResult<
  AuthSession,
  Error,
  LoginPayload
> {
  const setSession = useAuthStore((state) => state.setSession);
  return useMutation({
    mutationFn: (payload: LoginPayload) =>
      getRepositories().auth.login(payload),
    onSuccess: (session) => setSession(session),
  });
}

/** Mutación de registro. Mismo patrón que {@link useLoginMutation}. */
export function useRegisterMutation(): UseMutationResult<
  AuthSession,
  Error,
  RegisterPayload
> {
  const setSession = useAuthStore((state) => state.setSession);
  return useMutation({
    mutationFn: (payload: RegisterPayload) =>
      getRepositories().auth.register(payload),
    onSuccess: (session) => setSession(session),
  });
}

/**
 * Mutación para actualizar el perfil (nombre, usuario y clave opcional).
 * Al tener éxito, refresca el usuario en la sesión global manteniendo el token.
 */
export function useUpdateProfile(): UseMutationResult<
  AuthUser,
  Error,
  UpdateProfileInput
> {
  const setUser = useAuthStore((state) => state.setUser);
  return useMutation({
    mutationFn: (input: UpdateProfileInput) =>
      getRepositories().auth.updateProfile(input),
    onSuccess: (user) => setUser(user),
  });
}

/**
 * Consulta el código de invitación propio del usuario para compartirlo.
 * Se cachea por sesión; solo se pide cuando hay un usuario autenticado.
 */
export function useInviteCodeQuery(userId?: string): UseQueryResult<string, Error> {
  return useQuery({
    queryKey: ['inviteCode', userId],
    queryFn: () => getRepositories().auth.getInviteCode(),
    enabled: Boolean(userId),
    staleTime: Infinity,
  });
}
