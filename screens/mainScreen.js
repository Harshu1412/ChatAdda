import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  arrayUnion,
  query,
  where,
  deleteDoc,
  arrayRemove,
} from "firebase/firestore";
import * as Animatable from "react-native-animatable";
import * as ImagePicker from "expo-image-picker";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { AntDesign, Entypo } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { db } from "../App";
const mainback = require("../assets/mainback1.jpg");

export default function MainScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [secretCode, setSecretCode] = useState("");
  const [groupName, setGroupName] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [profilepic, setProfilepic] = useState("https://cdn-icons-png.flaticon.com/512/3237/3237472.png");
  const [user, setUser] = useState();
  const [groups, setGroups] = useState([]);
  const [gRoupName, setGRoupName] = useState("");
  const [joiNModalVisible, setJoiNModalVisible] = useState(false);
  const [groupSecret, setGroupSecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [addLoader, setAddLoader] = useState(false);
  const [nameError,setNameError]=useState(false);
  const [joinError,setJoinError]=useState(false)

  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      const userData = await getUserData();
      console.log("^^^^^^^^^^^^", userData)
      if (userData) {
        setUser(userData);
        loadUserGroups(userData.uid);
      }
    };
    console.log(">>>>>>>", user)
    fetchData();
  }, []);

  useEffect(() => {

    loadUserGroups();
  }, [user]);

  const handleChoosePhoto = async () => {
    setModalVisible(!modalVisible);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.cancelled) {
        const { uri } = result.assets[0];
        setImage(uri);
        console.log("Image picked successfully", uri);
        uploadImage(uri);
        setLoading(true);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (userData !== null) {
        const parsedData = JSON.parse(userData);
     
        return parsedData;
      }
    } catch (error) {
      console.log(error);
    }

  };
  const handleTakePhoto = async () => {
    setModalVisible(!modalVisible);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status === "granted") {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!result.cancelled) {
        const { uri } = result.assets[0];
        setImage(uri);
        console.log("Image picked successfully", uri);
        uploadImage(uri);
      }
    } else {
      alert("Camera permission not granted");
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
      const downloadURL = await getDownloadURL(storageRef);
      setProfilepic(downloadURL);
      updateProfilePic(downloadURL);

    } catch (error) {
      console.log(error);
    }
  };

  const updateProfilePic = async (url) => {
    try {
      const userRef = doc(db, "users", user.user.uid);
      await updateDoc(userRef, {
        photoUrl: url,
      });
      console.log("Profile picture updated successfully");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  const createGroup = async () => {
    if(groupName===""){
      setNameError(true)
    }
    else {
      setNameError(false)
    setAddLoader(true);
    try {
      const groupRef = collection(db, "groups");
      const groupDoc = await addDoc(groupRef, {
        name: groupName,
        secretCode: generateSecretCode(),
        creator: user.user.uid,
        members: [user.user.uid],
      });
      const groupId = groupDoc.id;
      console.log("Group created successfully", groupId);
      const userRef = doc(db, "users", user.user.uid);
      await updateDoc(userRef, {
        groups: arrayUnion(groupId),
      })
      setGroupName("");
      setSecretCode("");
      loadUserGroups();
      setModalVisible(false);
      setJoinModalVisible(false)
      setAddLoader(false)
    } catch (error) {
      console.log(error);
    }
  }
  };
  const joinGroup = async () => {
    if(secretCode==="")
    {
      setJoinError(true)
    }
    else{
      setJoinError(false)
    
    setAddLoader(true);
    try {
      const groupRef = collection(db, "groups");
      const querySnapshot = await getDocs(
        query(groupRef, where("secretCode", "==", secretCode))
      );
      if (querySnapshot.docs.length === 0) {
        console.log("Invalid secret code or group does not exist");
        setAddLoader(false)
        setJoiNModalVisible(false)
        setSecretCode("");
        return;
      }
      const groupDoc = querySnapshot.docs[0];
      const groupId = groupDoc.id;
      const userRef = doc(db, "users", user.user.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        await updateDoc(userRef, {
          groups: arrayUnion(groupId),
        });
      } else {
        await setDoc(userRef, {
          groups: [groupId],
        });
      }
      setSecretCode("");
      setJoiNModalVisible(false)
      loadUserGroups();
      setAddLoader(false)
    } catch (error) {
      console.log(error);
    }
  }
  };
  const generateSecretCode = () => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters.charAt(randomIndex);
    }
    return code;
  };

  const loadUserGroups = async () => {
     setAddLoader(true)
    try {
      const userDatA = await getUserData();
      const userRef = doc(db, "users", userDatA.user.uid);
      const userSnapshot = await getDoc(userRef);
      const userData = userSnapshot.data();

      const userGroups = userData.groups || [];

      const groupsData = await Promise.all(
        userGroups.map(async (groupId) => {
          const groupRef = doc(db, "groups", groupId);
          const groupSnapshot = await getDoc(groupRef);
          console.log("Group snapshot:", groupSnapshot);

          if (groupSnapshot.exists()) {
            const groupData = groupSnapshot.data();
            console.log("Group data:", groupData);

            return { id: groupId, name: groupData.name, groupSecret: groupData.secretCode, creator: groupData.creator };
          } else {
            console.log(`Group with ID ${groupId} does not exist.`);
            return null;
          }
        })
      );
      const validGroupsData = groupsData.filter((group) => group !== null);
      console.log("User groups loaded successfully", validGroupsData);
      setGroups(validGroupsData);
      setIsLoading(false);
      setAddLoader(false)
    } catch (error) {
      console.log(error);
      setAddLoader(false)
    }
    setIsLoading(false);
    setAddLoader(false)
  };



  const deleteGroup = async (groupId) => {
    setAddLoader(true);
    try {
      await deleteDoc(doc(db, "groups", groupId));
  
      const userRef = doc(db, "users", user.user.uid);
      await updateDoc(userRef, {
        groups: arrayRemove(groupId),
      });
  
      
      loadUserGroups();
      
    } catch (error) {
      console.log(error);
    }
  };
  

  const RenderGroups = () => {
    return groups.map((group) =>
      <ScrollView>
        <TouchableOpacity
          key={group.id}
          style={{ marginBottom:5,borderWidth:1,backgroundColor: "white", width: "50%", borderRadius: 10, height: 50, flexDirection: "row", alignItems: "center",width:"80%" }}
          onPress={() => navigation.navigate("GroupChat", { groupId: group.id, user, group })}
        >
          <MaterialIcons name="groups" size={24} color="black" style={{ marginHorizontal: 10 }} />
          <Text style={styles.groupName}>{group.name}</Text>

          <TouchableOpacity style={{ position:"absolute",right:10}} onPress={() => deleteGroup(group.id)}>
          <AntDesign name="delete" size={24} color="black" />
      </TouchableOpacity>
        </TouchableOpacity>
        
      </ScrollView>
    );
  };
  const handleLogout = () => {
    AsyncStorage.removeItem('userData');
    navigation.replace("login")
    console.log("userLogout")
    setUser(null);
  };
  return (
    <>
      {addLoader && (
        <View>
          <Modal animationType="slide" transparent={true} visible={addLoader}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <ActivityIndicator size={40} />
              </View>
            </View>
          </Modal>
        </View>
      )}
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
      <View style={styles.container}>
        <Image source={mainback} style={styles.background} />
        <View style={styles.header}>
          <Text style={styles.headerText}>
            Welcome, {user ? user.user.displayName : "Guest"}
          </Text>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Image source={{ uri: profilepic }} style={styles.profilePic} />
          </TouchableOpacity>
        </View>
        <View style={{ width: "90%", flexDirection: "row", justifyContent: "space-between", marginTop: 10, alignSelf: "center" }}>
          <TouchableOpacity
            style={styles.createGroupButton}
            onPress={() => setJoinModalVisible(true)}
          >
            <Text style={styles.createGroupButtonText}>Create Group</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.createGroupButton}
            onPress={() => setJoiNModalVisible(true)}
          >
            <Text style={styles.createGroupButtonText}>Join Group</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.content}>

          <View >


            <Modal
              animationType="slide"
              transparent={true}
              visible={joiNModalVisible}
              onRequestClose={() => setJoiNModalVisible(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Join a Group</Text>
                  <TextInput
                    style={styles.input}
                    width={250}
                    placeholder="Enter Secret Code"
                    value={secretCode}
                    onChangeText={(text) => setSecretCode(text)}
                  />
                  {joinError && (<Text style={{color:"red"}}>Enter secret code</Text>)}
                  <TouchableOpacity
                    style={styles.createButton}
                    onPress={joinGroup}
                  >
                    <Text style={styles.createButtonText}>Join Group</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setJoiNModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>
          <View style={styles.groupContainer}>

            <Text style={styles.groupsTitle}>Your Groups</Text>
            <ScrollView>

              <RenderGroups />
            </ScrollView>
          </View>

        </View>


        <View style={{alignSelf:"center",width:"100%",alignItems:"center"
      }}>
          <TouchableOpacity
            style={styles.createGroupButton}
            onPress={handleLogout}
          >
            <Text style={styles.createGroupButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>


        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Choose an Option</Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleChoosePhoto}
              >
                <Text style={styles.modalButtonText}>Choose from Library</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleTakePhoto}
              >
                <Text style={styles.modalButtonText}>Take a Photo</Text>
              </TouchableOpacity>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
        <Modal
          animationType="slide"
          transparent={true}
          visible={joinModalVisible}
          onRequestClose={() => setJoinModalVisible(false)}
        >
          <View style={styles.joinModalContainer}>
            <View style={styles.joinModalContent}>
              <Text style={styles.joinModalTitle}>Create a Group</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Group Name"
                  value={groupName}
                  width={250}
                  onChangeText={(text) => {
                    setGroupName(text), setGRoupName(text);
                  }}
                />
              </View>
              {nameError && (<Text style={{color:"red"}}>Enter a valid group name</Text>)}
              <TouchableOpacity style={styles.createButton} onPress={createGroup}>
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
              <Pressable
                style={[styles.createButton, styles.cancelButton]}
                onPress={() => setJoinModalVisible(false)}
              >
                <Text style={styles.createButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>Uploading Image...</Text>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,


    backgroundColor: "#fff",
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    width: "100%",
    height: 80,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  headerText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  content: {
    flex: 1,

    paddingTop: 20,
    paddingBottom: 20,
  },

  groupsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  groupContainer: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    // backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 10,
    // alignItems: "center",
  },
  groupName: {
    fontSize: 16,
    fontWeight: "bold",

  },
  createGroupButton: {
    width: "40%",
    height: 40,
    backgroundColor: "#47b5d1",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  createGroupButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  modalButton: {
    width: 200,
    height: 40,
    backgroundColor: "#47b5d1",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "red",
    width:150,
    height:40,
    justifyContent:"center",
    alignItems:"center",
    borderRadius:20
  
  },
  joinModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  joinModalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  joinModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginBottom:15
  },
  createButton: {
    width: 200,
    height: 40,
    backgroundColor: "#47b5d1",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
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
});
