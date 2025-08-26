#!/usr/bin/env node

/**
 * ASSEMBLY-PROCESSOR
 * Final Transformation: Components → Runnable Application
 * 
 * Takes generated components and creates a complete, runnable application:
 * - Creates proper project structure
 * - Generates entry point (App.tsx, index.tsx)
 * - Creates CSS modules
 * - Sets up build configuration
 * - Makes it ready to run with npm start
 */

const fs = require('fs');
const path = require('path');

class AssemblyProcessor {
    constructor(config = {}) {
        this.config = {
            targetLine: 'prototype',
            framework: 'next', // 'next' or 'cra' (create-react-app)
            typescript: true,
            cssModules: true,
            testing: true,
            ...config
        };
        
        this.createdFiles = [];
    }
    
    /**
     * Main assembly process
     */
    async assemble(inputDir, outputDir) {
        console.log('🏗️ ASSEMBLY-PROCESSOR: Components → Runnable Application');
        console.log('📂 Input:', inputDir);
        console.log('📂 Output:', outputDir);
        console.log('🎯 Target Line:', this.config.targetLine);
        console.log('📦 Framework:', this.config.framework);
        console.log('');
        
        // Create project structure
        await this.createProjectStructure(outputDir);
        
        // Copy components
        await this.copyComponents(inputDir, outputDir);
        
        // Generate entry files
        await this.generateEntryFiles(outputDir);
        
        // Generate CSS modules
        await this.generateStyles(outputDir);
        
        // Generate configuration files
        await this.generateConfig(outputDir);
        
        // Generate test setup if needed
        if (this.config.testing) {
            await this.generateTestSetup(outputDir);
        }
        
        // Generate deployment files
        await this.generateDeploymentFiles(outputDir);
        
        console.log('✅ Assembly complete!');
        console.log(`\n📦 Created ${this.createdFiles.length} files`);
        
        return {
            framework: this.config.framework,
            files: this.createdFiles.length,
            ready: true
        };
    }
    
