import React, { useState, useEffect} from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, StyleSheet, Image, ActivityIndicator, Modal} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { doc, getDoc, collection, getDocs, addDoc, updateDoc, arrayUnion, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from '../App';
import { Ionicons } from '@expo/vector-icons';
import notifee,{AndroidImportance} from '@notifee/react-native';
import { getStorage,ref,uploadBytesResumable,getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons'; 
import { MaterialIcons } from '@expo/vector-icons';


export default function GroupChatScreen() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [secret,setSecret]=useState(false);
  const [secretCodee,setSecretCodee]=useState("");
  const [mediaLoader,setMediaLoader]=useState(false)
  const[myimage,setMyimage]=useState(null)
  const[modall,setModall]=useState(false)

  const navigation = useNavigation();
  const route = useRoute();
  const { groupId ,user,group} = route.params;
  console.log("++++++++++++",group)
  console.log(group.creator === user.user.uid)
  
  useEffect(() => {
    loadGroupMessages();
    setSecretCodee(group.groupSecret)
   
  }, []);


  const isUserMessage = (message) => {
    return message.id === user.user.email;
  };

  const renderMessageContainer = ({ item }) => {
    const isUser = isUserMessage(item);
    const openModal = (imageUri) => {
      setMyimage(imageUri);
      setModall(true);
    };
    
    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.otherMessageContainer]}>
         
         {!isUser && (<Text style={{fontWeight:"900", fontSize: 12}}>{item.name}</Text>)}
    <View style={{flexDirection: item.image ?"column":"row"}}>
    {item.image &&(
      <TouchableOpacity style={{height:200,width:"90%"}} onPress={() => openModal(item.image)}>
    <Image source={{uri:item.image}} style={{width:150,height:"100%",borderRadius:8,marginTop:5}}/>
      </TouchableOpacity>
      
    )}
  <Text style={styles.messageText}>{item.text}</Text>
  <Text style={styles.messageTimestamp}>
  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
  </Text>
  </View>
      </View>
    );
  };

  async function onDisplayNotification() {
    const channelId = await notifee.createChannel({
      id: 'important',
      name: 'Important Notifications',
      importance: AndroidImportance.HIGH,
    });
     console.log(channelId)
    await notifee.displayNotification({
      title: "Hey",
      body: "Welcome to group",
      android: {
        channelId,
        color: '#0C8A7B',
      },
    });
  }


  
    const handlemedia = async () => {
     
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });
  if (!result.canceled) {
   
          const { uri } = result.assets[0];
          console.log("Image picked successfully", uri);
          uploadImage(uri);
          setMediaLoader(true)
        }
      } catch (error) {
        console.log(error);
        setMediaLoader(false)
      }
    };
    const uploadImage = async (uri) => {
      try {
        const response = await fetch(uri);
        const blob = await response.blob();
        const storage = getStorage();
        const storageRef = ref(storage, `samurai/${Date.now()}`);
        const uploadTask = await uploadBytesResumable(storageRef, blob);
        console.log("Image uploaded successfully");
        const url = await getDownloadURL(storageRef);
        console.log(url);
        const messageData = {
          id:user.user.email,
          text:"",
          image:url,
          timestamp: new Date().getTime(),
          name:user.user.displayName
  
        };
  
        await addDoc(collection(db, "groups", groupId, "messages"), messageData);
        setMediaLoader(false)
      } catch (error) {
        console.log(error);
        setMediaLoader(false)
      }
    }; 


    const handleTakePhoto = async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status === 'granted') {
        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });
        if (!result.canceled) {
          const { uri } = result.assets[0];
        
          console.log("Image picked successfully", uri);
          uploadImage(uri);
          setMediaLoader(true)
        }
      } else {
        alert('Camera permission not granted');
      }}

     


  



  
