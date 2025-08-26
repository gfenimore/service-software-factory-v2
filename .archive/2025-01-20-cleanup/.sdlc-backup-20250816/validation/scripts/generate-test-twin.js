#!/usr/bin/env node

/**
 * generate-test-twin.js
 * Framework for generating test twin processors based on patterns
 */

const fs = require('fs')
const path = require('path')

// Pattern definitions for different processor types
const PROCESSOR_PATTERNS = {
  'TYPE-PROCESSOR': {
    patterns: [
      {
        name: 'NO_ANY_TYPE',
        trigger: /:\s*any\b/,
        test: 'verifies no "any" types in interfaces',
        importance: 'HIGH',
      },
      {
        name: 'EXPORTED_INTERFACES',
        trigger: /export\s+interface/,
        test: 'ensures all interfaces are exported',
        importance: 'HIGH',
      },
      {
        name: 'PROPER_NULLABILITY',
        trigger: /\|\s*null/,
        test: 'validates nullable fields use "| null" pattern',
        importance: 'MEDIUM',
      },
    ],
    ignoredPatterns: ['implementation', 'styling', 'react-specific'],
  },

  'SCAFFOLD-PROCESSOR': {
    patterns: [
      {
        name: 'COMPONENT_RENDERS',
        trigger: /export\s+function\s+\w+/,
        test: 'component renders without errors',
        importance: 'HIGH',
      },
      {
        name: 'CORRECT_NAME',
        trigger: /export\s+function\s+(\w+)/,
        test: 'component has correct export name',
        importance: 'MEDIUM',
      },
      {
        name: 'TEST_ID_PRESENT',
        trigger: /data-testid/,
        test: 'component has data-testid attribute',
        importance: 'LOW',
      },
    ],
    ignoredPatterns: ['styling', 'content', 'business-logic'],
  },

  'HOOK-PROCESSOR': {
    patterns: [
      {
        name: 'STATE_MANAGEMENT',
        trigger: /useState/,
        test: 'state updates correctly',
        importance: 'HIGH',
      },
      {
        name: 'RETURN_VALUES',
        trigger: /return\s+{/,
        test: 'hook returns expected shape',
        importance: 'HIGH',
      },
      {
        name: 'ERROR_HANDLING',
        trigger: /catch|error/i,
        test: 'handles errors gracefully',
        importance: 'MEDIUM',
      },
    ],
    ignoredPatterns: ['react-internals', 'implementation-details'],
  },

  'API-PROCESSOR': {
    patterns: [
      {
        name: 'CORRECT_ENDPOINTS',
        trigger: /fetch|axios|supabase/,
        test: 'calls correct API endpoints',
        importance: 'CRITICAL',
      },
      {
        name: 'AUTH_HEADERS',
        trigger: /Authorization|Bearer/,
        test: 'includes proper authentication',
        importance: 'CRITICAL',
      },
      {
        name: 'ERROR_RESPONSES',
        trigger: /catch|reject|error/,
        test: 'handles API errors correctly',
        importance: 'HIGH',
      },
    ],
    ignoredPatterns: ['network-implementation', 'timing'],
  },

  'MODIFY-PROCESSOR': {
    patterns: [
      {
        name: 'PRESERVES_FUNCTIONALITY',
        trigger: /function|const|class/,
        test: 'original functionality still works',
        importance: 'CRITICAL',
      },
      {
        name: 'NEW_FEATURES',
        trigger: /added|new|modified/i,
        test: 'new features work as expected',
        importance: 'HIGH',
      },
    ],
    ignoredPatterns: ['code-style', 'formatting'],
  },

  'REACT-PROCESSOR': {
    patterns: [
      {
        name: 'FINANCIAL_DATA',
        trigger: /balance|amount|price|cost|total/i,
        test: 'formats currency correctly',
        importance: 'HIGH',
      },
      {
        name: 'PII_DATA',
        trigger: /accountNumber|ssn|creditCard|taxId/i,
        test: 'masks sensitive data',
        importance: 'CRITICAL',
      },
      {
        name: 'USER_INTERACTION',
        trigger: /onClick|onChange|onSubmit/,
        test: 'handles user interactions',
        importance: 'MEDIUM',
      },
      {
        name: 'CONDITIONAL_RENDER',
        trigger: /\?.*:|&&|\|\|/,
        test: 'renders conditionally',
        importance: 'MEDIUM',
      },
      {
        name: 'ERROR_HANDLING',
        trigger: /try|catch|error/,
        test: 'handles errors gracefully',
        importance: 'HIGH',
      },
    ],
    ignoredPatterns: ['react-internals', 'styling', 'component-existence'],
  },
}

class TestTwinGenerator {
  constructor(processorName) {
    this.processorName = processorName
    this.patterns = PROCESSOR_PATTERNS[processorName] || { patterns: [], ignoredPatterns: [] }
    this.timestamp = new Date().toISOString()
  }

  generateHeader() {
    return `# ${this.processorName}-TEST v1.0
Generated: ${this.timestamp}

You are ${this.processorName}-TEST, the test twin of ${this.processorName}.

## Your SINGLE Responsibility
Create focused tests for the output of ${this.processorName}.
`
  }

  generatePatternSection() {
    let section = `\n## What You Test\n`

    this.patterns.patterns.forEach((pattern, index) => {
      section += `${index + 1}. **${pattern.name}**: ${pattern.test}\n`
    })

    return section
  }

  generateIgnoredSection() {
    let section = `\n## What You IGNORE\n`

    this.patterns.ignoredPatterns.forEach((ignored) => {
      section += `- ${ignored}\n`
    })

    return section
  }

  generateDecisionTree() {
    let tree = `\n## Deterministic Pattern Recognition

### Decision Tree (Boolean Logic)
\`\`\`yaml
SCAN output for patterns:
`

    this.patterns.patterns.forEach((pattern, index) => {
      tree += `
${index + 1}. ${pattern.name}_CHECK:
   IF contains (${pattern.trigger}) THEN
     → GENERATE ${pattern.name.toLowerCase()}_test
     → Priority: ${pattern.importance}
`
    })

    tree += `\`\`\`\n`
    return tree
  }

  generateExampleTests() {
    const testExamples = {
      'TYPE-PROCESSOR': `
\`\`\`typescript
describe('Type Definitions', () => {
  test('no any types present', () => {
    const typeFile = fs.readFileSync('output.types.ts', 'utf8');
    expect(typeFile).not.toMatch(/:\\s*any\\b/);
  });
  
  test('all interfaces exported', () => {
    const interfaces = typeFile.match(/interface\\s+\\w+/g);
    const exports = typeFile.match(/export\\s+interface\\s+\\w+/g);
    expect(exports.length).toBe(interfaces.length);
  });
});
\`\`\``,

      'SCAFFOLD-PROCESSOR': `
\`\`\`typescript
describe('Component Structure', () => {
  test('component renders', () => {
    render(<Component />);
    expect(screen.getByTestId('component')).toBeInTheDocument();
  });
  
  test('exports correct name', () => {
    expect(Component.name).toBe('Component');
  });
});
\`\`\``,

      'HOOK-PROCESSOR': `
\`\`\`typescript
describe('Hook Behavior', () => {
  test('returns expected shape', () => {
    const { result } = renderHook(() => useCustomHook());
    expect(result.current).toHaveProperty('state');
    expect(result.current).toHaveProperty('setState');
  });
  
  test('updates state correctly', () => {
    const { result } = renderHook(() => useCustomHook());
    act(() => result.current.setState('new'));
    expect(result.current.state).toBe('new');
  });
});
\`\`\``,

      'API-PROCESSOR': `
\`\`\`typescript
describe('API Integration', () => {
  test('calls correct endpoint', async () => {
    const spy = jest.spyOn(global, 'fetch');
    await fetchData();
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('/api/data')
    );
  });
  
  test('includes auth headers', async () => {
    await fetchData();
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: expect.stringMatching(/Bearer/)
        })
      })
    );
  });
});
\`\`\``,

      'REACT-PROCESSOR': `
\`\`\`typescript
describe('Business Logic', () => {
  test('masks account number', () => {
    render(<AccountCard account={{accountNumber: '1234567890'}} />);
    expect(screen.getByText('****7890')).toBeInTheDocument();
    expect(screen.queryByText('1234567890')).not.toBeInTheDocument();
  });
  
  test('formats currency', () => {
    render(<AccountCard account={{balance: 1234.56}} />);
    expect(screen.getByText('$1,234.56')).toBeInTheDocument();
  });
});
\`\`\``,
    }

    return `\n## Example Tests\n${testExamples[this.processorName] || testExamples['REACT-PROCESSOR']}`
  }

  generateQualityGates() {
    return `
## Quality Gates

✓ Tests business logic/structure ONLY
✓ No boilerplate tests
✓ Clear test names explaining the rule
✓ Tests prevent real defects
✓ < 50 lines per test file

## Boolean Evaluation Summary
After scanning output, answer:
${this.patterns.patterns.map((p, i) => `${i + 1}. Found ${p.name} pattern? Y/N`).join('\n')}

IF all answers are N THEN
  OUTPUT: "// No ${this.processorName.toLowerCase()} tests required"
ELSE
  GENERATE only tests for Y answers
`
  }

  generateIntegration() {
    return `
## Integration with Pipeline

\`\`\`bash
# Automatically invoked after ${this.processorName}
if [ "$PROCESSOR" = "${this.processorName}" ]; then
    run_processor "${this.processorName}-TEST" "$TASK"
fi
\`\`\`
`
  }

  generate() {
    let content = this.generateHeader()
    content += this.generatePatternSection()
    content += this.generateIgnoredSection()
    content += this.generateDecisionTree()
    content += this.generateExampleTests()
    content += this.generateQualityGates()
    content += this.generateIntegration()

    return content
  }

  saveToFile(outputDir = '.sdlc/01-core/A-agents/processors/test-twins') {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    const filename = `${this.processorName.toLowerCase()}-test.md`
    const filepath = path.join(outputDir, filename)

    fs.writeFileSync(filepath, this.generate())
    console.log(`✓ Generated ${filename}`)

    return filepath
  }
}

// Main execution
function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log('Test Twin Generator')
    console.log('===================\n')
    console.log('Usage: node generate-test-twin.js [processor-name] [output-dir]')
    console.log('\nAvailable processors:')
    Object.keys(PROCESSOR_PATTERNS).forEach((p) => console.log(`  - ${p}`))
    console.log('\nGenerating all test twins...\n')

    // Generate all test twins
    Object.keys(PROCESSOR_PATTERNS).forEach((processorName) => {
      const generator = new TestTwinGenerator(processorName)
      generator.saveToFile()
    })

    console.log('\n✅ All test twins generated successfully!')
  } else {
    const processorName = args[0]
    const outputDir = args[1] || '.sdlc/01-core/A-agents/processors/test-twins'

    if (!PROCESSOR_PATTERNS[processorName]) {
      console.error(`Error: Unknown processor "${processorName}"`)
      console.log('Available processors:', Object.keys(PROCESSOR_PATTERNS).join(', '))
      process.exit(1)
    }

    const generator = new TestTwinGenerator(processorName)
    const filepath = generator.saveToFile(outputDir)
    console.log(`Test twin generated: ${filepath}`)
  }
}

if (require.main === module) {
  main()
}

module.exports = { TestTwinGenerator, PROCESSOR_PATTERNS }
