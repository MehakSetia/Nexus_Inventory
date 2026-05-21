/**
 * imageStore.js — stores product images in localStorage (compressed base64)
 * Key: nexus_img_<productId>
 */
const PREFIX = 'nexus_img_';

export function saveProductImage(productId, file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 640;
        const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
        const canvas = document.createElement('canvas');
        canvas.width  = Math.round(img.width  * ratio);
        canvas.height = Math.round(img.height * ratio);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        try {
          const url = canvas.toDataURL('image/jpeg', 0.8);
          localStorage.setItem(PREFIX + productId, url);
          resolve(url);
        } catch { reject(new Error('Image too large to store.')); }
      };
      img.onerror = () => reject(new Error('Cannot read image.'));
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function getProductImage(productId) {
  return localStorage.getItem(PREFIX + productId) || null;
}

export function deleteProductImage(productId) {
  localStorage.removeItem(PREFIX + productId);
}
