import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  // Packages
  'packages/*',
  // Services
  'services/*',
  // Apps
  'apps/*',
]);
