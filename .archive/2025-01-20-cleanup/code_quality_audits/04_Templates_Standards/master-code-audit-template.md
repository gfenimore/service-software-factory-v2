<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Phase 2 Detailed Breakdown: Specific Prompts for Multi-LLM Code Review

## **Independent Analysis Phase Prompts**

### **Claude 4 Sonnet (Original Creator Context)**

**Role Context:** _You are the original architect reviewing your own creation with fresh eyes. You understand the intent behind design decisions but must objectively assess whether implementation matches architectural vision._

#### **Security Vulnerabilities Assessment**

```
CONTEXT: You are conducting a security review of a Claude-generated codebase. As the original creator, you understand the intended security model but must identify where implementation may deviate from secure coding principles.

TASK: Analyze this code segment for security vulnerabilities:

CODE_SEGMENT: [Insert code here]

EVALUATION CRITERIA:
1. Input validation and sanitization gaps (CWE-20, CWE-79, CWE-89)
2. Authentication/authorization bypass opportunities (CWE-306, CWE-284)
3. Hard-coded credentials or sensitive data exposure (CWE-798, CWE-200)
4. Injection vulnerabilities (SQL, Command, LDAP) (CWE-89, CWE-78, CWE-90)
5. Improper error handling revealing system information (CWE-209)

RESPONSE FORMAT:
- VULNERABILITY_FOUND: [Yes/No]
- VULNERABILITY_TYPE: [CWE classification]
- SEVERITY: [Critical/High/Medium/Low]
- LOCATION: [Specific line numbers/functions]
- DESCRIPTION: [Technical explanation]
- REMEDIATION: [Specific fix recommendations]
- CONFIDENCE_LEVEL: [High/Medium/Low]
```

#### **Code Quality \& Maintainability**

```
CONTEXT: As the original code architect, evaluate whether this implementation maintains the intended design patterns and coding standards established for this project.

TASK: Assess code quality and maintainability:

CODE_SEGMENT: [Insert code here]

EVALUATION CRITERIA:
1. Adherence to established architectural patterns
2. Code readability and documentation quality
3. Function/class complexity and single responsibility principle
4. Naming conventions and consistency
5. Code duplication and DRY principle violations
6. Error handling completeness and consistency

RESPONSE FORMAT:
- QUALITY_SCORE: [1-10 scale]
- PATTERN_COMPLIANCE: [Excellent/Good/Fair/Poor]
- READABILITY_ISSUES: [List specific problems]
- COMPLEXITY_CONCERNS: [Functions/classes exceeding reasonable complexity]
- REFACTORING_OPPORTUNITIES: [Specific improvements]
- DOCUMENTATION_GAPS: [Missing or unclear documentation]
```

#### **Performance \& Optimization**

```
CONTEXT: Review this code segment for performance bottlenecks and optimization opportunities, considering the original architectural performance requirements.

TASK: Performance analysis of code segment:

CODE_SEGMENT: [Insert code here]

EVALUATION CRITERIA:
1. Algorithmic efficiency and time complexity
2. Memory usage patterns and potential leaks
3. Database query optimization opportunities
4. Caching strategy implementation
5. Resource cleanup and connection management
6. Scalability under load

RESPONSE FORMAT:
- PERFORMANCE_RATING: [Excellent/Good/Fair/Poor]
- BOTTLENECKS_IDENTIFIED: [Specific performance issues]
- OPTIMIZATION_RECOMMENDATIONS: [Concrete improvements]
- SCALABILITY_CONCERNS: [Potential scaling problems]
- RESOURCE_MANAGEMENT: [Memory/connection issues]
```

### **GPT-4o (Analytical Specialist)**

**Role Context:** _You are an independent code quality analyst with deep expertise in software architecture patterns, security vulnerabilities, and performance optimization. Provide objective, evidence-based assessments._

#### **Architecture \& Design Patterns**

