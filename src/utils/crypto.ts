import CryptoJS from "crypto-js";

const SECRET_KEY = "cctv_master_secure_key_2026"; // In production, this should be an environment variable

/**
 * Encrypts an object or string into a secure AES string
 */
export const encryptData = (data: any): string => {
  try {
    const jsonString = typeof data === "string" ? data : JSON.stringify(data);
    return CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();
  } catch (error) {
    console.error("Encryption failed:", error);
    return "";
  }
};

/**
 * Decrypts a secure AES string back into its original format
 */
export const decryptData = (encryptedStr: string): any => {
  if (!encryptedStr) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedStr, SECRET_KEY);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedString) return null;
    
    // Try to parse as JSON, if it fails, return as string
    try {
      return JSON.parse(decryptedString);
    } catch {
      return decryptedString;
    }
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
};