const loadGroupMessages = () => {
    const collectionRef = collection(db, "groups", groupId, "messages")
    const q = query(collectionRef, orderBy('timestamp', 'desc'));
    return onSnapshot(q, (querySnapshot) => {
     
      setMessages(
        querySnapshot.docs.map((doc) => doc.data())
      );
      onDisplayNotification()
    }, (error) => {
      console.log(error);
    });
  };

  const sendMessage = async () => {
    if (inputText.trim() === "") {
      return;
    }

    try {
      setLoading(true);
      setInputText("");
      
      const messageData = {
        id:user.user.email,
        text: inputText.trim(),
        timestamp: new Date().getTime(),
        name:user.user.displayName

      };

      await addDoc(collection(db, "groups", groupId, "messages"), messageData);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>


     
     
    <View style={styles.container}>
      {group.creator === user.user.uid ?<View style={{height: 50,
        backgroundColor: 'white',
        borderRadius: 8,
        width: '90%',
        
        alignItems: 'center',
        alignSelf: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        shadowColor: '#001',
        padding: 12,
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        marginTop: 40,}}>
          <View style={{position:"absolute",left:20}}>
              <TouchableOpacity onPress={()=>navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="black" />
              </TouchableOpacity >
            
              </View>
          <Text style={{fontWeight:"bold"}}>{group.name}</Text>
        <Text>secret code :-{secretCodee}</Text></View>:<View style={{height: 40,
          backgroundColor: 'white',
          borderRadius: 8,
          width: '90%',
          alignItems: 'center',
          alignSelf: 'center',
          justifyContent: 'center',
          marginBottom: 10,
          shadowColor: '#001',
          padding: 12,
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
          marginTop: 40,}}>
            <View style={{position:"absolute",left:20}}>
              <TouchableOpacity onPress={()=>navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="black" />
              </TouchableOpacity >
            
              </View>
            <Text style={{fontWeight:"bold"}}>{group.name}</Text></View>}
     
    
      <FlatList
        data={messages}
        renderItem={renderMessageContainer}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.messagesList}
        inverted
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={inputText}
          onChangeText={setInputText}
        />
         <TouchableOpacity style={styles.sendButton} onPress={handleTakePhoto}>
         <Entypo name="camera" size={24} color="black" />
        </TouchableOpacity>
         <TouchableOpacity style={styles.sendButton} onPress={handlemedia}>
         <FontAwesome name="photo" size={24} color="black" />     
          </TouchableOpacity>
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
        <Feather name="send" size={24} color="black" />
        </TouchableOpacity>
      </View>
      {mediaLoader && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>Uploading Image...</Text>
          </View>
        )}
        {/* <Modal
      visible={modall}
      transparent={true}
      animationType="fade"
      onRequestClose={setModall(false)}
    >
      <View style={styles.photomodalContainer}>
        <View style={styles.photomodalContent}>
          <Image source={{uri:myimage}} style={styles.photoimage} />
          <TouchableOpacity style={styles.photocloseButton} onPress={{}}>
           
            <Text style={styles.photocloseButtonText}>X</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal> */}
    {modall && (
        <View>
          <Modal animationType="slide" transparent={true} visible={modall} onRequestClose={()=>setModall(false)}>
          <View style={styles.photomodalContainer}>
        <View style={styles.photomodalContent}>
        <TouchableOpacity style={styles.photocloseButton} onPress={()=>setModall(false)}>
           
        <MaterialIcons name="cancel" size={30} color="black" />
         </TouchableOpacity>
          <Image source={{uri:myimage}} style={styles.photoimage} />


         
        </View>
      </View>
          </Modal>
        </View>)}
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  messagesList: {
    padding: 10,
  },
  messageContainer: {
    flexWrap: 'wrap',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    width: '50%',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  messageText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    marginRight: 10,
  },
  messageTimestamp: {
    fontSize: 10,
    color: '#777777',
   alignSelf:"flex-end"
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  sendButton: {
    // backgroundColor: '#2196F3',
    paddingHorizontal: 5,
    paddingVertical: 4,
    // borderRadius: 5,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    backgroundColor:"#87CEEB"
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },

  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "white",
    fontSize: 16,
    marginTop: 10,
  },
  // messageText: {
  //   fontSize: 16,
  //   fontWeight: '400',
  //   marginRight: 10,
  // },
  // userMessageText: {
  //   color: 'black',
  // },
  // otherMessageText: {
  //   color: 'black',
  // },
  photomodalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  
  },
  photomodalContent: {
    width: '92%',
    height:"50%",
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
   
  },
  photoimage: {
    width: '100%',
    height: 300, // Set your desired image height
    resizeMode: 'cover',
    marginBottom: 10,
  },
  photocloseButton: {
   alignItems:"flex-end",
   marginRight:10
  },
  photocloseButtonText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'black',
  },


});
// NnwxPU
// wW4jOASQR5S85jnFGoucQ054sCG2