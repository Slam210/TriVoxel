// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "trivoxel-a1cd8.firebaseapp.com",
  projectId: "trivoxel-a1cd8",
  storageBucket: "trivoxel-a1cd8.appspot.com",
  messagingSenderId: "1078547629424",
  appId: "1:1078547629424:web:297f8715f0fd21eeca3bb5",
  measurementId: "G-YGWL1KCLYM",
};

// Initialize Firebase
export const app: any = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
