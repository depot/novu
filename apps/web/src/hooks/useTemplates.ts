import { useQuery } from '@tanstack/react-query';
import { INotificationTemplate } from '@novu/shared';

import { useEnvController } from '../hooks/useEnvController';
import { getNotificationsList } from '../api/notification-templates';

export function useTemplates(page = 0, limit = 10) {
  const { environment } = useEnvController();
  const { data, isLoading, refetch } = useQuery<{
    data: INotificationTemplate[];
    totalCount: number;
    pageSize: number;
  }>(['notificationsList', environment?._id, page, limit], () => getNotificationsList(page, limit), {
    keepPreviousData: true,
  });

  return {
    templates: data?.data,
    loading: isLoading,
    totalCount: data?.totalCount,
    pageSize: data?.pageSize,
    refetch,
  };
}
