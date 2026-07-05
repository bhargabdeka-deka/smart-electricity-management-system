import { useMemo } from 'react';
import { getLifecycleState } from '../utils/stateMapper';
import { LIFECYCLE_CONFIG } from '../config/lifecycleConfig';
import { LIFECYCLE_STATES } from '../constants/connectionStatus';

export const useLifecycle = (connectionStatus) => {
  return useMemo(() => {
    const statusString = connectionStatus?.status || null;
    const stateKey = getLifecycleState(statusString);
    const config = LIFECYCLE_CONFIG[stateKey] || LIFECYCLE_CONFIG[LIFECYCLE_STATES.REGISTERED];

    return {
      stateKey,
      config,
      isAllowed: (path) => Array.isArray(config?.allowedNavigation) && config.allowedNavigation.includes(path)
    };
  }, [connectionStatus]);
};