    /**
     * Create project structure
     */
    async createProjectStructure(outputDir) {
        console.log('📁 Creating project structure...');
        
        const dirs = this.config.framework === 'next' 
            ? [
                'app',
                'app/components',
                'app/styles',
                'app/hooks',
                'app/services',
                'app/types',
                'public'
              ]
            : [
                'src',
                'src/components',
                'src/styles',
                'src/hooks',
                'src/services',
                'src/types',
                'public'
              ];
        
        dirs.forEach(dir => {
            const dirPath = path.join(outputDir, dir);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
                console.log(`   ✅ ${dir}/`);
            }
        });
    }
    
    /**
     * Copy components to proper location
     */
    async copyComponents(inputDir, outputDir) {
        console.log('📋 Copying components...');
        
        const componentsDir = this.config.framework === 'next'
            ? path.join(outputDir, 'app', 'components')
            : path.join(outputDir, 'src', 'components');
        
        // Read all TypeScript files from input
        const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
        
        files.forEach(file => {
            const content = fs.readFileSync(path.join(inputDir, file), 'utf8');
            
            // Determine target directory based on file type
            let targetDir = componentsDir;
            if (file === 'types.ts') {
                targetDir = this.config.framework === 'next'
                    ? path.join(outputDir, 'app', 'types')
                    : path.join(outputDir, 'src', 'types');
            } else if (file === 'hooks.ts') {
                targetDir = this.config.framework === 'next'
                    ? path.join(outputDir, 'app', 'hooks')
                    : path.join(outputDir, 'src', 'hooks');
            } else if (file === 'mockData.ts') {
                targetDir = this.config.framework === 'next'
                    ? path.join(outputDir, 'app', 'services')
                    : path.join(outputDir, 'src', 'services');
            }
            
            // Update import paths for new structure
            let updatedContent = this.updateImportPaths(content, file);
            
            const targetPath = path.join(targetDir, file);
            fs.writeFileSync(targetPath, updatedContent);
            this.createdFiles.push(targetPath);
            console.log(`   ✅ ${file}`);
        });
    }
    
    /**
     * Update import paths for new structure
     */
    updateImportPaths(content, filename) {
        // Update relative imports to use proper paths
        let updated = content;
        
        // Fix imports based on file location
        if (filename.includes('Column') || filename === 'MasterView.tsx') {
            updated = updated.replace(/from '\.\/types'/g, "from '../types/types'");
            updated = updated.replace(/from '\.\/hooks'/g, "from '../hooks/hooks'");
            updated = updated.replace(/from '\.\/mockData'/g, "from '../services/mockData'");
            updated = updated.replace(/from '\.\/SearchBox'/g, "from './SearchBox'");
            updated = updated.replace(/from '\.\/Card'/g, "from './Card'");
            
            // Fix style imports for Next.js
            if (this.config.framework === 'next') {
                updated = updated.replace(/from '\.\/(\w+)\.module\.css'/g, "from '../styles/$1.module.css'");
            }
        }
        
        return updated;
    }
    
    /**
     * Generate entry files
     */
    async generateEntryFiles(outputDir) {
        console.log('🚀 Generating entry files...');
        
        if (this.config.framework === 'next') {
            await this.generateNextEntryFiles(outputDir);
        } else {
            await this.generateCRAEntryFiles(outputDir);
        }
    }
    
    /**
     * Generate Next.js entry files
     */
    async generateNextEntryFiles(outputDir) {
        // app/page.tsx
        const pageContent = `import { MasterView } from './components/MasterView';

export default function Home() {
  return (
    <main className="min-h-screen">
      <MasterView />
    </main>
  );
}
`;
        
        const pagePath = path.join(outputDir, 'app', 'page.tsx');
        fs.writeFileSync(pagePath, pageContent);
        this.createdFiles.push(pagePath);
        console.log('   ✅ app/page.tsx');
        
        // app/layout.tsx
        const layoutContent = `import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Master View - Service Software',
  description: 'Pest control service management system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
`;
        
        const layoutPath = path.join(outputDir, 'app', 'layout.tsx');
        fs.writeFileSync(layoutPath, layoutContent);
        this.createdFiles.push(layoutPath);
        console.log('   ✅ app/layout.tsx');
        
        // app/globals.css
        const globalsContent = `* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html,
body {
  max-width: 100vw;
  overflow-x: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
}

a {
  color: inherit;
  text-decoration: none;
}
`;
        
        const globalsPath = path.join(outputDir, 'app', 'globals.css');
        fs.writeFileSync(globalsPath, globalsContent);
        this.createdFiles.push(globalsPath);
        console.log('   ✅ app/globals.css');
    }
    
    /**
     * Generate Create React App entry files
     */
    async generateCRAEntryFiles(outputDir) {
        // src/App.tsx
        const appContent = `import React from 'react';
import { MasterView } from './components/MasterView';
import './App.css';

function App() {
  return (
    <div className="App">
      <MasterView />
    </div>
  );
}

export default App;
`;
        
        const appPath = path.join(outputDir, 'src', 'App.tsx');
        fs.writeFileSync(appPath, appContent);
        this.createdFiles.push(appPath);
        console.log('   ✅ src/App.tsx');
        
        // src/index.tsx
        const indexContent = `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;
        
        const indexPath = path.join(outputDir, 'src', 'index.tsx');
        fs.writeFileSync(indexPath, indexContent);
        this.createdFiles.push(indexPath);
        console.log('   ✅ src/index.tsx');
        
        // public/index.html
        const htmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Master View - Service Software" />
    <title>Master View</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
`;
        
        const htmlPath = path.join(outputDir, 'public', 'index.html');
        fs.writeFileSync(htmlPath, htmlContent);
        this.createdFiles.push(htmlPath);
        console.log('   ✅ public/index.html');
    }
    
    /**
     * Generate CSS modules
     */
    async generateStyles(outputDir) {
        console.log('🎨 Generating CSS modules...');
        
        const stylesDir = this.config.framework === 'next'
            ? path.join(outputDir, 'app', 'styles')
            : path.join(outputDir, 'src', 'styles');
        
        // MasterView.module.css
        const masterViewStyles = `.masterView {
  display: flex;
  height: 100vh;
  background-color: #f5f5f5;
  gap: 1px;
}
`;
        
        fs.writeFileSync(path.join(stylesDir, 'MasterView.module.css'), masterViewStyles);
        console.log('   ✅ MasterView.module.css');
        
        // Column styles
        const columnStyles = `.column {
  flex: 1;
  background-color: white;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.header {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.count {
  background-color: #e3f2fd;
  color: #1976d2;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  color: #666;
}
`;
        
        // Write column styles for each column
        ['AccountsColumn', 'LocationsColumn', 'WorkordersColumn'].forEach(name => {
            fs.writeFileSync(path.join(stylesDir, `${name}.module.css`), columnStyles);
            console.log(`   ✅ ${name}.module.css`);
        });
        
        // SearchBox.module.css
        const searchBoxStyles = `.searchBox {
  padding: 8px 16px;
}

.input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.input:focus {
  outline: none;
  border-color: #1976d2;
}
`;
        
        fs.writeFileSync(path.join(stylesDir, 'SearchBox.module.css'), searchBoxStyles);
        console.log('   ✅ SearchBox.module.css');
        
        // Card.module.css
        const cardStyles = `.card {
  padding: 12px;
  margin: 4px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  background-color: white;
}

.card:hover {
  border-color: #1976d2;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.card.selected {
  background-color: #e3f2fd;
  border-color: #1976d2;
}

.cardTitle {
  font-weight: 600;
  margin-bottom: 4px;
  color: #333;
}

.cardSubtitle {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 4px;
}

.cardMeta {
  font-size: 0.75rem;
  color: #999;
}
`;
        
        fs.writeFileSync(path.join(stylesDir, 'Card.module.css'), cardStyles);
        console.log('   ✅ Card.module.css');
        
        this.createdFiles.push(...fs.readdirSync(stylesDir).map(f => path.join(stylesDir, f)));
    }
    
    /**
     * Generate configuration files
     */
    async generateConfig(outputDir) {
        console.log('⚙️ Generating configuration files...');
        
        // package.json
        const packageJson = this.config.framework === 'next' 
            ? {
                name: "master-view-app",
                version: "0.1.0",
                private: true,
                scripts: {
                    dev: "next dev",
                    build: "next build",
                    start: "next start",
                    lint: "next lint",
                    test: "jest"
                },
                dependencies: {
                    "next": "14.0.4",
                    "react": "^18",
                    "react-dom": "^18"
                },
                devDependencies: {
                    "@types/node": "^20",
                    "@types/react": "^18",
                    "@types/react-dom": "^18",
                    "typescript": "^5",
                    "jest": "^29",
                    "@testing-library/react": "^14",
                    "@testing-library/jest-dom": "^6",
                    "eslint": "^8",
                    "eslint-config-next": "14.0.4"
                }
            }
            : {
                name: "master-view-app",
                version: "0.1.0",
                private: true,
                dependencies: {
                    "react": "^18.2.0",
                    "react-dom": "^18.2.0",
                    "react-scripts": "5.0.1",
                    "typescript": "^4.9.5"
                },
                scripts: {
                    start: "react-scripts start",
                    build: "react-scripts build",
                    test: "react-scripts test",
                    eject: "react-scripts eject"
                },
                devDependencies: {
                    "@types/react": "^18.2.0",
                    "@types/react-dom": "^18.2.0",
                    "@types/node": "^16.18.0",
                    "@testing-library/react": "^13.4.0",
                    "@testing-library/jest-dom": "^5.16.5"
                },
                browserslist: {
                    production: [">0.2%", "not dead", "not op_mini all"],
                    development: ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
                }
            };
        
        fs.writeFileSync(
            path.join(outputDir, 'package.json'),
            JSON.stringify(packageJson, null, 2)
        );
        this.createdFiles.push(path.join(outputDir, 'package.json'));
        console.log('   ✅ package.json');
        
        // tsconfig.json
        const tsConfig = this.config.framework === 'next'
            ? {
                compilerOptions: {
                    target: "es5",
                    lib: ["dom", "dom.iterable", "esnext"],
                    allowJs: true,
                    skipLibCheck: true,
                    strict: true,
                    noEmit: true,
                    esModuleInterop: true,
                    module: "esnext",
                    moduleResolution: "bundler",
                    resolveJsonModule: true,
                    isolatedModules: true,
                    jsx: "preserve",
                    incremental: true,
                    plugins: [{ name: "next" }],
                    paths: { "@/*": ["./*"] }
                },
                include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
                exclude: ["node_modules"]
            }
            : {
                compilerOptions: {
                    target: "es5",
                    lib: ["dom", "dom.iterable", "esnext"],
                    allowJs: true,
                    skipLibCheck: true,
                    esModuleInterop: true,
                    allowSyntheticDefaultImports: true,
                    strict: true,
                    forceConsistentCasingInFileNames: true,
                    noFallthroughCasesInSwitch: true,
                    module: "esnext",
                    moduleResolution: "node",
                    resolveJsonModule: true,
                    isolatedModules: true,
                    noEmit: true,
                    jsx: "react-jsx"
                },
                include: ["src"]
            };
        
        fs.writeFileSync(
            path.join(outputDir, 'tsconfig.json'),
            JSON.stringify(tsConfig, null, 2)
        );
        this.createdFiles.push(path.join(outputDir, 'tsconfig.json'));
        console.log('   ✅ tsconfig.json');
        
        // .gitignore
        const gitignore = `# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build
/dist

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
`;
        
        fs.writeFileSync(path.join(outputDir, '.gitignore'), gitignore);
        this.createdFiles.push(path.join(outputDir, '.gitignore'));
        console.log('   ✅ .gitignore');
        
        // README.md
        const readme = `# Master View Application

Generated by the Factory Pipeline

## Getting Started

### Installation
\`\`\`bash
npm install
\`\`\`

### Development
\`\`\`bash
${this.config.framework === 'next' ? 'npm run dev' : 'npm start'}
\`\`\`

Open [http://localhost:${this.config.framework === 'next' ? '3000' : '3000'}](http://localhost:${this.config.framework === 'next' ? '3000' : '3000'}) to view the application.

## Features

- Three-column Master View interface
- Account → Location → Work Order hierarchy
- Search functionality in each column
- TypeScript for type safety
- CSS Modules for styling
- Mock data service

## Project Structure

\`\`\`
${this.config.framework === 'next' ? 'app/' : 'src/'}
├── components/     # React components
├── styles/        # CSS modules
├── hooks/         # Custom React hooks
├── services/      # Data services
└── types/         # TypeScript types
\`\`\`

## Pipeline

This application was generated through the following pipeline:
1. EXTRACT-PROCESSOR: HTML → JSON
2. COMPONENT-GENERATOR: JSON → React Components
3. ASSEMBLY-PROCESSOR: Components → Runnable App

## Deployment

This app is ready for deployment to Vercel:

\`\`\`bash
npm run build
\`\`\`

Then deploy the ${this.config.framework === 'next' ? '' : 'build/'} directory to your hosting platform.
`;
        
        fs.writeFileSync(path.join(outputDir, 'README.md'), readme);
        this.createdFiles.push(path.join(outputDir, 'README.md'));
        console.log('   ✅ README.md');
    }
    
    /**
     * Generate test setup
     */
    async generateTestSetup(outputDir) {
        console.log('🧪 Generating test setup...');
        
        const testDir = this.config.framework === 'next'
            ? path.join(outputDir, '__tests__')
            : path.join(outputDir, 'src', '__tests__');
        
        if (!fs.existsSync(testDir)) {
            fs.mkdirSync(testDir, { recursive: true });
        }
        
        // Sample test file
        const testContent = `import { render, screen } from '@testing-library/react';
import { MasterView } from '${this.config.framework === 'next' ? '../app' : '..'}/components/MasterView';

describe('MasterView', () => {
  it('renders without crashing', () => {
    render(<MasterView />);
    expect(screen.getByText(/Accounts/i)).toBeInTheDocument();
  });
});
`;
        
        fs.writeFileSync(path.join(testDir, 'MasterView.test.tsx'), testContent);
        this.createdFiles.push(path.join(testDir, 'MasterView.test.tsx'));
        console.log('   ✅ MasterView.test.tsx');
        
        // Jest config for Next.js
        if (this.config.framework === 'next') {
            const jestConfig = `const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
}

module.exports = createJestConfig(customJestConfig)
`;
            
            fs.writeFileSync(path.join(outputDir, 'jest.config.js'), jestConfig);
            this.createdFiles.push(path.join(outputDir, 'jest.config.js'));
            console.log('   ✅ jest.config.js');
            
            const jestSetup = `import '@testing-library/jest-dom'`;
            fs.writeFileSync(path.join(outputDir, 'jest.setup.js'), jestSetup);
            this.createdFiles.push(path.join(outputDir, 'jest.setup.js'));
            console.log('   ✅ jest.setup.js');
        }
    }
    
    /**
     * Generate deployment files
     */
    async generateDeploymentFiles(outputDir) {
        console.log('🚀 Generating deployment files...');
        
        if (this.config.framework === 'next') {
            // next.config.js
            const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable if deploying to a subdirectory
  // basePath: '/master-view',
  
  // Optimize for production
  swcMinify: true,
  
  // Add any environment variables
  env: {
    APP_VERSION: '1.0.0',
  },
}

module.exports = nextConfig
`;
            
            fs.writeFileSync(path.join(outputDir, 'next.config.js'), nextConfig);
            this.createdFiles.push(path.join(outputDir, 'next.config.js'));
            console.log('   ✅ next.config.js');
        }
        
        // vercel.json
        const vercelConfig = {
            buildCommand: this.config.framework === 'next' ? "next build" : "npm run build",
            devCommand: this.config.framework === 'next' ? "next dev" : "npm start",
            installCommand: "npm install",
            framework: this.config.framework === 'next' ? "nextjs" : "create-react-app"
        };
        
        fs.writeFileSync(
            path.join(outputDir, 'vercel.json'),
            JSON.stringify(vercelConfig, null, 2)
        );
        this.createdFiles.push(path.join(outputDir, 'vercel.json'));
        console.log('   ✅ vercel.json');
    }
}

// CLI Interface
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
        console.log('Usage: ASSEMBLY-PROCESSOR <input-dir> <output-dir> [framework] [target-line]');
        console.log('Example: ASSEMBLY-PROCESSOR ./components ./app next prototype');
        console.log('Frameworks: next, cra');
        process.exit(1);
    }
    
    const [inputDir, outputDir, framework = 'next', targetLine = 'prototype'] = args;
    
    const processor = new AssemblyProcessor({ framework, targetLine });
    
    processor.assemble(inputDir, outputDir)
        .then(result => {
            console.log('\n🎉 Assembly successful!');
            console.log(`Framework: ${result.framework}`);
            console.log(`Files created: ${result.files}`);
            console.log('\n📦 Next steps:');
            console.log('   1. cd ' + outputDir);
            console.log('   2. npm install');
            console.log('   3. ' + (framework === 'next' ? 'npm run dev' : 'npm start'));
            console.log('\n🚀 Ready for deployment to Vercel!');
        })
        .catch(err => {
            console.error('❌ Assembly failed:', err.message);
            console.error(err.stack);
            process.exit(1);
        });
}

module.exports = AssemblyProcessor;