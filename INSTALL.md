# Installation Instructions

## Quick Install

The plugin files are ready in the `release/image-resize-paste/` directory.

### Method 1: Manual Installation (Recommended)

1. **Locate your Obsidian vault's plugins folder:**
   ```
   /path/to/your/vault/.obsidian/plugins/
   ```

2. **Copy the plugin folder:**
   ```bash
   cp -r release/image-resize-paste /path/to/your/vault/.obsidian/plugins/
   ```

3. **Reload Obsidian:**
   - Close and reopen Obsidian, OR
   - Open command palette (Cmd+P) → type "Reload" → select "Reload app without saving"

4. **Enable the plugin:**
   - Settings → Community plugins
   - Find "Image Resize on Paste"
   - Toggle it on

### Method 2: Using the Install Script

Run the provided installation script:

```bash
./install.sh /path/to/your/vault
```

Example:
```bash
./install.sh ~/Documents/MyVault
```

Then reload Obsidian and enable the plugin in Settings.

## Verify Installation

After enabling the plugin:

1. **Test paste resize:** Copy a large image and paste it into a note
2. **Test batch resize:** Open command palette (Cmd+P) → "Resize all images in vault"

## Uninstall

To remove the plugin:

```bash
rm -rf /path/to/your/vault/.obsidian/plugins/image-resize-paste
```

Then reload Obsidian.
