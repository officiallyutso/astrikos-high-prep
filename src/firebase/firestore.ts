import { db } from './config';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

// Create a new user document in Firestore
export async function createUserDocument(userId: string, data: any) {
  try {
    await setDoc(doc(db, 'users', userId), {
      ...data,
      createdAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error creating user document:', error);
    return false;
  }
}

// Get a user document from Firestore
export async function getUserDocument(userId: string) {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log('No such document!');
      return null;
    }
  } catch (error) {
    console.error('Error getting user document:', error);
    return null;
  }
}

// Update a user document in Firestore
export async function updateUserDocument(userId: string, data: any) {
  try {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, data);
    return true;
  } catch (error) {
    console.error('Error updating user document:', error);
    return false;
  }
}