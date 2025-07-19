// Utility functions to convert files to base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      if (reader.result) {
        // Remove the data:image/...;base64, prefix to get just the base64 string
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsDataURL(file);
  });
};

export const filesToBase64 = async (files: File[]): Promise<string[]> => {
  try {
    const base64Promises = files.map(file => fileToBase64(file));
    return await Promise.all(base64Promises);
  } catch (error) {
    throw new Error(`Failed to convert files to base64: ${error}`);
  }
};

// Alternative version that returns the full data URL (with prefix)
export const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      if (reader.result) {
        resolve(reader.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsDataURL(file);
  });
};