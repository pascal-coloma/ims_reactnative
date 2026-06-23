import { getApps, initializeApp } from '@react-native-firebase/app';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  projectId: 'ims-ambulancias',
  storageBucket: 'ims-ambulancias.firebasestorage.app',
  messagingSenderId: '562177550205',
  appId: '1:562177550205:android:cc6c8720e70f01a26f8e14',
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}
