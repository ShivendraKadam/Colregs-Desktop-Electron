import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'Colregs',
  webDir: 'www',
  bundledWebRuntime: false,
  android: {
    allowMixedContent: true,
  },
  plugins: {
    Network: {
      // You can add plugin configuration options here, if necessary
    },
  },

  server: {
    androidScheme: 'http',

    cleartext: true,

    allowNavigation: [
      'http://et-learn-backend-env.eba-dfd3g9nn.ap-south-1.elasticbeanstalk.com/api',
    ],
  },
};

export default config;
