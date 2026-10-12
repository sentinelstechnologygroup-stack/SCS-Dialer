import {initializeApp,getApps} from 'firebase/app';
import {getAuth,connectAuthEmulator} from 'firebase/auth';
import {getFirestore,connectFirestoreEmulator} from 'firebase/firestore';
import {getStorage,connectStorageEmulator} from 'firebase/storage';
import {getFunctions,connectFunctionsEmulator} from 'firebase/functions';
import {initializeAppCheck,ReCaptchaEnterpriseProvider} from 'firebase/app-check';
export function firebaseServices(env) {
  const required=['VITE_FIREBASE_API_KEY','VITE_FIREBASE_AUTH_DOMAIN','VITE_FIREBASE_PROJECT_ID','VITE_FIREBASE_STORAGE_BUCKET','VITE_FIREBASE_APP_ID'];
  if(required.some(k=>!env[k])) throw new Error('Firebase configuration is incomplete. Production access is unavailable.');
  const app=getApps()[0]||initializeApp({apiKey:env.VITE_FIREBASE_API_KEY,authDomain:env.VITE_FIREBASE_AUTH_DOMAIN,projectId:env.VITE_FIREBASE_PROJECT_ID,storageBucket:env.VITE_FIREBASE_STORAGE_BUCKET,appId:env.VITE_FIREBASE_APP_ID});
  const services={app,auth:getAuth(app),db:getFirestore(app),storage:getStorage(app),functions:getFunctions(app,'us-central1')};
  if(env.VITE_USE_EMULATORS==='true') {
    if(!['localhost','127.0.0.1'].includes(location.hostname)) throw new Error('Emulators require localhost');
    if(!app.__scsEmulators){connectAuthEmulator(services.auth,'http://127.0.0.1:9299',{disableWarnings:true});connectFirestoreEmulator(services.db,'127.0.0.1',8280);connectStorageEmulator(services.storage,'127.0.0.1',9399);connectFunctionsEmulator(services.functions,'127.0.0.1',5501);app.__scsEmulators=true;}
  } else if(!app.__scsAppCheck) {
    if(!env.VITE_FIREBASE_APP_CHECK_SITE_KEY) throw new Error('App Check configuration is required');
    initializeAppCheck(app,{provider:new ReCaptchaEnterpriseProvider(env.VITE_FIREBASE_APP_CHECK_SITE_KEY),isTokenAutoRefreshEnabled:true});app.__scsAppCheck=true;
  }
  return services;
}
