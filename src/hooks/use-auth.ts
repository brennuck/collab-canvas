import { trpc } from "@/lib/trpc";

export function useAuth() {
  const { data: user, isLoading, refetch } = trpc.auth.me.useQuery();

  const loginMutation = trpc.auth.login.useMutation();
  const registerMutation = trpc.auth.register.useMutation();
  const logoutMutation = trpc.auth.logout.useMutation();

  const login = async (data: { email: string; password: string }) => {
    const result = await loginMutation.mutateAsync(data);
    await refetch();
    return result;
  };

  const register = async (data: { email: string; password: string; name?: string }) => {
    const result = await registerMutation.mutateAsync(data);
    await refetch();
    return result;
  };

  const logout = async () => {
    const result = await logoutMutation.mutateAsync();
    await refetch();
    return result;
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}
