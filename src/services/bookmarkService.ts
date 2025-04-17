import { db } from '../firebase/config';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, setDoc } from 'firebase/firestore';
import { CityData, getCityDetails } from './dataService';

// Get bookmarked cities IDs for a user
export async function getBookmarkedCities(userId: string): Promise<string[]> {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists() && userDoc.data().bookmarkedCities) {
      return userDoc.data().bookmarkedCities;
    }
    
    // If no bookmarks exist, create empty array
    await setDoc(userDocRef, { bookmarkedCities: [] }, { merge: true });
    return [];
  } catch (error) {
    console.error('Error getting bookmarked cities:', error);
    return [];
  }
}

// Add a city to bookmarks
export async function addBookmarkedCity(userId: string, cityId: string): Promise<boolean> {
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      bookmarkedCities: arrayUnion(cityId)
    });
    return true;
  } catch (error) {
    console.error('Error adding bookmarked city:', error);
    return false;
  }
}

// Remove a city from bookmarks
export async function removeBookmarkedCity(userId: string, cityId: string): Promise<boolean> {
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      bookmarkedCities: arrayRemove(cityId)
    });
    return true;
  } catch (error) {
    console.error('Error removing bookmarked city:', error);
    return false;
  }
}

// Get full data for all bookmarked cities
export async function getBookmarkedCitiesData(userId: string): Promise<CityData[]> {
  try {
    const bookmarkedIds = await getBookmarkedCities(userId);
    const citiesData: CityData[] = [];
    
    for (const cityId of bookmarkedIds) {
      const cityData = await getCityDetails(cityId);
      if (cityData) {
        citiesData.push(cityData);
      }
    }
    
    return citiesData;
  } catch (error) {
    console.error('Error getting bookmarked cities data:', error);
    return [];
  }
}

// Get default cities for new users (top cities by population)
export async function getDefaultCities(count: number = 4): Promise<CityData[]> {
  try {
    const allCities = await getCityDetails('all');
    if (Array.isArray(allCities)) {
      // Sort by population and return top cities
      return allCities
        .sort((a, b) => b.population - a.population)
        .slice(0, count);
    }
    return [];
  } catch (error) {
    console.error('Error getting default cities:', error);
    return [];
  }
}