import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  // TODO: must match the appName registered in the Apps in Toss console.
  appName: 'acorn-hunt-frontend',
  brand: {
    primaryColor: '#77513c', // 도토리 브라운 (Figma progress-fill)
  },
  permissions: [],
  webBundleDir: 'dist',
});