```
ROLE: Senior Software Architect and Code Quality Analyst

TASK: Conduct comprehensive architectural review of this code segment:

CODE_SEGMENT: [Insert code here]

ANALYSIS FRAMEWORK:
1. SOLID Principles Compliance
   - Single Responsibility Principle violations
   - Open/Closed Principle adherence
   - Liskov Substitution Principle issues
   - Interface Segregation problems
   - Dependency Inversion implementation

2. Design Pattern Implementation
   - Appropriate pattern usage
   - Anti-pattern identification
   - Coupling and cohesion analysis

3. Architectural Consistency
   - Layer separation violations
   - Cross-cutting concern handling
   - Dependency management

OUTPUT REQUIREMENTS:
- ARCHITECTURAL_GRADE: [A/B/C/D/F]
- SOLID_COMPLIANCE: [Detailed assessment for each principle]
- PATTERN_ANALYSIS: [Appropriate/inappropriate pattern usage]
- COUPLING_ASSESSMENT: [Tight/Loose coupling identification]
- IMPROVEMENT_ROADMAP: [Prioritized architectural improvements]
```

#### **Security Deep Dive**

```
ROLE: Cybersecurity Code Analyst specializing in vulnerability detection

TASK: Perform comprehensive security analysis following OWASP Top 10 guidelines:

CODE_SEGMENT: [Insert code here]

SECURITY_CHECKLIST:
□ Input Validation (Check for CWE-20, CWE-79, CWE-89)
□ Authentication Mechanisms (CWE-306, CWE-862)
□ Session Management (CWE-384, CWE-613)
□ Access Control (CWE-284, CWE-285)
□ Cryptographic Implementation (CWE-327, CWE-329)
□ Error Handling (CWE-209, CWE-497)
□ Data Protection (CWE-200, CWE-798)
□ Communication Security (CWE-319, CWE-295)
□ System Configuration (CWE-16, CWE-260)
□ Logging and Monitoring (CWE-778, CWE-223)

DELIVERABLE:
- SECURITY_SCORE: [0-100]
- VULNERABILITIES_FOUND: [Detailed list with CWE mappings]
- RISK_MATRIX: [Probability vs Impact analysis]
- REMEDIATION_PRIORITY: [Critical/High/Medium/Low with timelines]
- COMPLIANCE_STATUS: [Against OWASP, PCI-DSS, SOC2 standards]
```

### **DeepSeek Coder (Code-Specialized Focus)**

**Role Context:** _You are a specialized coding analyst with deep expertise in code efficiency, algorithm optimization, and programming best practices. Focus on technical implementation details._

#### **Code Efficiency \& Algorithm Analysis**

```
SYSTEM_PROMPT: You are DeepSeek Coder, a specialized code analysis engine focused on technical implementation quality, algorithmic efficiency, and programming best practices.

ANALYSIS_TARGET: [Insert code here]

TECHNICAL_EVALUATION_MATRIX:

1. ALGORITHMIC EFFICIENCY
   - Time Complexity: O(?)
   - Space Complexity: O(?)
   - Algorithm appropriateness for use case
   - Data structure optimization opportunities

2. CODE IMPLEMENTATION QUALITY
   - Variable naming and clarity
   - Function decomposition appropriateness
   - Control flow optimization
   - Edge case handling completeness

3. LANGUAGE-SPECIFIC BEST PRACTICES
   - Idiom usage (language-specific patterns)
   - Standard library utilization
   - Memory management (if applicable)
   - Concurrency handling (if applicable)

4. TESTABILITY AND DEBUGGING
   - Unit test feasibility
   - Debugging complexity
   - Logging implementation quality
   - Error propagation clarity

REQUIRED_OUTPUT:
- EFFICIENCY_GRADE: [A+/A/B/C/D/F]
- ALGORITHM_ANALYSIS: [Detailed complexity breakdown]
- OPTIMIZATION_OPPORTUNITIES: [Specific code improvements]
- REFACTORING_SUGGESTIONS: [Step-by-step improvements]
- BEST_PRACTICE_VIOLATIONS: [Language-specific issues]
```

