#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const PIPELINE_ROOT = path.join(__dirname, '../../');
const ITERATIONS_DIR = path.join(PIPELINE_ROOT, 'iterations');
const ARCHIVE_DIR = path.join(ITERATIONS_DIR, 'archive');
const CURRENT_LINK = path.join(ITERATIONS_DIR, 'current');
const MANIFEST_FILE = path.join(ITERATIONS_DIR, 'manifest.json');
const SOURCE_MATERIALS_DIR = path.join(ITERATIONS_DIR, 'source-materials');

// Directories to manage in iterations (cleared on new iteration)
const MANAGED_DIRS = [
    '1-inputs/requirements',
    '2-factory/validation',
    '3-workspace/concept'
];

// Source materials configuration (preserved across iterations)
const SOURCE_MATERIALS = {
    specs: {
        pattern: /.*-spec\.md$/,
        description: 'Module specifications'
    },
    busm: {
        pattern: /BUSM\.(json|mmd)$/,
        description: 'Business Unit Structure Model'
    },
    contracts: {
        pattern: /busm-registry\.js$/,
        description: 'BUSM Registry contract'
    }
};

// Initialize iterations directory structure
function initIterationsDir() {
    if (!fs.existsSync(ITERATIONS_DIR)) {
        fs.mkdirSync(ITERATIONS_DIR, { recursive: true });
    }
    if (!fs.existsSync(ARCHIVE_DIR)) {
        fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
    }
    if (!fs.existsSync(SOURCE_MATERIALS_DIR)) {
        fs.mkdirSync(SOURCE_MATERIALS_DIR, { recursive: true });
    }
    if (!fs.existsSync(MANIFEST_FILE)) {
        fs.writeFileSync(MANIFEST_FILE, JSON.stringify({
            iterations: [],
            current: null,
            golden: [],
            sourceMaterials: {}
        }, null, 2));
    }
}

// Load manifest
function loadManifest() {
    initIterationsDir();
    return JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf8'));
}

// Save manifest
function saveManifest(manifest) {
    fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
}

// Generate iteration ID
function generateIterationId(description) {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const sanitizedDesc = description ? `-${description.replace(/[^a-z0-9]/gi, '-').toLowerCase()}` : '';
    return `${timestamp}${sanitizedDesc}`;
}

