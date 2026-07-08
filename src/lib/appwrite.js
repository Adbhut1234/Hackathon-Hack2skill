import { Client, Databases, Storage, ID, Query } from 'appwrite';

const ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_ID;

// Check if credentials are fully configured and NOT using placeholders
export const isAppwriteConfigured = () => {
  return (
    !!ENDPOINT &&
    !!PROJECT_ID &&
    PROJECT_ID !== 'your_appwrite_project_id_here' &&
    !!DATABASE_ID &&
    DATABASE_ID !== 'your_appwrite_database_id_here' &&
    !!COLLECTION_ID &&
    COLLECTION_ID !== 'your_appwrite_collection_id_here'
  );
};

let client = null;
let databases = null;
let storage = null;

if (isAppwriteConfigured()) {
  client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID);
  databases = new Databases(client);
  
  if (BUCKET_ID && BUCKET_ID !== 'your_appwrite_bucket_id_here') {
    storage = new Storage(client);
  }
} else {
  console.warn(
    "Appwrite is NOT configured. The app will fall back to using LocalStorage and mock data. Please configure your .env file."
  );
}

// Convert Base64 (from image upload) to standard File object for Appwrite Storage
function base64ToFile(base64String, filename = 'submission_photo.jpg') {
  if (!base64String.includes(',')) {
    // If it's not a standard data URL, try to mock it or return null
    return null;
  }
  const arr = base64String.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

/**
 * Upload base64 image string to Appwrite Storage and return its public URL
 */
export async function uploadPhoto(base64String) {
  if (!isAppwriteConfigured() || !storage) {
    console.log("Appwrite Storage not configured; returning raw base64 data");
    return base64String;
  }

  try {
    const fileObj = base64ToFile(base64String);
    if (!fileObj) return base64String;

    const file = await storage.createFile(BUCKET_ID, ID.unique(), fileObj);
    
    // Construct the public preview URL
    const fileUrl = `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file.$id}/view?project=${PROJECT_ID}`;
    return fileUrl;
  } catch (error) {
    console.error("Appwrite Storage upload failed, falling back to base64:", error);
    return base64String;
  }
}

/**
 * Fetch complaints from Appwrite database. Falls back to localStorage.
 */
export async function fetchComplaints() {
  if (!isAppwriteConfigured()) {
    return null; // Signals main state to fall back
  }

  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [Query.orderDesc('$createdAt'), Query.limit(100)]
    );
    
    // Map Appwrite attributes to frontend object structure
    return response.documents.map(doc => ({
      id: doc.$id,
      lat: doc.lat,
      lng: doc.lng,
      category: doc.category,
      translation: doc.translation,
      originalText: doc.originalText,
      language: doc.language,
      priority: doc.priority,
      priorityReason: doc.priorityReason,
      date: doc.date || doc.$createdAt,
      status: doc.status || 'Pending',
      source: doc.source || 'Portal',
      photo: doc.photo || null
    }));
  } catch (error) {
    console.error("Appwrite listDocuments failed:", error);
    throw error;
  }
}

/**
 * Create complaint in Appwrite Database.
 */
export async function createComplaint(complaint) {
  if (!isAppwriteConfigured()) {
    return null;
  }

  // Upload photo to storage if it is a base64 string
  let photoUrl = complaint.photo;
  if (photoUrl && photoUrl.startsWith('data:image')) {
    photoUrl = await uploadPhoto(photoUrl);
  }

  const documentData = {
    lat: parseFloat(complaint.lat),
    lng: parseFloat(complaint.lng),
    category: complaint.category,
    translation: complaint.translation,
    originalText: complaint.originalText || complaint.translation,
    language: complaint.language || 'English',
    priority: complaint.priority,
    priorityReason: complaint.priorityReason || '',
    date: complaint.date || new Date().toISOString(),
    status: complaint.status || 'Pending',
    source: complaint.source || 'Portal',
    photo: photoUrl || ''
  };

  try {
    const doc = await databases.createDocument(
      DATABASE_ID,
      COLLECTION_ID,
      ID.unique(),
      documentData
    );
    
    return {
      id: doc.$id,
      ...documentData
    };
  } catch (error) {
    console.error("Appwrite createDocument failed:", error);
    throw error;
  }
}

/**
 * Listen to real-time additions (optional, but highly awesome for demo!)
 */
export function subscribeToComplaints(callback) {
  if (!isAppwriteConfigured() || !client) return null;

  try {
    const channel = `databases.${DATABASE_ID}.collections.${COLLECTION_ID}.documents`;
    return client.subscribe(channel, response => {
      if (response.events.includes(`${channel}.*.create`)) {
        const doc = response.payload;
        callback({
          id: doc.$id,
          lat: doc.lat,
          lng: doc.lng,
          category: doc.category,
          translation: doc.translation,
          originalText: doc.originalText,
          language: doc.language,
          priority: doc.priority,
          priorityReason: doc.priorityReason,
          date: doc.date || doc.$createdAt,
          status: doc.status || 'Pending',
          source: doc.source || 'Portal',
          photo: doc.photo || null
        });
      }
    });
  } catch (error) {
    console.error("Appwrite subscription failed:", error);
    return null;
  }
}
