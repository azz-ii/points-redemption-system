import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { fetchCurrentUser, type UserProfile } from '@/lib/api';

interface UseCurrentUserOptions {
  enabled?: boolean;
  refetchInterval?: number | false;
}

export function useCurrentUser(options: UseCurrentUserOptions = {}) {
  const { enabled = true, refetchInterval } = options;
  return useQuery<UserProfile>({
    queryKey: queryKeys.currentUser,
    queryFn: fetchCurrentUser,
    enabled,
    refetchInterval,
  });
}
