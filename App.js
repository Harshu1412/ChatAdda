import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore";

import NavigationScreen from './screens/NavigationScreen';
import { getAuth } from 'firebase/auth';
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBAeWRZd2hQgGI_1cMmhAXWtF-u0sNUA1E",
  authDomain: "chatadda-e5d2f.firebaseapp.com",
  projectId: "chatadda-e5d2f",
  storageBucket: "chatadda-e5d2f.appspot.com",
  messagingSenderId: "381553511236",
  appId: "1:381553511236:web:f1b98f9bf509b74baf6511"
};
export const app = initializeApp(firebaseConfig);

export const auth=getAuth();
const firestoreDB = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
});
export const db = getFirestore(app);

export const storage=getStorage();
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <View style={styles.container}>
      <NavigationScreen/>
      
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
   
    justifyContent: 'center',
  },
});

