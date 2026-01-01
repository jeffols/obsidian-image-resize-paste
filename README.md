# Image Resize on Paste - Obsidian Plugin

Automatically resizes images when pasted into Obsidian notes to save disk space.

## Features

- **Automatic resize on paste**: Resizes images as you paste them into notes
- **Batch resize existing images**: Process all images in your vault with a single command
- Maintains aspect ratio
- Preserves image format (PNG, JPEG, WebP, etc.)
- Shows file size savings notification
- Works seamlessly with Obsidian's attachment folder settings
- Zero external dependencies (uses browser Canvas API)

## How It Works

When you paste an image into an Obsidian note:
1. The plugin intercepts the paste event
2. If the image is larger than 1920x1080, it resizes it while maintaining aspect ratio
3. The resized image is saved to your vault's attachment folder
4. A markdown link is automatically inserted at your cursor
5. A notification shows the file size reduction

## Settings

This plugin uses fixed settings for simplicity:
- **Maximum dimensions**: 1920x1080 (Full HD)
- **JPEG/WebP quality**: 0.92 (high quality with good compression)
- **PNG**: Lossless (quality setting doesn't apply)

## Installation

### Manual Installation

1. Download the latest release files:
   - `main.js`
   - `manifest.json`
2. Create a folder in your vault's `.obsidian/plugins/` directory called `image-resize-paste`
3. Copy the files into this folder
4. Reload Obsidian
5. Go to Settings → Community plugins
6. Enable "Image Resize on Paste"

### Building from Source

1. Clone this repository into your vault's `.obsidian/plugins/` folder:
   ```bash
   cd /path/to/vault/.obsidian/plugins
   git clone https://github.com/yourusername/obsidian-image-resize-paste.git
   cd obsidian-image-resize-paste
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the plugin:
   ```bash
   npm run build
   ```

4. Reload Obsidian and enable the plugin in Settings → Community plugins

## Development

### Setup

```bash
npm install
```

### Build

```bash
npm run build
```

### Development Mode (with auto-rebuild)

```bash
npm run dev
```

This will watch for changes and automatically rebuild the plugin.

## Usage

### Automatic Resize on Paste

Simply paste images as you normally would in Obsidian. The plugin automatically handles the resizing.

**Examples:**
- Paste a 4000x3000 screenshot → Automatically resized to 1920x1440
- Paste a 800x600 image → Kept at original size (no upscaling)
- Paste a 1920x1080 image → Kept at original size

### Batch Resize Existing Images

To resize all existing images in your vault:

1. Open the command palette (Cmd/Ctrl + P)
2. Type "Resize all images in vault"
3. Press Enter
4. Review the confirmation dialog showing how many images were found
5. Click "Resize images" to proceed

The command will:
- Scan your entire vault for image files (PNG, JPEG, WebP, GIF, BMP)
- Skip images already smaller than 1920x1080
- Replace originals with resized versions (make a backup first!)
- Show progress notification while processing
- Display a summary with total space saved

**Important:** Make sure to backup your vault before running batch resize, as it replaces original images!

## Technical Details

- Uses browser Canvas API for image processing (no external libraries needed)
- Hooks into Obsidian's `editor-paste` event
- Respects Obsidian's attachment folder settings
- Cross-platform compatible (macOS, Windows, Linux)

## Compatibility

- Requires Obsidian v0.15.0 or higher
- Works on desktop platforms (macOS, Windows, Linux)
- May work on mobile but not extensively tested

## License

MIT License - see LICENSE file for details

## Support

If you encounter any issues or have suggestions, please file an issue on GitHub.

## Credits

Built with the [Obsidian API](https://docs.obsidian.md/) and inspired by the need to save disk space when pasting large screenshots.
