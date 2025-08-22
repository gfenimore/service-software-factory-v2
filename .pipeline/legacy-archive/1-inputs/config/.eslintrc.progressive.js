/**
 * Progressive ESLint Configuration
 * Version: 1.0
 * Purpose: Directory-based linting rules that enforce progressive standards
 *
 * This configuration applies different linting rules based on which line
 * (concept/prototype/production) the code belongs to, allowing for
 * progressive refinement without blocking early-stage development.
 */

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'jsx-a11y', 'import', 'jest'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },

  // Base rules (apply to all code not in specific directories)
  rules: {
    // TypeScript
    '@typescript-eslint/explicit-module-boundary-types': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],

    // React
    'react/prop-types': 'off', // We use TypeScript for prop validation
    'react/react-in-jsx-scope': 'off', // Not needed in React 17+

    // General
    'no-debugger': 'warn',
    'no-alert': 'warn',
  },

  // Progressive overrides based on directory
  overrides: [
    // ============================================
    // CONCEPT LINE - Maximum flexibility
    // ============================================
    {
      files: [
        '**/concept/**/*.{ts,tsx,js,jsx}',
        '**/concepts/**/*.{ts,tsx,js,jsx}',
        '.pipeline/concept/**/*.{ts,tsx,js,jsx}',
        'src/concept/**/*.{ts,tsx,js,jsx}',
      ],
      rules: {
        // TypeScript - Very permissive
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-var-requires': 'off',

        // Allow console for debugging
        'no-console': 'off',

        // Allow TODO comments for planning
        'no-warning-comments': 'off',

        // Allow debugger statements
        'no-debugger': 'off',

        // Allow alert for quick demos
        'no-alert': 'off',

        // Permissive React rules
        'react/display-name': 'off',
        'react/jsx-no-target-blank': 'off',
        'react/no-unescaped-entities': 'off',

        // No accessibility enforcement
        'jsx-a11y/alt-text': 'off',
        'jsx-a11y/anchor-is-valid': 'off',
        'jsx-a11y/click-events-have-key-events': 'off',
        'jsx-a11y/no-static-element-interactions': 'off',

        // Allow any imports
        'import/no-unresolved': 'off',
        'import/no-dynamic-require': 'off',

        // No complexity limits
        complexity: 'off',
        'max-lines': 'off',
        'max-lines-per-function': 'off',
        'max-statements': 'off',
        'max-nested-callbacks': 'off',
        'max-depth': 'off',
      },
    },

    // ============================================
    // PROTOTYPE LINE - Balanced standards
    // ============================================
    {
      files: [
        '**/prototype/**/*.{ts,tsx,js,jsx}',
        '**/prototypes/**/*.{ts,tsx,js,jsx}',
        '.pipeline/prototype/**/*.{ts,tsx,js,jsx}',
        'src/prototype/**/*.{ts,tsx,js,jsx}',
      ],
      extends: ['plugin:@typescript-eslint/recommended', 'plugin:react/recommended'],
      rules: {
        // TypeScript - Stricter but not extreme
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/explicit-module-boundary-types': 'warn',
        '@typescript-eslint/no-unused-vars': [
          'warn',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            ignoreRestSiblings: true,
          },
        ],
        '@typescript-eslint/ban-ts-comment': [
          'warn',
          {
            'ts-expect-error': 'allow-with-description',
            'ts-ignore': false,
            'ts-nocheck': false,
            'ts-check': false,
          },
        ],
        '@typescript-eslint/no-non-null-assertion': 'warn',
        '@typescript-eslint/no-empty-function': 'warn',

        // Console warnings (not errors)
        'no-console': [
          'warn',
          {
            allow: ['warn', 'error', 'info'],
          },
        ],

        // TODO comments allowed but flagged
        'no-warning-comments': [
          'warn',
          {
            terms: ['TODO', 'FIXME', 'HACK'],
            location: 'start',
          },
        ],

        // No debugger in code
        'no-debugger': 'error',

        // No alerts
        'no-alert': 'error',

        // React best practices
        'react/display-name': 'warn',
        'react/jsx-no-target-blank': 'error',
        'react/jsx-key': 'error',
        'react/no-array-index-key': 'warn',
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',

        // Basic accessibility
        'jsx-a11y/alt-text': 'warn',
        'jsx-a11y/anchor-is-valid': 'warn',
        'jsx-a11y/aria-props': 'error',
        'jsx-a11y/aria-role': 'error',
        'jsx-a11y/role-has-required-aria-props': 'warn',

        // Import organization
        'import/order': [
          'warn',
          {
            groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
            'newlines-between': 'always',
            alphabetize: { order: 'asc' },
          },
        ],
        'import/no-duplicates': 'warn',

        // Moderate complexity limits
        complexity: ['warn', 15],
        'max-lines': ['warn', { max: 500, skipBlankLines: true, skipComments: true }],
        'max-lines-per-function': ['warn', { max: 100, skipBlankLines: true, skipComments: true }],
        'max-depth': ['warn', 4],
      },
    },

    // ============================================
    // PRODUCTION LINE - Strict enforcement
    // ============================================
    {
      files: [
        '**/production/**/*.{ts,tsx,js,jsx}',
        '.pipeline/production/**/*.{ts,tsx,js,jsx}',
        'src/production/**/*.{ts,tsx,js,jsx}',
        'src/lib/**/*.{ts,tsx,js,jsx}', // Graduated code
        'src/components/**/*.{ts,tsx,js,jsx}', // Main components
        'src/app/**/*.{ts,tsx,js,jsx}', // Main app code
      ],
      extends: [
        'plugin:@typescript-eslint/recommended-type-checked',
        'plugin:@typescript-eslint/strict',
        'plugin:react/recommended',
        'plugin:jsx-a11y/recommended',
        'plugin:import/recommended',
        'plugin:import/typescript',
      ],
      parserOptions: {
        project: './tsconfig.json',
      },
      rules: {
        // TypeScript - Maximum strictness
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/explicit-module-boundary-types': 'error',
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            ignoreRestSiblings: true,
          },
        ],
        '@typescript-eslint/ban-ts-comment': 'error',
        '@typescript-eslint/no-non-null-assertion': 'error',
        '@typescript-eslint/strict-boolean-expressions': 'error',
        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/no-misused-promises': 'error',
        '@typescript-eslint/await-thenable': 'error',
        '@typescript-eslint/no-unnecessary-type-assertion': 'error',
        '@typescript-eslint/prefer-nullish-coalescing': 'error',
        '@typescript-eslint/prefer-optional-chain': 'error',
        '@typescript-eslint/no-empty-function': 'error',
        '@typescript-eslint/consistent-type-imports': [
          'error',
          {
            prefer: 'type-imports',
          },
        ],

        // No console in production
        'no-console': 'error',

        // No TODO comments
        'no-warning-comments': 'error',

        // No debugger
        'no-debugger': 'error',

        // No alert
        'no-alert': 'error',

        // React strict
        'react/display-name': 'error',
        'react/jsx-no-target-blank': 'error',
        'react/jsx-key': 'error',
        'react/no-array-index-key': 'error',
        'react/no-danger': 'error',
        'react/no-unstable-nested-components': 'error',
        'react/jsx-no-useless-fragment': 'error',
        'react/jsx-pascal-case': 'error',
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'error',

        // Full accessibility
        'jsx-a11y/alt-text': 'error',
        'jsx-a11y/anchor-is-valid': 'error',
        'jsx-a11y/aria-props': 'error',
        'jsx-a11y/aria-role': 'error',
        'jsx-a11y/role-has-required-aria-props': 'error',
        'jsx-a11y/click-events-have-key-events': 'error',
        'jsx-a11y/no-static-element-interactions': 'error',
        'jsx-a11y/no-noninteractive-element-interactions': 'error',
        'jsx-a11y/label-has-associated-control': 'error',
        'jsx-a11y/media-has-caption': 'error',

        // Import strictness
        'import/order': [
          'error',
          {
            groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'type'],
            'newlines-between': 'always',
            alphabetize: { order: 'asc', caseInsensitive: true },
          },
        ],
        'import/no-duplicates': 'error',
        'import/no-cycle': 'error',
        'import/no-unused-modules': ['error', { unusedExports: true }],
        'import/no-deprecated': 'error',

        // Strict complexity limits
        complexity: ['error', 10],
        'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
        'max-lines-per-function': ['error', { max: 50, skipBlankLines: true, skipComments: true }],
        'max-depth': ['error', 3],
        'max-nested-callbacks': ['error', 3],
        'max-params': ['error', 4],

        // Code quality
        'no-nested-ternary': 'error',
        'no-unneeded-ternary': 'error',
        'prefer-const': 'error',
        'prefer-template': 'error',
        'prefer-arrow-callback': 'error',
        'arrow-body-style': ['error', 'as-needed'],
        'object-shorthand': 'error',
        'no-param-reassign': 'error',
        'no-magic-numbers': [
          'error',
          {
            ignore: [0, 1, -1],
            ignoreArrayIndexes: true,
            enforceConst: true,
          },
        ],
      },
    },

    // ============================================
    // TEST FILES - Special rules for all tests
    // ============================================
    {
      files: [
        '**/*.test.{ts,tsx,js,jsx}',
        '**/*.spec.{ts,tsx,js,jsx}',
        '**/*.e2e.{ts,tsx,js,jsx}',
        '**/tests/**/*.{ts,tsx,js,jsx}',
        '**/__tests__/**/*.{ts,tsx,js,jsx}',
      ],
      env: {
        jest: true,
      },
      rules: {
        // Allow any in tests for mocking
        '@typescript-eslint/no-explicit-any': 'off',

        // Allow non-null assertions in tests
        '@typescript-eslint/no-non-null-assertion': 'off',

        // Allow empty functions for mocks
        '@typescript-eslint/no-empty-function': 'off',

        // Allow magic numbers in tests
        'no-magic-numbers': 'off',

        // Allow console in tests
        'no-console': 'off',

        // Higher complexity allowed in test setup
        'max-lines-per-function': ['warn', { max: 150 }],
        'max-lines': ['warn', { max: 1000 }],
      },
    },

    // ============================================
    // CONFIGURATION FILES - Relaxed rules
    // ============================================
    {
      files: [
        '*.config.{js,ts}',
        '*.setup.{js,ts}',
        '.eslintrc.{js,ts}',
        'vite.config.{js,ts}',
        'tailwind.config.{js,ts}',
        'next.config.{js,ts}',
      ],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        'import/no-unused-modules': 'off',
        'no-console': 'off',
      },
    },
  ],

  // Ignore patterns
  ignorePatterns: [
    'node_modules',
    'dist',
    'build',
    '.next',
    'coverage',
    '*.min.js',
    '*.d.ts',
    'generated',
    '.sdlc/backups',
    '.pipeline/graduated',
  ],
}