// Copy directory recursively
function copyDir(src, dest) {
    if (!fs.existsSync(src)) return;
    
    fs.mkdirSync(dest, { recursive: true });
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// Archive current workspace
function archiveCurrentWorkspace(iterationId, description) {
    const archivePath = path.join(ARCHIVE_DIR, iterationId);
    fs.mkdirSync(archivePath, { recursive: true });
    
    // Archive managed directories
    for (const dir of MANAGED_DIRS) {
        const srcPath = path.join(PIPELINE_ROOT, dir);
        const destPath = path.join(archivePath, dir);
        
        if (fs.existsSync(srcPath)) {
            console.log(`Archiving ${dir}...`);
            copyDir(srcPath, destPath);
        }
    }
    
    // Create iteration metadata
    const metadata = {
        id: iterationId,
        description: description || '',
        created: new Date().toISOString(),
        directories: MANAGED_DIRS,
        stats: gatherIterationStats(PIPELINE_ROOT)
    };
    
    fs.writeFileSync(
        path.join(archivePath, 'iteration-metadata.json'),
        JSON.stringify(metadata, null, 2)
    );
    
    return archivePath;
}

// Gather iteration statistics
function gatherIterationStats(basePath) {
    const stats = {
        requirements: 0,
        stories: 0,
        tasks: 0,
        concepts: 0,
        validationsPassed: 0,
        validationsFailed: 0
    };
    
    // Count requirements
    const reqFile = path.join(basePath, '2-factory/validation/requirements.json');
    if (fs.existsSync(reqFile)) {
        try {
            const reqs = JSON.parse(fs.readFileSync(reqFile, 'utf8'));
            stats.requirements = Array.isArray(reqs) ? reqs.length : Object.keys(reqs).length;
        } catch (e) {}
    }
    
    // Count stories
    const storiesDir = path.join(basePath, '1-inputs/requirements');
    if (fs.existsSync(storiesDir)) {
        const storyFiles = findFiles(storiesDir, /US-.*\.md$/);
        stats.stories = storyFiles.length;
    }
    
    // Count tasks
    const tasksDir = path.join(basePath, '1-inputs/requirements');
    if (fs.existsSync(tasksDir)) {
        const taskFiles = findFiles(tasksDir, /.*-tasks\.md$/);
        stats.tasks = taskFiles.length;
    }
    
    // Count concepts
    const conceptsDir = path.join(basePath, '3-workspace/concept');
    if (fs.existsSync(conceptsDir)) {
        const conceptFiles = findFiles(conceptsDir, /.*-CONCEPT\.html$/);
        stats.concepts = conceptFiles.length;
    }
    
    // Check validation report
    const validationReport = path.join(basePath, '3-workspace/concept/validation-report.json');
    if (fs.existsSync(validationReport)) {
        try {
            const report = JSON.parse(fs.readFileSync(validationReport, 'utf8'));
            if (report.results) {
                stats.validationsPassed = report.results.filter(r => r.status === 'PASS').length;
                stats.validationsFailed = report.results.filter(r => r.status === 'FAIL').length;
            }
        } catch (e) {}
    }
    
    return stats;
}

// Find files matching pattern
function findFiles(dir, pattern) {
    const files = [];
    
    function search(currentDir) {
        if (!fs.existsSync(currentDir)) return;
        
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);
            if (entry.isDirectory()) {
                search(fullPath);
            } else if (pattern.test(entry.name)) {
                files.push(fullPath);
            }
        }
    }
    
    search(dir);
    return files;
}

// Clear workspace (but preserve source materials)
function clearWorkspace(options = {}) {
    const { preserveSources = true } = options;
    
    for (const dir of MANAGED_DIRS) {
        const dirPath = path.join(PIPELINE_ROOT, dir);
        
        if (fs.existsSync(dirPath)) {
            if (preserveSources && dir === '1-inputs/requirements') {
                // Selectively clear, preserving source materials
                console.log(`Clearing ${dir} (preserving source materials)...`);
                clearDirectorySelectively(dirPath);
            } else {
                console.log(`Clearing ${dir}...`);
                fs.rmSync(dirPath, { recursive: true, force: true });
                fs.mkdirSync(dirPath, { recursive: true });
            }
        } else {
            // Create empty directory if it doesn't exist
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }
    
    // Restore source materials if they exist
    if (preserveSources) {
        restoreSourceMaterials();
    }
}

// Selectively clear directory, preserving source materials
function clearDirectorySelectively(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        // Check if this is a source material
        let isSourceMaterial = false;
        for (const [type, config] of Object.entries(SOURCE_MATERIALS)) {
            if (config.pattern.test(entry.name)) {
                isSourceMaterial = true;
                break;
            }
        }
        
        if (!isSourceMaterial) {
            if (entry.isDirectory()) {
                // Recursively clear subdirectories
                clearDirectorySelectively(fullPath);
                // Remove directory if empty
                const subEntries = fs.readdirSync(fullPath);
                if (subEntries.length === 0) {
                    fs.rmdirSync(fullPath);
                }
            } else {
                // Remove non-source files
                fs.unlinkSync(fullPath);
            }
        }
    }
}