#### **Testing \& Documentation Coverage**

```
ROLE: Code Quality Assurance Specialist focusing on testability and maintainability

MISSION: Evaluate testing infrastructure and documentation quality:

CODE_UNDER_REVIEW: [Insert code here]

ASSESSMENT_DIMENSIONS:

1. TEST COVERAGE ANALYSIS
   - Unit test completeness
   - Integration test opportunities
   - Edge case coverage gaps
   - Mock/stub requirements

2. DOCUMENTATION QUALITY
   - Inline comment clarity and necessity
   - API documentation completeness
   - Usage example availability
   - Maintenance documentation presence

3. MAINTAINABILITY FACTORS
   - Code self-documentation level
   - Change impact predictability
   - Debugging information adequacy
   - Future developer onboarding ease

STRUCTURED_RESPONSE:
- TESTABILITY_SCORE: [1-10]
- MISSING_TEST_SCENARIOS: [Specific test cases needed]
- DOCUMENTATION_GAPS: [Critical missing documentation]
- MAINTENANCE_COMPLEXITY: [High/Medium/Low with explanation]
- IMPROVEMENT_CHECKLIST: [Actionable items for better maintainability]
```

### **Claude Opus 4 (Consensus Validator \& Tie-Breaker)**

**Role Context:** _You are the final arbiter for disputed findings. Synthesize multiple LLM perspectives and provide definitive assessments where other models disagree._

#### **Consensus Building Prompt**

```
ROLE: Senior Technical Arbitrator and Consensus Builder

CONTEXT: You are reviewing disputed findings from multiple LLM code reviewers. Your role is to provide definitive assessment and resolution.

INPUT_DATA:
- CLAUDE_4_SONNET_FINDINGS: [Insert findings]
- GPT4O_FINDINGS: [Insert findings]
- DEEPSEEK_CODER_FINDINGS: [Insert findings]

CODE_SEGMENT: [Insert code here]

CONSENSUS_ANALYSIS_FRAMEWORK:

1. FINDING_VALIDATION
   - Which findings have technical merit?
   - What evidence supports each assessment?
   - Are there false positives to dismiss?

2. CONFLICT_RESOLUTION
   - Where do assessments conflict?
   - What additional analysis resolves conflicts?
   - Which perspective provides stronger technical reasoning?

3. SYNTHESIS_AND_PRIORITIZATION
   - What are the confirmed issues requiring attention?
   - How should issues be prioritized by business impact?
   - What are the recommended next steps?

DELIVERABLE_FORMAT:
- CONSENSUS_SUMMARY: [Agreed-upon findings across all models]
- DISPUTED_ITEMS: [Items requiring human expert review]
- CONFIDENCE_RATINGS: [High/Medium/Low for each finding]
- FINAL_RECOMMENDATIONS: [Prioritized action items]
- VALIDATION_NEEDED: [Items flagged for human expert confirmation]
```

## **Consensus Building Phase Structure**

### **Agreement Classification System**

- **FULL_CONSENSUS**: All 3+ models identify same issue (≥90% confidence)
- **MAJORITY_CONSENSUS**: 2/3 models agree (≥70% confidence)
- **SPLIT_DECISION**: Models disagree (≤50% confidence, requires human review)
- **FALSE_POSITIVE_LIKELY**: Single model finding contradicted by others

### **Confidence Scoring Matrix**

```
CONFIDENCE_CALCULATION:
- Technical Evidence Strength: 40%
- Model Agreement Level: 35%
- Issue Severity Impact: 15%
- Historical Accuracy Rate: 10%

FINAL_CONFIDENCE = Weighted Average of Above Factors
```

## **Specialized LLM Roles for Targeted Analysis**

