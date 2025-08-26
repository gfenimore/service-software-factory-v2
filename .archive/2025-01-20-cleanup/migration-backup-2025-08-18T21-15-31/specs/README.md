# Pipeline Specifications

This directory contains the specifications for the software factory pipeline.

## Directory Structure

```
specs/
├── README.md                    # This file
├── requirements/               # Business and technical requirements
│   ├── factory-requirements.md
│   └── processor-requirements.md
├── architecture/              # Technical architecture docs
│   ├── pipeline-architecture.md
│   └── processor-contracts.md
├── processors/                # Individual processor specs
│   ├── EXTRACT-PROCESSOR.spec.md
│   ├── COMPONENT-GENERATOR.spec.md
│   ├── ASSEMBLY-PROCESSOR.spec.md
│   └── ENHANCEMENT-PROCESSOR.spec.md
├── test-cases/               # Test scenarios and validation
│   └── master-view-test.md
└── lessons-learned/          # Retrospectives and improvements
    └── attempt-1-retrospective.md
```

## Key Documents

1. **Factory Requirements** - What the factory must accomplish
2. **Processor Contracts** - How processors communicate
3. **Pipeline Architecture** - How everything fits together
4. **Test Cases** - How we validate success

## Success Criteria

A successful pipeline run means:
1. The output LOOKS like the input (visual fidelity)
2. The output WORKS like the input (functional parity)
3. The output is BETTER than the input (progressive enhancement)

## Current Status

🔴 **FAILED** - Generated app doesn't match concept visually or functionally

## Next Steps

1. Document what went wrong
2. Define clearer specifications
3. Rebuild with validation at each step