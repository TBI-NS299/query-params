// utils/crypto-query.ts
// import CryptoJS from 'crypto-js';

// Use NEXT_PUBLIC_ if you must decrypt on the client side
const SECRET_KEY = process.env.NEXT_PUBLIC_QUERY_SECRET || 'fallback-secret-key';

export const encrypt = (data: any): string => {
  // const cipherText = CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
  // return encodeURIComponent(cipherText);
  const jsonString = JSON.stringify(data);
  return Buffer.from(jsonString).toString('base64');
};

export const decrypt = <T>(cipherText: string): T | null => {
  // try {
  //   const decoded = decodeURIComponent(cipherText);
  //   const bytes = CryptoJS.AES.decrypt(decoded, SECRET_KEY);
  //   return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  // } catch (e) {
  //   return null;
  // }
  try {
    const jsonString = Buffer.from(cipherText, 'base64').toString('utf-8');
    return JSON.parse(jsonString);
  } catch (e) {
    return null;
  }
};
