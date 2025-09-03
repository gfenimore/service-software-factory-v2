/**
 * PRD Parser - Extracts functional requirements and specifications from PRD markdown files
 * Implements FR-002: PRD Parsing and Structure Analysis
 */

class PrdParser {
    constructor() {
        this.prdStructure = {
            metadata: {},
            functionalRequirements: [],
            technicalRequirements: [],
            apiSpecs: [],
            configParameters: [],
            acceptance: []
        };
    }

    /**
     * Parse a complete PRD file and extract structured data
     * @param {string} prdContent - Raw markdown content of PRD
     * @returns {Object} Structured PRD data
     */
    parsePRD(prdContent) {
        const result = {
            metadata: this.extractMetadata(prdContent),
            functionalRequirements: this.extractFunctionalRequirements(prdContent),
            technicalRequirements: this.extractTechnicalRequirements(prdContent),
            apiSpecs: this.extractApiSpecs(prdContent),
            configParameters: this.extractConfigParameters(prdContent),
            acceptance: this.extractAcceptanceCriteria(prdContent)
        };

        return result;
    }

    /**
     * Extract PRD metadata (ID, version, status, etc.)
     */
    extractMetadata(content) {
        const metadata = {};
        const metadataSection = this.extractSection(content, 'Document Info');
        
        if (metadataSection) {
            const lines = metadataSection.split('\n');
            for (const line of lines) {
                const match = line.match(/^-\s*\*\*([^*]+)\*\*:\s*(.+)/);
                if (match) {
                    const key = match[1].toLowerCase().replace(/\s+/g, '_');
                    metadata[key] = match[2].trim();
                }
            }
        }

        return metadata;
    }

    /**
     * Extract functional requirements (FR-XXX sections)
     */
    extractFunctionalRequirements(content) {
        const requirements = [];
        const frPattern = /### (FR-\d+): ([^\n]+)\n((?:(?!###).|\n)*)/g;
        
        let match;
        while ((match = frPattern.exec(content)) !== null) {
            const [, id, title, body] = match;
            
            const requirement = {
                id: id,
                title: title.trim(),
                description: this.extractRequirementField(body, 'Requirement'),
                details: this.extractRequirementField(body, 'Details'),
                acceptanceCriteria: this.extractAcceptanceCriteriaFromBody(body),
                functions: this.extractExpectedFunctions(body),
                apiEndpoints: this.extractExpectedEndpoints(body),
                configParams: this.extractExpectedConfig(body)
            };

            requirements.push(requirement);
        }

        return requirements;
    }

    /**
     * Extract technical requirements (TR-XXX sections)
     */
    extractTechnicalRequirements(content) {
        const requirements = [];
        const trPattern = /### (TR-\d+): ([^\n]+)\n((?:(?!###).|\n)*)/g;
        
        let match;
        while ((match = trPattern.exec(content)) !== null) {
            const [, id, title, body] = match;
            
            requirements.push({
                id: id,
                title: title.trim(),
                requirement: this.extractRequirementField(body, 'Requirement'),
                specifications: this.extractTechnicalSpecs(body),
                supportedFormats: this.extractSupportedFormats(body),
                performanceTargets: this.extractPerformanceTargets(body)
            });
        }

        return requirements;
    }

    /**
     * Extract API specifications from PRD
     */
    extractApiSpecs(content) {
        const apiSpecs = [];
        
        // Look for code blocks that define API endpoints
        const codeBlockPattern = /```(?:bash|javascript|json)?\n([\s\S]*?)\n```/g;
        let match;
        
        while ((match = codeBlockPattern.exec(content)) !== null) {
            const codeContent = match[1];
            
            // Check if it contains API endpoint patterns
            const endpointPattern = /(GET|POST|PUT|DELETE|PATCH)\s+([^\s\n]+)/g;
            let endpointMatch;
            
            while ((endpointMatch = endpointPattern.exec(codeContent)) !== null) {
                apiSpecs.push({
                    method: endpointMatch[1],
                    endpoint: endpointMatch[2],
                    context: this.findNearestSection(content, match.index)
                });
            }

            // Also check for function call patterns that might be APIs
            const functionCallPattern = /(\w+)\s*\(\s*['"]([^'"]+)['"].*\)/g;
            let funcMatch;
            
            while ((funcMatch = functionCallPattern.exec(codeContent)) !== null) {
                if (funcMatch[2].includes('/') || funcMatch[2].includes('api')) {
                    apiSpecs.push({
                        type: 'function_call',
                        name: funcMatch[1],
                        path: funcMatch[2],
                        context: this.findNearestSection(content, match.index)
                    });
                }
            }
        }

        return apiSpecs;
    }

    /**
     * Extract configuration parameters
     */
    extractConfigParameters(content) {
        const configs = [];
        
        // Look for JSON configuration examples
        const jsonPattern = /```json\n([\s\S]*?)\n```/g;
        let match;
        
        while ((match = jsonPattern.exec(content)) !== null) {
            try {
                const configObj = JSON.parse(match[1]);
                const context = this.findNearestSection(content, match.index);
                
                configs.push({
                    context: context,
                    structure: this.flattenConfigStructure(configObj),
                    example: configObj
                });
            } catch (e) {
                // Invalid JSON, skip
            }
        }

        return configs;
    }

