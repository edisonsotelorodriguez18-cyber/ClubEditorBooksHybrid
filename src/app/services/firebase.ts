import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { environment } from '../../environments/environment';

const configured = Boolean(environment.firebase?.apiKey && environment.firebase.apiKey !== 'PEGA_TU_API_KEY');
export const firebaseEnabled = configured;
const app = configured ? (getApps()[0] ?? initializeApp(environment.firebase)) : undefined;
export const auth = app ? getAuth(app) : undefined;
export const db = app ? getFirestore(app) : undefined;
