import { Editor, MarkdownView, Notice, Plugin, TFile, Modal, App } from 'obsidian';
import { resizeImage, getExtensionForMimeType } from './imageResizer';

// Configuration constants
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;
const JPEG_QUALITY = 0.92;

export default class ImageResizePastePlugin extends Plugin {
	async onload() {
		console.log('Loading Image Resize on Paste plugin');

		// Register paste event handler
		this.registerEvent(
			this.app.workspace.on('editor-paste', this.handlePaste.bind(this))
		);

		// Register command to resize all existing images
		this.addCommand({
			id: 'resize-all-images',
			name: 'Resize all images in vault',
			callback: () => this.resizeAllImages()
		});
	}

	onunload() {
		console.log('Unloading Image Resize on Paste plugin');
	}

	private async handlePaste(evt: ClipboardEvent, editor: Editor, view: MarkdownView) {
		// Check if event is already handled by another plugin
		if (evt.defaultPrevented) {
			return;
		}

		// Get clipboard items
		const items = evt.clipboardData?.items;
		if (!items) {
			return;
		}

		// Look for image in clipboard
		let imageFile: File | null = null;

		for (let i = 0; i < items.length; i++) {
			const item = items[i];
			if (item.kind === 'file' && item.type.startsWith('image/')) {
				const file = item.getAsFile();
				if (file) {
					imageFile = file;
					break;
				}
			}
		}

		// If no image found, let default paste behavior happen
		if (!imageFile) {
			return;
		}

		// Prevent default paste behavior since we're handling the image
		evt.preventDefault();

		try {
			// Resize the image
			const resizedBlob = await resizeImage(
				imageFile,
				MAX_WIDTH,
				MAX_HEIGHT,
				JPEG_QUALITY
			);

			// Determine file extension
			const extension = getExtensionForMimeType(imageFile.type);
			const fileName = `pasted-image-${Date.now()}.${extension}`;

			// Get the appropriate path for the attachment
			const attachmentPath = await this.app.vault.getAvailablePathForAttachments(
				fileName,
				view.file.path
			);

			// Convert Blob to ArrayBuffer
			const arrayBuffer = await resizedBlob.arrayBuffer();

			// Write the file to the vault
			await this.app.vault.adapter.writeBinary(attachmentPath, arrayBuffer);

			// Get the file reference
			const file = this.app.vault.getAbstractFileByPath(attachmentPath);

			if (file) {
				// Generate markdown link
				const markdownLink = this.app.fileManager.generateMarkdownLink(
					file,
					view.file.path
				);

				// Insert the link at cursor position
				editor.replaceSelection(markdownLink);

				// Calculate and show size reduction if applicable
				if (resizedBlob.size < imageFile.size) {
					const originalSizeMB = (imageFile.size / 1024 / 1024).toFixed(2);
					const newSizeMB = (resizedBlob.size / 1024 / 1024).toFixed(2);
					const savings = ((1 - resizedBlob.size / imageFile.size) * 100).toFixed(0);

					new Notice(
						`Image resized: ${originalSizeMB}MB → ${newSizeMB}MB (${savings}% smaller)`
					);
				}
			} else {
				new Notice('Failed to get file reference after saving image');
			}
		} catch (error) {
			console.error('Error resizing and pasting image:', error);
			new Notice('Failed to resize image: ' + (error as Error).message);
		}
	}

	private async resizeAllImages() {
		// Get all image files in the vault
		const imageExtensions = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp'];
		const allFiles = this.app.vault.getFiles();
		const imageFiles = allFiles.filter(file => {
			const ext = file.extension.toLowerCase();
			return imageExtensions.includes(ext);
		});

		if (imageFiles.length === 0) {
			new Notice('No images found in vault');
			return;
		}

		// Show confirmation modal
		new ConfirmResizeModal(this.app, imageFiles.length, async () => {
			await this.processAllImages(imageFiles);
		}).open();
	}

	private async processAllImages(imageFiles: TFile[]) {
		let processed = 0;
		let resized = 0;
		let skipped = 0;
		let totalSavings = 0;
		let errors = 0;

		const notice = new Notice('Processing images...', 0);

		for (const file of imageFiles) {
			try {
				// Read the file
				const arrayBuffer = await this.app.vault.adapter.readBinary(file.path);
				const blob = new Blob([arrayBuffer]);
				const originalSize = blob.size;

				// Create a File object from the blob
				const imageFile = new File([blob], file.name, { type: this.getMimeType(file.extension) });

				// Resize the image
				const resizedBlob = await resizeImage(
					imageFile,
					MAX_WIDTH,
					MAX_HEIGHT,
					JPEG_QUALITY
				);

				// Check if image was actually resized (or if it was already small enough)
				if (resizedBlob === blob || resizedBlob.size >= originalSize * 0.95) {
					// Image wasn't resized or savings are minimal, skip it
					skipped++;
				} else {
					// Write the resized image back
					const resizedArrayBuffer = await resizedBlob.arrayBuffer();
					await this.app.vault.adapter.writeBinary(file.path, resizedArrayBuffer);

					resized++;
					totalSavings += (originalSize - resizedBlob.size);
				}

				processed++;
				notice.setMessage(`Processing images: ${processed}/${imageFiles.length}`);
			} catch (error) {
				console.error(`Error processing ${file.path}:`, error);
				errors++;
			}
		}

		notice.hide();

		// Show summary
		const totalSavingsMB = (totalSavings / 1024 / 1024).toFixed(2);
		const summary = [
			`Batch resize complete!`,
			`Resized: ${resized}`,
			`Skipped: ${skipped}`,
			`Errors: ${errors}`,
			`Space saved: ${totalSavingsMB}MB`
		].join('\n');

		new Notice(summary, 10000);
	}

	private getMimeType(extension: string): string {
		const mimeTypes: Record<string, string> = {
			'png': 'image/png',
			'jpg': 'image/jpeg',
			'jpeg': 'image/jpeg',
			'webp': 'image/webp',
			'gif': 'image/gif',
			'bmp': 'image/bmp',
		};
		return mimeTypes[extension.toLowerCase()] || 'image/png';
	}
}

class ConfirmResizeModal extends Modal {
	private imageCount: number;
	private onConfirm: () => void;

	constructor(app: App, imageCount: number, onConfirm: () => void) {
		super(app);
		this.imageCount = imageCount;
		this.onConfirm = onConfirm;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl('h2', { text: 'Resize all images?' });
		contentEl.createEl('p', {
			text: `Found ${this.imageCount} image(s) in your vault.`
		});
		contentEl.createEl('p', {
			text: 'Images larger than 1920x1080 will be resized and replaced. This cannot be undone.'
		});
		contentEl.createEl('p', {
			text: 'Make sure you have a backup of your vault before proceeding!',
			cls: 'mod-warning'
		});

		const buttonContainer = contentEl.createDiv({ cls: 'modal-button-container' });

		const confirmButton = buttonContainer.createEl('button', {
			text: 'Resize images',
			cls: 'mod-cta'
		});
		confirmButton.addEventListener('click', () => {
			this.close();
			this.onConfirm();
		});

		const cancelButton = buttonContainer.createEl('button', {
			text: 'Cancel'
		});
		cancelButton.addEventListener('click', () => {
			this.close();
		});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
