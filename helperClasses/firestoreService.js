import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js'
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js'
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, GeoPoint, updateDoc, arrayUnion, addDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-storage.js'

const firebaseConfig = {
  apiKey: "AIzaSyDkJbt9ewyYvPLb5LJDpDAFIaIvva9iaec",
  authDomain: "freshpicks-da3ef.firebaseapp.com",
  projectId: "freshpicks-da3ef",
  storageBucket: "freshpicks-da3ef.appspot.com",
  messagingSenderId: "610098249496",
  appId: "1:610098249496:web:0475aa3b2c11a9f049686d",
  measurementId: "G-82WSX2M2V3"
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

export const getDataFromFirestore = async (collectionName, documentId) => {
  try {
    const docRef = doc(db, collectionName, documentId)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return docSnap.data()
    } else {
      console.log('Document does not exist.')
      return null
    }
  } catch (error) {
    console.error('Error getting document:', error)
    return null
  }
}

export const setDataToFirestore = async (collectionName, documentId, data) => {

  const docRef = doc(db, collectionName, documentId)

  try {
    await setDoc(docRef, data)
    console.log('Document successfully written!')
    return true
  } catch (error) {
    console.error('Error adding document: ', error)
    return false
  }
}

export const setDataToCollection = async (collectionName, data) => {

  const collectionRef = collection(db, collectionName)
  try {
    const newDocRef = await addDoc(collectionRef, data)
    console.log("Document added with ID: " + newDocRef.id)
    return true
  } catch (error) {
    console.error("Error adding document: " + error)
    return false
  }
}

export const getCollectionData = async (collectionName) => {
  const collectionRef = collection(db, collectionName)
  const dataArray = []

  // Return the promise chain
  return getDocs(collectionRef)
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const dataWithId = {
          id: doc.id,
          ...doc.data()
        }
        dataArray.push(dataWithId)
      })
      return dataArray
    })
    .catch((error) => {
      console.error('Error getting documents: ', error)
      return null
    })
}


export const uploadFileToStorage = async (file, storagePath) => {
  try {
    const storageRef = ref(storage, storagePath) 
    await uploadBytes(storageRef, file) 

    console.log('File uploaded to Firebase Storage successfully.')
    return true
  } catch (error) {
    console.error('Error uploading file to Firebase Storage:', error)
    return false
  }
}

export const getDownloadURLForFile = async (storagePath) => {
  try {
    const storageRef = ref(storage, storagePath) // Create a reference to the storage path
    const downloadURL = await getDownloadURL(storageRef) // Get the download URL for the file
    return downloadURL
  } catch (error) {
    console.error('Error getting download URL:', error)
    return null
  }
}

export const arrayUpdate = async (collectionName, document_ID, data, arrName) => {
  const docRef = doc(db, collectionName, document_ID)

  try {
    const docSnapshot = await getDoc(docRef)

    if (docSnapshot.exists()) {
      await updateDoc(docRef, {
        Markets: arrayUnion(...data.Markets),
        ...data,
      })

      return true
    } else {
      console.error("Document not found.")
      return false
    }
  } catch (error) {
    console.error("Error fetching document data: " + error.message)
    return false
  }
}

export const deleteDocument = async (collectionName, documentId) => {
  // Create a reference to the document
  const docRef = doc(db, collectionName, documentId)

  // Delete the document
  try {
    await deleteDoc(docRef);
    console.log("Document successfully deleted!");
    return true;
} catch (error) {
    console.error("Error deleting document: ", error);
    return false;
}
}


export { auth, db, doc, setDoc, ref, storage, getDownloadURL, GeoPoint, collection, getDocs }