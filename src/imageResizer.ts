/**
 * Resizes an image file to fit within maximum dimensions while maintaining aspect ratio
 * @param file The image file to resize
 * @param maxWidth Maximum width in pixels
 * @param maxHeight Maximum height in pixels
 * @param quality JPEG/WebP quality (0-1), ignored for PNG
 * @returns Promise resolving to a Blob containing the resized image
 */
export async function resizeImage(
	file: File,
	maxWidth: number,
	maxHeight: number,
	quality: number
): Promise<Blob> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		const objectUrl = URL.createObjectURL(file);

		img.onload = () => {
			try {
				// Clean up object URL
				URL.revokeObjectURL(objectUrl);

				// Calculate new dimensions maintaining aspect ratio
				const ratio = Math.min(
					maxWidth / img.width,
					maxHeight / img.height,
					1 // Don't upscale images smaller than max dimensions
				);

				const newWidth = Math.round(img.width * ratio);
				const newHeight = Math.round(img.height * ratio);

				// If image is already smaller than max dimensions, return original
				if (ratio === 1) {
					resolve(file);
					return;
				}

				// Create canvas with new dimensions
				const canvas = document.createElement('canvas');
				canvas.width = newWidth;
				canvas.height = newHeight;

				const ctx = canvas.getContext('2d');
				if (!ctx) {
					reject(new Error('Failed to get canvas context'));
					return;
				}

				// Enable better image smoothing
				ctx.imageSmoothingEnabled = true;
				ctx.imageSmoothingQuality = 'high';

				// Draw resized image
				ctx.drawImage(img, 0, 0, newWidth, newHeight);

				// Determine output format based on original file type
				let outputType = file.type;

				// Use PNG for unknown or unsupported formats
				if (!outputType.startsWith('image/')) {
					outputType = 'image/png';
				}

				// Convert to Blob
				canvas.toBlob(
					(blob) => {
						if (blob) {
							resolve(blob);
						} else {
							reject(new Error('Failed to create blob from canvas'));
						}
					},
					outputType,
					quality
				);
			} catch (error) {
				reject(error);
			}
		};

		img.onerror = () => {
			URL.revokeObjectURL(objectUrl);
			reject(new Error('Failed to load image'));
		};

		img.src = objectUrl;
	});
}

/**
 * Gets the file extension for a given MIME type
 */
export function getExtensionForMimeType(mimeType: string): string {
	const map: Record<string, string> = {
		'image/png': 'png',
		'image/jpeg': 'jpg',
		'image/jpg': 'jpg',
		'image/webp': 'webp',
		'image/gif': 'gif',
		'image/svg+xml': 'svg',
		'image/bmp': 'bmp',
	};

	return map[mimeType] || 'png';
}