// Save source materials
function saveSourceMaterials() {
    const manifest = loadManifest();
    const savedMaterials = {};
    
    console.log('📚 Saving source materials...');
    
    // Find and save all source materials
    for (const dir of MANAGED_DIRS) {
        const dirPath = path.join(PIPELINE_ROOT, dir);
        if (fs.existsSync(dirPath)) {
            const materials = findSourceMaterials(dirPath);
            
            for (const material of materials) {
                const relativePath = path.relative(PIPELINE_ROOT, material.path);
                const targetPath = path.join(SOURCE_MATERIALS_DIR, relativePath);
                
                // Create target directory
                fs.mkdirSync(path.dirname(targetPath), { recursive: true });
                
                // Copy file
                fs.copyFileSync(material.path, targetPath);
                
                // Track in manifest
                savedMaterials[relativePath] = {
                    type: material.type,
                    originalPath: relativePath,
                    savedAt: new Date().toISOString()
                };
                
                console.log(`  ✓ Saved: ${material.type} - ${path.basename(material.path)}`);
            }
        }
    }
    
    manifest.sourceMaterials = savedMaterials;
    saveManifest(manifest);
    
    return savedMaterials;
}

// Restore source materials
function restoreSourceMaterials() {
    const manifest = loadManifest();
    
    if (!manifest.sourceMaterials || Object.keys(manifest.sourceMaterials).length === 0) {
        return;
    }
    
    console.log('📂 Restoring source materials...');
    
    for (const [relativePath, material] of Object.entries(manifest.sourceMaterials)) {
        const sourcePath = path.join(SOURCE_MATERIALS_DIR, relativePath);
        const targetPath = path.join(PIPELINE_ROOT, material.originalPath);
        
        if (fs.existsSync(sourcePath)) {
            // Create target directory
            fs.mkdirSync(path.dirname(targetPath), { recursive: true });
            
            // Copy file back
            fs.copyFileSync(sourcePath, targetPath);
            
            console.log(`  ✓ Restored: ${material.type} - ${path.basename(targetPath)}`);
        }
    }
}

// Find source materials in a directory
function findSourceMaterials(dirPath) {
    const materials = [];
    
    function search(currentDir) {
        if (!fs.existsSync(currentDir)) return;
        
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);
            
            if (entry.isDirectory()) {
                search(fullPath);
            } else {
                // Check if file matches any source material pattern
                for (const [type, config] of Object.entries(SOURCE_MATERIALS)) {
                    if (config.pattern.test(entry.name)) {
                        materials.push({
                            path: fullPath,
                            type: type,
                            name: entry.name
                        });
                        break;
                    }
                }
            }
        }
    }
    
    search(dirPath);
    return materials;
}

// Create new iteration
function newIteration(description) {
    const manifest = loadManifest();
    const iterationId = generateIterationId(description);
    
    console.log(`\n📦 Creating new iteration: ${iterationId}`);
    
    // Archive current workspace if it has content
    const hasContent = MANAGED_DIRS.some(dir => {
        const dirPath = path.join(PIPELINE_ROOT, dir);
        return fs.existsSync(dirPath) && fs.readdirSync(dirPath).length > 0;
    });
    
    if (hasContent) {
        console.log('📁 Archiving current workspace...');
        const archivePath = archiveCurrentWorkspace(iterationId + '-archived', 'Auto-archived before new iteration');
        console.log(`✅ Archived to: ${path.relative(PIPELINE_ROOT, archivePath)}`);
    }
    
    // Clear workspace
    console.log('🧹 Clearing workspace...');
    clearWorkspace();
    
    // Update manifest
    manifest.iterations.push({
        id: iterationId,
        description: description || '',
        created: new Date().toISOString(),
        status: 'active'
    });
    manifest.current = iterationId;
    saveManifest(manifest);
    
    console.log(`✅ New iteration created: ${iterationId}`);
    console.log('📝 Workspace is ready for new concept line run\n');
    
    return iterationId;
}

