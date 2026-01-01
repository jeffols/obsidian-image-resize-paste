#!/bin/bash

# Installation script for Image Resize on Paste plugin

if [ -z "$1" ]; then
    echo "Usage: ./install.sh /path/to/your/vault"
    echo ""
    echo "Example: ./install.sh ~/Documents/MyVault"
    exit 1
fi

VAULT_PATH="$1"
PLUGIN_DIR="$VAULT_PATH/.obsidian/plugins/image-resize-paste"

# Check if vault path exists
if [ ! -d "$VAULT_PATH" ]; then
    echo "Error: Vault path does not exist: $VAULT_PATH"
    exit 1
fi

# Create .obsidian/plugins directory if it doesn't exist
if [ ! -d "$VAULT_PATH/.obsidian/plugins" ]; then
    echo "Creating plugins directory..."
    mkdir -p "$VAULT_PATH/.obsidian/plugins"
fi

# Check if plugin already exists
if [ -d "$PLUGIN_DIR" ]; then
    echo "Plugin directory already exists. Removing old version..."
    rm -rf "$PLUGIN_DIR"
fi

# Copy plugin files
echo "Installing plugin to: $PLUGIN_DIR"
cp -r release/image-resize-paste "$VAULT_PATH/.obsidian/plugins/"

# Verify installation
if [ -f "$PLUGIN_DIR/main.js" ] && [ -f "$PLUGIN_DIR/manifest.json" ]; then
    echo ""
    echo "✓ Plugin installed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Reload Obsidian (Cmd+P → 'Reload app without saving')"
    echo "2. Go to Settings → Community plugins"
    echo "3. Enable 'Image Resize on Paste'"
    echo ""
else
    echo "✗ Installation failed. Please install manually."
    exit 1
fi