    /**
     * Extract acceptance criteria from various sections
     */
    extractAcceptanceCriteria(content) {
        const criteria = [];
        
        // Look for explicit acceptance criteria sections
        const acceptancePattern = /- \*\*Acceptance Criteria\*\*:\n((?:\s*- .+\n?)*)/g;
        let match;
        
        while ((match = acceptancePattern.exec(content)) !== null) {
            const criteriaList = match[1]
                .split('\n')
                .filter(line => line.trim().startsWith('- '))
                .map(line => line.trim().substring(2));
            
            criteria.push(...criteriaList);
        }

        return criteria;
    }

    /**
     * Helper methods
     */
    extractSection(content, sectionName) {
        const pattern = new RegExp(`## ${sectionName}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`, 'i');
        const match = content.match(pattern);
        return match ? match[1].trim() : null;
    }

    extractRequirementField(body, fieldName) {
        const pattern = new RegExp(`- \\*\\*${fieldName}\\*\\*:\\s*(.+?)(?=\\n- |$)`, 's');
        const match = body.match(pattern);
        return match ? match[1].trim() : '';
    }

    extractAcceptanceCriteriaFromBody(body) {
        const criteria = [];
        const pattern = /- \*\*Acceptance Criteria\*\*:\s*\n((?:\s*- .+\n?)*)/;
        const match = body.match(pattern);
        
        if (match) {
            const criteriaText = match[1];
            const lines = criteriaText.split('\n').filter(line => line.trim().startsWith('- '));
            criteria.push(...lines.map(line => line.trim().substring(2)));
        }

        return criteria;
    }

    extractExpectedFunctions(body) {
        const functions = [];
        const functionPattern = /(\w+)\s*\([^)]*\)/g;
        let match;
        
        while ((match = functionPattern.exec(body)) !== null) {
            // Filter out common words that might match the pattern
            const functionName = match[1];
            if (functionName.length > 3 && /^[a-z]/.test(functionName)) {
                functions.push({
                    name: functionName,
                    signature: match[0]
                });
            }
        }

        return functions;
    }

    extractExpectedEndpoints(body) {
        const endpoints = [];
        const endpointPattern = /(GET|POST|PUT|DELETE|PATCH)\s+([^\s\n]+)/g;
        let match;
        
        while ((match = endpointPattern.exec(body)) !== null) {
            endpoints.push({
                method: match[1],
                path: match[2]
            });
        }

        return endpoints;
    }

    extractExpectedConfig(body) {
        const configs = [];
        const configPattern = /(\w+):\s*([^,\n]+)/g;
        let match;
        
        while ((match = configPattern.exec(body)) !== null) {
            const key = match[1];
            const value = match[2].trim();
            
            // Only include if it looks like a configuration parameter
            if (key.length > 2 && !key.match(/^(if|and|or|the|for|with)$/i)) {
                configs.push({
                    key: key,
                    expectedValue: value
                });
            }
        }

        return configs;
    }

    extractTechnicalSpecs(body) {
        const specs = [];
        const lines = body.split('\n');
        
        for (const line of lines) {
            if (line.trim().startsWith('- ') && !line.includes('**')) {
                specs.push(line.trim().substring(2));
            }
        }

        return specs;
    }

    extractSupportedFormats(body) {
        const formats = [];
        const formatPattern = /\.(\w+)/g;
        let match;
        
        while ((match = formatPattern.exec(body)) !== null) {
            const ext = match[1].toLowerCase();
            if (['js', 'ts', 'jsx', 'tsx', 'json', 'yaml', 'yml', 'md'].includes(ext)) {
                if (!formats.includes(ext)) {
                    formats.push(ext);
                }
            }
        }

        return formats;
    }

    extractPerformanceTargets(body) {
        const targets = [];
        const targetPattern = /(\d+)\+?\s*(files?|seconds?|minutes?|ms|PRDs?)/g;
        let match;
        
        while ((match = targetPattern.exec(body)) !== null) {
            targets.push({
                value: parseInt(match[1]),
                unit: match[2],
                context: this.extractLineContext(body, match.index)
            });
        }

        return targets;
    }

    findNearestSection(content, index) {
        const beforeContent = content.substring(0, index);
        const sectionPattern = /### ([^\n]+)$/gm;
        let lastMatch = null;
        let match;
        
        while ((match = sectionPattern.exec(beforeContent)) !== null) {
            lastMatch = match[1];
        }
        
        return lastMatch || 'Unknown Section';
    }

    extractLineContext(content, index) {
        const lines = content.substring(0, index).split('\n');
        return lines[lines.length - 1] || '';
    }

    flattenConfigStructure(obj, prefix = '') {
        const flattened = [];
        
        for (const [key, value] of Object.entries(obj)) {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            
            if (typeof value === 'object' && !Array.isArray(value)) {
                flattened.push(...this.flattenConfigStructure(value, fullKey));
            } else {
                flattened.push({
                    key: fullKey,
                    type: Array.isArray(value) ? 'array' : typeof value,
                    example: value
                });
            }
        }
        
        return flattened;
    }

    /**
     * Map PRD sections to implementation categories
     */
    mapPRDToImplementation(prdData) {
        const mapping = {
            functions: [],
            apis: [],
            configurations: [],
            requirements: []
        };

        // Extract expected functions from all functional requirements
        for (const fr of prdData.functionalRequirements) {
            mapping.functions.push(...fr.functions);
            mapping.apis.push(...fr.apiEndpoints);
            mapping.configurations.push(...fr.configParams);
            mapping.requirements.push({
                id: fr.id,
                title: fr.title,
                acceptance: fr.acceptanceCriteria
            });
        }

        // Add API specs and config parameters
        mapping.apis.push(...prdData.apiSpecs);
        mapping.configurations.push(...prdData.configParameters.flatMap(c => c.structure));

        return mapping;
    }
}

module.exports = { PrdParser };