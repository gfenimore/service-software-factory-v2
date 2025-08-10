module.exports = {
  extends: ['./.eslintrc.json'],
  overrides: [
    {
      // Rules for all processor-generated components
      files: ['**/components/**/*.tsx', '**/components/**/*.ts'],
      rules: {
        // Allow unused parameters in function signatures
        '@typescript-eslint/no-unused-vars': ['error', {
          args: 'none',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true
        }]
      }
    },
    {
      // Rules for all processor-generated type files
      files: ['**/*.types.ts'],
      rules: {
        // Allow empty interfaces (for future extension)
        '@typescript-eslint/no-empty-object-type': 'off',
        // Allow unused type imports
        '@typescript-eslint/no-unused-vars': 'off'
      }
    },
    {
      // Rules for scaffold outputs specifically
      files: ['**/*Works*.tsx', '**/*Works*.ts'],
      rules: {
        // These files are intentionally incomplete
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-empty-function': 'off'
      }
    }
  ]
};
