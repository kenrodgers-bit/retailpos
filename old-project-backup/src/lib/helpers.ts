export function formatCurrency(value: number, currency = 'KES') {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(value);
}

export function formatDateTime(value: string | Date) {
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}

export function generateReceiptNumber() {
  const now = new Date();
  return `R-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${Math.floor(Math.random() * 9000 + 1000)}`;
}

export async function compressImage(file: File): Promise<{ data: string; type: string }> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Invalid image file');
  }

  const imageBitmap = await createImageBitmap(file);
  const maxDimension = 1200;
  const scale = Math.min(1, maxDimension / Math.max(imageBitmap.width, imageBitmap.height));
  const width = Math.round(imageBitmap.width * scale);
  const height = Math.round(imageBitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Unable to process image');

  ctx.drawImage(imageBitmap, 0, 0, width, height);
  const quality = 0.8;
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
  if (!blob) throw new Error('Unable to compress image');

  const data = await blobToBase64(blob);
  return { data, type: 'image/jpeg' };
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Unable to read image')); 
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function getImageUrl(imageData: string | null, imageType: string | null) {
  if (!imageData || !imageType) return null;
  if (imageData.startsWith('data:')) return imageData;
  return `data:${imageType};base64,${imageData}`;
}
