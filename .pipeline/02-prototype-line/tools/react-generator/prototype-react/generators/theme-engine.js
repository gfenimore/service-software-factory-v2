/**
 * Theme Engine for Prototype Generator
 * Safely applies themes without breaking TypeScript/ESLint
 */

const fs = require('fs');
const path = require('path');

/**
 * Load a theme configuration
 * @param {string} themeName - Name of theme to load (default, healthcare, finance, etc.)
 * @returns {Object} Theme configuration
 */
function loadTheme(themeName = 'default') {
    try {
        const themePath = path.join(__dirname, '..', 'themes', `${themeName}-theme.json`);
        
        // Check if theme exists
        if (!fs.existsSync(themePath)) {
            console.log(`Theme '${themeName}' not found, using default theme`);
            const defaultPath = path.join(__dirname, '..', 'themes', 'default-theme.json');
            return JSON.parse(fs.readFileSync(defaultPath, 'utf8'));
        }
        
        return JSON.parse(fs.readFileSync(themePath, 'utf8'));
    } catch (error) {
        console.error('Error loading theme:', error);
        // Return a minimal safe theme if all else fails
        return getSafeDefaultTheme();
    }
}

/**
 * Get a minimal safe theme that will always work
 * This is our "nuclear option" - plain but functional
 */
function getSafeDefaultTheme() {
    return {
        name: "Safe Default",
        components: {
            table: {
                container: "overflow-auto",
                base: "w-full",
                header: "border-b",
                headerCell: "p-2 text-left",
                row: "border-b",
                cell: "p-2"
            },
            button: {
                primary: "px-4 py-2 bg-blue-500 text-white",
                secondary: "px-4 py-2 border"
            },
            input: {
                base: "px-3 py-2 border"
            },
            badge: {
                base: "px-2 py-1 text-sm",
                active: "bg-green-200",
                inactive: "bg-gray-200"
            }
        }
    };
}

/**
 * Apply theme to component generation
 * Returns themed class strings that are SAFE from linting issues
 */
function applyTheme(componentType, elementType, theme) {
    try {
        // Navigate safely through theme object
        const classes = theme?.components?.[componentType]?.[elementType];
        
        if (!classes) {
            // Return minimal classes if theme doesn't have this element
            return getDefaultClasses(componentType, elementType);
        }
        
        // Return the classes as-is (they're just strings!)
        return classes;
    } catch (error) {
        // If anything goes wrong, return safe defaults
        return getDefaultClasses(componentType, elementType);
    }
}

/**
 * Get default classes for any component/element
 * These will always work and won't cause linting issues
 */
function getDefaultClasses(componentType, elementType) {
    const defaults = {
        table: {
            container: "overflow-x-auto",
            base: "min-w-full",
            header: "border-b",
            headerCell: "px-4 py-2",
            row: "border-b",
            cell: "px-4 py-2"
        },
        button: {
            primary: "px-4 py-2 bg-blue-500 text-white",
            secondary: "px-4 py-2 border"
        },
        input: {
            base: "px-3 py-2 border",
            focus: "focus:outline-none"
        },
        badge: {
            base: "px-2 py-1",
            active: "bg-green-100",
            inactive: "bg-gray-100"
        }
    };
    
    return defaults[componentType]?.[elementType] || "";
}

/**
 * Generate theme-aware component with ESCAPE HATCHES
 * This wraps generated code with protective comments
 */
function wrapWithEscapeHatches(componentCode, options = {}) {
    const { disableTypeScript = false, disableESLint = false, disablePrettier = false } = options;
    
    let wrappedCode = componentCode;
    
    // Add TypeScript escape hatches if needed
    if (disableTypeScript) {
        wrappedCode = `// @ts-nocheck\n${wrappedCode}`;
    }
    
    // Add ESLint escape hatches if needed
    if (disableESLint) {
        wrappedCode = `/* eslint-disable */\n${wrappedCode}\n/* eslint-enable */`;
    }
    
    // Add Prettier escape hatches if needed
    if (disablePrettier) {
        wrappedCode = `// prettier-ignore\n${wrappedCode}`;
    }
    
    return wrappedCode;
}

/**
 * Create a theme preview HTML file
 * This lets you see the theme without any build process!
 */
function generateThemePreview(theme) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Theme Preview: ${theme.name}</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="p-8 bg-gray-50">
    <h1 class="${theme.typography?.title || 'text-2xl font-bold'}">
        ${theme.name} Preview
    </h1>
    
    <div class="${theme.spacing?.page || 'space-y-4'}">
        <!-- Table Preview -->
        <div class="${theme.components.table.container}">
            <table class="${theme.components.table.base}">
                <thead class="${theme.components.table.header}">
                    <tr>
                        <th class="${theme.components.table.headerCell}">Column 1</th>
                        <th class="${theme.components.table.headerCell}">Column 2</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="${theme.components.table.row}">
                        <td class="${theme.components.table.cell}">Data 1</td>
                        <td class="${theme.components.table.cell}">
                            <span class="${theme.components.badge.active}">Active</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- Button Preview -->
        <div class="flex gap-4">
            <button class="${theme.components.button.primary}">Primary Button</button>
            <button class="${theme.components.button.secondary}">Secondary Button</button>
        </div>
        
        <!-- Input Preview -->
        <div>
            <input type="text" placeholder="Sample input" 
                   class="${theme.components.input.base} ${theme.components.input.focus}">
        </div>
    </div>
</body>
</html>`;
}

/**
 * List available themes
 */
function listAvailableThemes() {
    const themesDir = path.join(__dirname, '..', 'themes');
    try {
        const files = fs.readdirSync(themesDir);
        return files
            .filter(f => f.endsWith('-theme.json'))
            .map(f => f.replace('-theme.json', ''));
    } catch (error) {
        return ['default'];
    }
}

module.exports = {
    loadTheme,
    applyTheme,
    wrapWithEscapeHatches,
    generateThemePreview,
    listAvailableThemes,
    getSafeDefaultTheme
};