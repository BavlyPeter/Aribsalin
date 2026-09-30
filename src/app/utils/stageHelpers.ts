import { tenantConfig } from '../../config/tenant';

export const stageLabels: Record<string, string> = {
  ...tenantConfig.educationStages,
  ...tenantConfig.CLASS_LABELS
};
