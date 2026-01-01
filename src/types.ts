/**
 * Type definitions for the Image Resize on Paste plugin
 */

export interface ResizeConfig {
	maxWidth: number;
	maxHeight: number;
	quality: number;
}

export interface ImageInfo {
	originalSize: number;
	resizedSize: number;
	savings: number;
	width: number;
	height: number;
}
