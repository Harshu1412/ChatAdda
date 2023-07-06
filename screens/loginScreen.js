import React, { useState,useEffect } from "react";
import {  Text, View, TextInput, Image, SafeAreaView, TouchableOpacity, StyleSheet, Modal, ActivityIndicator } from "react-native";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage"


const saveUserData = async (userData) => {
  try {
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    console.log(userData);
    
  } catch (error) {
    console.log(error);
  }
};

const getUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem('userData');
    if (userData !== null) {
      return JSON.parse(userData);
    }
  } catch (error) {
    console.log(error);
  }
};





const backImage = require("../assets/sam.png");

export default function Login({ navigation }) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
 
  const [user,setUser]=useState(null);
  const[isLoading,setIsLoading]=useState(false);
  const[error,setError]=useState(null);


  const auth = getAuth();

  useEffect(() => {
    getUserData().then((userData) => {
      if (userData) {
        
        navigation.navigate("main")
        setUser(userData);
      }
    });
  }, []);



  const onLogin=(email,password)=>{
    setIsLoading(true)
    signInWithEmailAndPassword(auth,email,password).then((userData)=>{
       
      saveUserData(userData);
      setUser(userData);
      setIsLoading(false);
        navigation.navigate('main')
      
       

   

    }).catch((error)=>{
      setIsLoading(false);
      setError(error);
    })
}


 
  
  return (
    <>
    {isLoading && (
        <View>
          <Modal animationType="slide" transparent={true} visible={isLoading}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <ActivityIndicator size={40} />
              </View>
            </View>
          </Modal>
        </View>
      )}
    <View style={{ flex: 1,  backgroundColor: "white",}}>
      <Image source={backImage} style={{ width: 400,height: 340,position: "absolute",}} />
      <View style={{ width: '100%',height: '75%',position: "absolute",bottom: 0,backgroundColor: 'white',borderTopLeftRadius: 60,borderTopRightRadius: 60,}} />
      <SafeAreaView style={{ flex: 1,justifyContent: 'center',marginHorizontal: 30,}}>
        <Text style={{fontSize: 36,fontWeight: 'bold',color: "orange",alignSelf: "center",paddingBottom: 24,marginTop:120}}>Log In</Text>
         <TextInput
        style={{backgroundColor: "lightblue",height: 58,marginBottom: 20,fontSize: 16,borderRadius: 10,padding: 12,}}
        placeholder="Enter email"
        autoCapitalize="none"
        keyboardType="email-address"
        textContentType="emailAddress"
        autoFocus={true}
        value={email}
        onChangeText={(text) => setEmail(text)}
      />
      <TextInput
        style={{ backgroundColor: "lightblue",height: 58,marginBottom: 20,fontSize: 16,borderRadius: 10,padding: 12,}}
        placeholder="Enter password"
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry={true}
        textContentType="password"
        value={password}
        onChangeText={(text) => setPassword(text)}
      />
      <TouchableOpacity style={{backgroundColor: 'orange',height: 58,borderRadius: 10,justifyContent: 'center',alignItems: 'center',marginTop: 40,}} onPress={()=>onLogin(email,password)}>
        <Text style={{fontWeight: 'bold', color: '#fff', fontSize: 18}}> Log In</Text>
      </TouchableOpacity>
      <View style={{marginTop: 20, flexDirection: 'row', alignItems: 'center', alignSelf: 'center'}}>
        <Text style={{color: 'gray', fontWeight: '600', fontSize: 14}}>Don't have an account? </Text>
        <TouchableOpacity onPress={() =>navigation.navigate("Register")}>
          <Text style={{color: 'red', fontWeight: '600', fontSize: 14}}> Sign Up</Text>
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