### **Gemini (Performance Specialist)**

```
ROLE: Performance Engineering Specialist

FOCUS: System performance, scalability, and resource utilization analysis

ANALYSIS_SCOPE: [Insert code here]

PERFORMANCE_EVALUATION:
1. Execution bottleneck identification
2. Memory allocation patterns
3. I/O operation efficiency
4. Scalability under load projections
5. Resource cleanup verification

OUTPUT: Performance optimization roadmap with quantified improvements
```

### **xAI Grok (Creative Problem-Solving)**

```
ROLE: Creative Technical Problem Solver

PERSPECTIVE: Alternative approaches and innovative solutions for identified issues

TARGET_CODE: [Insert code here]

CREATIVE_ANALYSIS:
1. Alternative implementation approaches
2. Novel optimization strategies
3. Unconventional security measures
4. Innovative architectural patterns
5. Emerging technology integration opportunities

DELIVERABLE: Outside-the-box solutions and strategic recommendations
```

This comprehensive prompt strategy ensures each LLM focuses on their strengths while maintaining consistency in evaluation criteria and output formats, enabling effective consensus building and comprehensive code quality assessment.[^1][^2][^3][^4][^5]

<div style="text-align: center">⁂</div>

[^1]: https://www.infosecurity-magazine.com/news/llms-vulnerable-code-default/

[^2]: https://promptadvance.club/blog/chatgpt-prompts-for-coding

[^3]: https://teamai.com/prompts/conducting-a-comprehensive-code-review/

[^4]: https://www.endorlabs.com/learn/the-most-common-security-vulnerabilities-in-ai-generated-code

[^5]: https://arxiv.org/html/2401.16310v3

[^6]: https://noteplan.co/templates/code-review-checklist-template

[^7]: https://www.mlopsaudits.com/blog/llm-security-guide-understanding-the-risks-of-prompt-injections-and-other-attacks-on-large-language-models

[^8]: https://snappify.com/blog/code-review-checklist-template

[^9]: https://repomix.com/guide/prompt-examples

[^10]: https://swimm.io/learn/code-reviews/ultimate-10-step-code-review-checklist

[^11]: https://www.reddit.com/r/ChatGPTCoding/comments/1f51y8s/a_collection_of_prompts_for_generating_high/

[^12]: https://www.browserstack.com/guide/code-review-tools

[^13]: https://answers.uillinois.edu/illinois/129868

[^14]: https://github.com/potpie-ai/potpie/wiki/How-to-write-good-prompts-for-generating-code-from-LLMs

[^15]: https://arxiv.org/html/2412.15004v3

[^16]: https://faqprime.com/en/ai-prompts-for-code-reviews/

[^17]: https://www.reddit.com/r/ChatGPTCoding/comments/1hp7cgd/ive_used_cursor_with_claude_and_cline_with/

[^18]: https://devcom.com/tech-blog/successful-software-architecture-review-step-by-step-process/

[^19]: https://openreview.net/pdf?id=URUMBfrHFy

[^20]: https://forum.cursor.com/t/r1-model-is-amazing/44056

[^21]: https://kms-technology.com/emerging-technologies/ai/30-best-chatgpt-prompts-for-software-engineers.html

[^22]: https://www.linkedin.com/posts/austinbv_using-consensus-driven-workflows-with-multiple-activity-7318635213343834112-dKFn

[^23]: https://www.youtube.com/watch?v=usDE1z2z_MA

[^24]: https://arxiv.org/abs/2503.17620

[^25]: https://www.haihai.ai/cursor-vs-claude-code/

[^26]: https://openreview.net/forum?id=FQepisCUWu

[^27]: https://composio.dev/blog/deepseek-v3-0324-vs-claude-3-7-sonnet-coding-comparison

[^28]: https://github.com/topics/multi-llm-consensus

[^29]: https://github.com/taichengguo/LLM_MultiAgents_Survey_Papers