// List iterations
function listIterations() {
    const manifest = loadManifest();
    
    console.log('\n📚 Iteration History\n');
    console.log('='.repeat(80));
    
    if (manifest.iterations.length === 0) {
        console.log('No iterations found. Start with: npm run concept:new-iteration "description"');
        return;
    }
    
    // List archived iterations
    const archived = fs.readdirSync(ARCHIVE_DIR, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => {
            const metaFile = path.join(ARCHIVE_DIR, d.name, 'iteration-metadata.json');
            if (fs.existsSync(metaFile)) {
                const meta = JSON.parse(fs.readFileSync(metaFile, 'utf8'));
                return {
                    id: d.name,
                    ...meta,
                    isGolden: manifest.golden.includes(d.name)
                };
            }
            return null;
        })
        .filter(Boolean)
        .sort((a, b) => new Date(b.created) - new Date(a.created));
    
    archived.forEach(iter => {
        const golden = iter.isGolden ? ' ⭐ [GOLDEN]' : '';
        const current = iter.id === manifest.current ? ' 👉 [CURRENT]' : '';
        console.log(`\n${iter.id}${golden}${current}`);
        console.log(`  Description: ${iter.description || '(none)'}`);
        console.log(`  Created: ${new Date(iter.created).toLocaleString()}`);
        
        if (iter.stats) {
            console.log(`  Stats: ${iter.stats.requirements} requirements | ${iter.stats.stories} stories | ${iter.stats.tasks} tasks`);
            if (iter.stats.validationsPassed > 0 || iter.stats.validationsFailed > 0) {
                console.log(`  Validation: ✅ ${iter.stats.validationsPassed} passed | ❌ ${iter.stats.validationsFailed} failed`);
            }
        }
    });
    
    console.log('\n' + '='.repeat(80));
    console.log(`Total iterations: ${archived.length} | Golden: ${manifest.golden.length}`);
    console.log();
}

// Switch to iteration
function switchIteration(iterationId) {
    const manifest = loadManifest();
    const archivePath = path.join(ARCHIVE_DIR, iterationId);
    
    if (!fs.existsSync(archivePath)) {
        console.error(`❌ Iteration not found: ${iterationId}`);
        console.log('Run "npm run concept:list-iterations" to see available iterations');
        return;
    }
    
    console.log(`\n🔄 Switching to iteration: ${iterationId}`);
    
    // Archive current workspace if needed
    const hasContent = MANAGED_DIRS.some(dir => {
        const dirPath = path.join(PIPELINE_ROOT, dir);
        return fs.existsSync(dirPath) && fs.readdirSync(dirPath).length > 0;
    });
    
    if (hasContent) {
        const backupId = generateIterationId('auto-backup');
        console.log(`📁 Backing up current workspace as ${backupId}...`);
        archiveCurrentWorkspace(backupId, 'Auto-backup before switch');
    }
    
    // Clear workspace
    console.log('🧹 Clearing workspace...');
    clearWorkspace();
    
    // Restore from archive
    console.log('📂 Restoring from archive...');
    for (const dir of MANAGED_DIRS) {
        const srcPath = path.join(archivePath, dir);
        const destPath = path.join(PIPELINE_ROOT, dir);
        
        if (fs.existsSync(srcPath)) {
            console.log(`  Restoring ${dir}...`);
            copyDir(srcPath, destPath);
        }
    }
    
    // Update manifest
    manifest.current = iterationId;
    saveManifest(manifest);
    
    console.log(`✅ Switched to iteration: ${iterationId}\n`);
}

// Tag iteration as golden
function tagGolden(iterationId) {
    const manifest = loadManifest();
    const archivePath = path.join(ARCHIVE_DIR, iterationId);
    
    if (!fs.existsSync(archivePath)) {
        console.error(`❌ Iteration not found: ${iterationId}`);
        return;
    }
    
    if (!manifest.golden.includes(iterationId)) {
        manifest.golden.push(iterationId);
        saveManifest(manifest);
        console.log(`⭐ Tagged as golden: ${iterationId}`);
    } else {
        console.log(`Already tagged as golden: ${iterationId}`);
    }
}

