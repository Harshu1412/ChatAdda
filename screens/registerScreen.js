import React, { useState } from 'react';
import {  Text, View, TextInput, Image, SafeAreaView, TouchableOpacity,Alert, StyleSheet, Modal, ActivityIndicator } from "react-native";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { db } from '../App';
import { doc, setDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button, Snackbar } from 'react-native-paper';


const backImage = require("../assets/sam.png");

export default function RegisterScreen({ navigation }) {

  const saveUserData = async (userData) => {
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      console.log("??????????/////////////",userData);
      
    } catch (error) {
      console.log(error);
    }
  };
  

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmpassword,setConfirmpassword]=useState('');
  const [name,setName]=useState('');
  const[isLoading,setIsLoading]=useState(false);
  const [profile,setProfile]=useState("");
  const [error,setError]=useState(null);
  const [visible, setVisible] = useState(false);
  const [loading,setLoading]=useState(false)

const auth=getAuth();
  const handleRegistration = () => {
    setLoading(true);

    if(name==="" || email==="" ) {
      Alert.alert('Alert', 'Email or Name cannot be null', [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {text: 'OK'},
      ]);
      setLoading(false)
    }

    else if(password !== confirmpassword) {
      Alert.alert('Alert', 'Password does not match', [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {text: 'OK'},
      ]);
      setLoading(false)
    }

    else createUserWithEmailAndPassword(auth, email, password).then((usercredential) => {
      setIsLoading(false);

      const userData = usercredential.user;
    
      const userUid = auth.currentUser.uid;
      console.log("*********************", userUid);
    
      updateProfile(userData, {
        displayName: name,
        // photoURL: profile
      }).then(() => {
        console.log("Display name updated successfully!");
        console.log("User:", userData);
        console.log("Name:", name);
        console.log("Email:", email);
        console.log("Password:", password);
        saveUserData(userData);
        setDoc(doc(db, "users", `${userUid}`), {
          email: email,
          name: name,
          profile: profile
        }).then(() => {
          console.log("User document updated successfully!");
          setVisible(true)
          setLoading(false)
          Alert.alert(
            "Registration Successful",
            "You are successfully registered. Now you can log in.",
            [
              {
                text: "OK",
                onPress: () => {
                  navigation.navigate("login"); 
                },
              },
            ]
          );
         
        }).catch((error) => {
          console.error("Error updating user document:", error);
        });
      }).catch((error) => {
        console.error("Error updating display name:", error);
      });
    }).catch((e)=>{
      setError(e.toString())
      console.log(error);
      Alert.alert('Alert ', error, [
        {
          text: 'Cancel',
          
          style: 'cancel',
        },
        {text: 'OK'},
      ]);
    setLoading(false)

    })
    
  };
  

  
  return (
    <>
    {loading && (
        <View>
          <Modal animationType="slide" transparent={true} visible={loading}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <ActivityIndicator size={40} />
              </View>
            </View>
          </Modal>
        </View>
      )}
    <View style={{ flex: 1,backgroundColor: "#fff",}}>
      <Image source={backImage} style={{ width: "100%",height: 340,position: "absolute",resizeMode: 'cover',}} />
      <View style={{width: '100%',height: '80%',position: "absolute",bottom: 0,backgroundColor: 'white',borderTopLeftRadius: 60,borderTopRightRadius: 60,}} />
      <SafeAreaView style={{flex: 1,justifyContent: 'center',marginHorizontal: 30,}}>
        <Text style={{ fontSize: 36,fontWeight: 'bold',color: "orange",alignSelf: "center",paddingBottom: 24,marginTop:100}}>Sign Up</Text>
        <TextInput
        style={{ backgroundColor: "lightblue",height: 58,marginBottom: 10,fontSize: 16,borderRadius: 10,padding: 12,}}
        placeholder="Name"
        value={name}
        onChangeText={(text) => setName(text)}
      />
         <TextInput
        style={{ backgroundColor: "lightblue",height: 58,marginBottom: 10,fontSize: 16,borderRadius: 10,padding: 12,}}
        placeholder="Enter email"
        autoCapitalize="none"
        keyboardType="email-address"
        textContentType="emailAddress"
        autoFocus={true}
        value={email}
        onChangeText={(text) => setEmail(text)}
      />
      <TextInput
        style={{ backgroundColor: "lightblue",height: 58,marginBottom: 10,fontSize: 16,borderRadius: 10,padding: 12,}}
        placeholder="Enter password"
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry={true}
        textContentType="password"
        value={password}
        onChangeText={(text) => setPassword(text)}
      />
      <TextInput
        style={{ backgroundColor: "lightblue",height: 58,marginBottom: 10,fontSize: 16,borderRadius: 10,padding: 12,}}
        placeholder="Confirm  password"
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry={true}
        textContentType="password"
        
        onChangeText={(text) => setConfirmpassword(text)}
      />
      
      <TouchableOpacity style={{backgroundColor: '#f57c00',height: 58,borderRadius: 10,justifyContent: 'center',alignItems: 'center',marginTop: 40,}} onPress={handleRegistration}>
        <Text style={{fontWeight: 'bold', color: 'white', fontSize: 18}}> Sign Up</Text>
      </TouchableOpacity>
      <View style={{marginTop: 20, flexDirection: 'row', alignItems: 'center', alignSelf: 'center'}}>
      <Text style={{color: 'gray', fontWeight: '600', fontSize: 14}}>Already Have An Account ? </Text>
        <TouchableOpacity onPress={()=>navigation.navigate("login")}>
          <Text style={{color: 'red', fontWeight: '600', fontSize: 14}}> Log In</Text>
        </TouchableOpacity>
      </View>


      
    
    
      </SafeAreaView>
     
    </View>
    </>
  );
}


const styles = StyleSheet.create({
centeredView: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  marginTop: 22,
},
modalView: {
  margin: 20,

  borderRadius: 20,
  width: "70%",
  height: "20%",
  justifyContent: "center",
  alignItems: "center",
},
})