// Compare two iterations
function compareIterations(iter1, iter2) {
    const path1 = path.join(ARCHIVE_DIR, iter1);
    const path2 = path.join(ARCHIVE_DIR, iter2);
    
    if (!fs.existsSync(path1)) {
        console.error(`❌ Iteration not found: ${iter1}`);
        return;
    }
    if (!fs.existsSync(path2)) {
        console.error(`❌ Iteration not found: ${iter2}`);
        return;
    }
    
    console.log(`\n📊 Comparing iterations:\n`);
    console.log(`  LEFT:  ${iter1}`);
    console.log(`  RIGHT: ${iter2}\n`);
    
    // Load metadata
    const meta1 = JSON.parse(fs.readFileSync(path.join(path1, 'iteration-metadata.json'), 'utf8'));
    const meta2 = JSON.parse(fs.readFileSync(path.join(path2, 'iteration-metadata.json'), 'utf8'));
    
    // Compare stats
    console.log('📈 Statistics Comparison:');
    console.log('─'.repeat(60));
    console.log(`${'Metric'.padEnd(20)} | ${'LEFT'.padEnd(15)} | ${'RIGHT'.padEnd(15)} | Delta`);
    console.log('─'.repeat(60));
    
    const stats1 = meta1.stats || {};
    const stats2 = meta2.stats || {};
    
    for (const key of Object.keys({...stats1, ...stats2})) {
        const val1 = stats1[key] || 0;
        const val2 = stats2[key] || 0;
        const delta = val2 - val1;
        const deltaStr = delta > 0 ? `+${delta}` : delta.toString();
        console.log(`${key.padEnd(20)} | ${val1.toString().padEnd(15)} | ${val2.toString().padEnd(15)} | ${deltaStr}`);
    }
    
    console.log();
}

// Main CLI
const command = process.argv[2];
const args = process.argv.slice(3);

switch (command) {
    case 'new':
        saveSourceMaterials();  // Save source materials before creating new iteration
        newIteration(args.join(' '));
        break;
    
    case 'list':
        listIterations();
        break;
    
    case 'switch':
        if (!args[0]) {
            console.error('❌ Please specify iteration ID');
            process.exit(1);
        }
        switchIteration(args[0]);
        break;
    
    case 'tag-golden':
        if (!args[0]) {
            console.error('❌ Please specify iteration ID');
            process.exit(1);
        }
        tagGolden(args[0]);
        break;
    
    case 'compare':
        if (!args[0] || !args[1]) {
            console.error('❌ Please specify two iteration IDs to compare');
            process.exit(1);
        }
        compareIterations(args[0], args[1]);
        break;
    
    case 'save-sources':
        const saved = saveSourceMaterials();
        console.log(`\n✅ Saved ${Object.keys(saved).length} source materials`);
        break;
    
    case 'list-sources':
        const manifest = loadManifest();
        console.log('\n📚 Source Materials\n');
        console.log('='.repeat(60));
        if (manifest.sourceMaterials && Object.keys(manifest.sourceMaterials).length > 0) {
            for (const [filepath, material] of Object.entries(manifest.sourceMaterials)) {
                console.log(`\n${material.type}: ${path.basename(filepath)}`);
                console.log(`  Path: ${filepath}`);
                console.log(`  Saved: ${new Date(material.savedAt).toLocaleString()}`);
            }
        } else {
            console.log('No source materials saved. Run "save-sources" to preserve current sources.');
        }
        console.log('\n' + '='.repeat(60));
        break;
    
    default:
        console.log(`
Concept Line Iteration Manager
==============================

Commands:
  new [description]       - Create new iteration (preserves source materials)
  list                    - List all iterations with stats
  switch <iteration-id>   - Switch to a previous iteration
  tag-golden <id>         - Mark iteration as golden/demo-ready
  compare <id1> <id2>     - Compare two iterations
  save-sources            - Save current source materials (specs, BUSM)
  list-sources            - List saved source materials

Source Materials:
  The following files are automatically preserved across iterations:
  - Module specifications (*-spec.md)
  - BUSM files (BUSM.json, BUSM.mmd)
  - BUSM Registry (busm-registry.js)

Examples:
  node iteration-manager.js new "testing 3-click navigation"
  node iteration-manager.js list
  node iteration-manager.js switch 2025-01-18T14-30-00-testing-3-click
  node iteration-manager.js tag-golden 2025-01-18T16-00-00-client-demo
  node iteration-manager.js save-sources
        `);
}