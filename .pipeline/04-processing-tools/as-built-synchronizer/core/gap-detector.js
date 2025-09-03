/**
 * Gap Detector - Identifies mismatches between PRD requirements and actual implementation
 * Implements FR-003: Gap Detection and Analysis
 */

class GapDetector {
    constructor() {
        this.gapTypes = {
            MISSING_FROM_PRD: 'Implementation exists but not documented in PRD',
            MISSING_FROM_IMPL: 'PRD specifies feature not implemented',
            PARAMETER_MISMATCH: 'Function parameters differ between PRD and implementation',
            TYPE_MISMATCH: 'Data types differ between PRD and implementation',
            BEHAVIORAL_DIFFERENCE: 'Expected behavior differs from implementation'
        };

        this.severityLevels = {
            HIGH: 'Critical gap requiring immediate attention',
            MEDIUM: 'Important gap that should be addressed soon',
            LOW: 'Minor gap for future consideration'
        };
    }

    /**
     * Analyze gaps between PRD and implementation
     * @param {Object} prdData - Parsed PRD structure
     * @param {Object} implData - Analyzed implementation structure
     * @returns {Object} Gap analysis results
     */
    analyzeGaps(prdData, implData) {
        const gaps = [];
        const matches = [];
        
        // Analyze function gaps
        const functionAnalysis = this.analyzeFunctionGaps(prdData, implData);
        gaps.push(...functionAnalysis.gaps);
        matches.push(...functionAnalysis.matches);

        // Analyze API endpoint gaps
        const apiAnalysis = this.analyzeApiGaps(prdData, implData);
        gaps.push(...apiAnalysis.gaps);
        matches.push(...apiAnalysis.matches);

        // Analyze configuration gaps
        const configAnalysis = this.analyzeConfigGaps(prdData, implData);
        gaps.push(...configAnalysis.gaps);
        matches.push(...configAnalysis.matches);

        // Calculate alignment score
        const totalRequirements = this.countTotalRequirements(prdData);
        const totalImplemented = matches.length;
        const alignmentScore = totalRequirements > 0 ? Math.round((totalImplemented / totalRequirements) * 100) : 0;

        return {
            alignmentScore,
            totalRequirements,
            totalImplemented,
            gapCount: gaps.length,
            gaps: this.prioritizeGaps(gaps),
            matches,
            summary: this.generateSummary(gaps, matches, alignmentScore)
        };
    }

    /**
     * Analyze gaps in function implementations
     */
    analyzeFunctionGaps(prdData, implData) {
        const gaps = [];
        const matches = [];
        
        const expectedFunctions = this.extractExpectedFunctions(prdData);
        const implementedFunctions = implData.functions || [];

        // Check for missing implementations
        for (const expectedFunc of expectedFunctions) {
            const match = this.findFunctionMatch(expectedFunc, implementedFunctions);
            
            if (!match) {
                gaps.push({
                    type: this.gapTypes.MISSING_FROM_IMPL,
                    category: 'function',
                    severity: 'HIGH',
                    prdRequirement: expectedFunc.source,
                    expectedName: expectedFunc.name,
                    expectedSignature: expectedFunc.signature,
                    message: `Function '${expectedFunc.name}' specified in PRD but not implemented`,
                    suggestedFix: `Implement function ${expectedFunc.signature} in ${this.suggestImplementationFile(expectedFunc, implData)}`
                });
            } else {
                // Check for parameter mismatches
                const parameterCheck = this.compareParameters(expectedFunc, match);
                if (parameterCheck.hasDifferences) {
                    gaps.push({
                        type: this.gapTypes.PARAMETER_MISMATCH,
                        category: 'function',
                        severity: 'MEDIUM',
                        prdRequirement: expectedFunc.source,
                        functionName: expectedFunc.name,
                        expected: expectedFunc.signature,
                        actual: match.signature,
                        differences: parameterCheck.differences,
                        message: `Function '${expectedFunc.name}' has parameter mismatches`,
                        suggestedFix: `Update function signature to match PRD specification: ${expectedFunc.signature}`
                    });
                }

                matches.push({
                    prdRequirement: expectedFunc.source,
                    implementation: `${match.file}:${match.line}`,
                    functionName: expectedFunc.name,
                    confidence: this.calculateMatchConfidence(expectedFunc, match)
                });
            }
        }

        // Check for undocumented implementations
        for (const implFunc of implementedFunctions) {
            if (!this.findExpectedFunction(implFunc, expectedFunctions)) {
                gaps.push({
                    type: this.gapTypes.MISSING_FROM_PRD,
                    category: 'function',
                    severity: 'MEDIUM',
                    implementation: `${implFunc.file}:${implFunc.line}`,
                    functionName: implFunc.name,
                    actualSignature: implFunc.signature,
                    message: `Function '${implFunc.name}' is implemented but not documented in PRD`,
                    suggestedFix: `Add functional requirement for ${implFunc.name} to PRD`,
                    suggestedRequirement: this.generateRequirementSuggestion(implFunc)
                });
            }
        }

        return { gaps, matches };
    }

    /**
     * Analyze gaps in API endpoint implementations
     */
    analyzeApiGaps(prdData, implData) {
        const gaps = [];
        const matches = [];

        const expectedApis = this.extractExpectedApis(prdData);
        const implementedApis = implData.apiEndpoints || [];

        // Check for missing API implementations
        for (const expectedApi of expectedApis) {
            const match = this.findApiMatch(expectedApi, implementedApis);
            
            if (!match) {
                gaps.push({
                    type: this.gapTypes.MISSING_FROM_IMPL,
                    category: 'api',
                    severity: 'HIGH',
                    prdRequirement: expectedApi.source,
                    expectedEndpoint: `${expectedApi.method} ${expectedApi.path}`,
                    message: `API endpoint '${expectedApi.method} ${expectedApi.path}' specified in PRD but not implemented`,
                    suggestedFix: `Implement ${expectedApi.method} endpoint for ${expectedApi.path}`
                });
            } else {
                matches.push({
                    prdRequirement: expectedApi.source,
                    implementation: `${match.file}:${match.line}`,
                    endpoint: `${match.method} ${match.path}`,
                    confidence: this.calculateApiMatchConfidence(expectedApi, match)
                });
            }
        }

        // Check for undocumented API implementations
        for (const implApi of implementedApis) {
            if (!this.findExpectedApi(implApi, expectedApis)) {
                gaps.push({
                    type: this.gapTypes.MISSING_FROM_PRD,
                    category: 'api',
                    severity: 'LOW',
                    implementation: `${implApi.file}:${implApi.line}`,
                    endpoint: `${implApi.method} ${implApi.path}`,
                    message: `API endpoint '${implApi.method} ${implApi.path}' is implemented but not documented in PRD`,
                    suggestedFix: `Document ${implApi.method} ${implApi.path} endpoint in PRD API specifications`
                });
            }
        }

        return { gaps, matches };
    }

    /**
     * Analyze gaps in configuration implementations
     */
    analyzeConfigGaps(prdData, implData) {
        const gaps = [];
        const matches = [];

        const expectedConfigs = this.extractExpectedConfigs(prdData);
        const implementedConfigs = implData.configurations || [];

        // Check for missing configuration implementations
        for (const expectedConfig of expectedConfigs) {
            const match = this.findConfigMatch(expectedConfig, implementedConfigs);
            
            if (!match) {
                gaps.push({
                    type: this.gapTypes.MISSING_FROM_IMPL,
                    category: 'configuration',
                    severity: 'MEDIUM',
                    prdRequirement: expectedConfig.source,
                    configKey: expectedConfig.key,
                    expectedValue: expectedConfig.expectedValue,
                    message: `Configuration '${expectedConfig.key}' specified in PRD but not found in implementation`,
                    suggestedFix: `Add configuration parameter '${expectedConfig.key}' to configuration files`
                });
            } else {
                // Check for value mismatches
                if (this.hasConfigValueMismatch(expectedConfig, match)) {
                    gaps.push({
                        type: this.gapTypes.BEHAVIORAL_DIFFERENCE,
                        category: 'configuration',
                        severity: 'LOW',
                        configKey: expectedConfig.key,
                        expected: expectedConfig.expectedValue,
                        actual: match.value,
                        message: `Configuration '${expectedConfig.key}' has different value than expected`,
                        suggestedFix: `Update configuration value or PRD to align expectations`
                    });
                }

                matches.push({
                    prdRequirement: expectedConfig.source,
                    implementation: `${match.file}:${match.line}`,
                    configKey: expectedConfig.key,
                    confidence: this.calculateConfigMatchConfidence(expectedConfig, match)
                });
            }
        }

        return { gaps, matches };
    }

    /**
     * Helper methods for function analysis
     */
    findFunctionMatch(expectedFunc, implementedFunctions) {
        // Exact name match first
        let match = implementedFunctions.find(impl => impl.name === expectedFunc.name);
        if (match) return match;

        // Fuzzy name matching
        const threshold = 0.8;
        for (const impl of implementedFunctions) {
            const similarity = this.calculateStringSimilarity(expectedFunc.name, impl.name);
            if (similarity >= threshold) {
                return impl;
            }
        }

        return null;
    }

    findExpectedFunction(implFunc, expectedFunctions) {
        return expectedFunctions.find(expected => 
            expected.name === implFunc.name || 
            this.calculateStringSimilarity(expected.name, implFunc.name) >= 0.8
        );
    }

    compareParameters(expectedFunc, actualFunc) {
        const expectedParams = this.parseParameters(expectedFunc.signature);
        const actualParams = this.parseParameters(actualFunc.signature);
        
        const differences = [];
        
        if (expectedParams.length !== actualParams.length) {
            differences.push(`Parameter count mismatch: expected ${expectedParams.length}, got ${actualParams.length}`);
        }

        for (let i = 0; i < Math.max(expectedParams.length, actualParams.length); i++) {
            const expected = expectedParams[i];
            const actual = actualParams[i];
            
            if (!expected && actual) {
                differences.push(`Extra parameter: ${actual}`);
            } else if (expected && !actual) {
                differences.push(`Missing parameter: ${expected}`);
            } else if (expected && actual && expected !== actual) {
                differences.push(`Parameter ${i + 1}: expected '${expected}', got '${actual}'`);
            }
        }

        return {
            hasDifferences: differences.length > 0,
            differences
        };
    }

    /**
     * Helper methods for API analysis
     */
    findApiMatch(expectedApi, implementedApis) {
        return implementedApis.find(impl => 
            impl.method === expectedApi.method && 
            this.pathsMatch(impl.path, expectedApi.path)
        );
    }

    findExpectedApi(implApi, expectedApis) {
        return expectedApis.find(expected => 
            expected.method === implApi.method && 
            this.pathsMatch(expected.path, implApi.path)
        );
    }

    pathsMatch(path1, path2) {
        // Normalize paths for comparison
        const normalize = (path) => path.replace(/[{}]/g, '').toLowerCase();
        return normalize(path1) === normalize(path2) || 
               this.calculateStringSimilarity(normalize(path1), normalize(path2)) >= 0.8;
    }

    /**
     * Helper methods for configuration analysis
     */
    findConfigMatch(expectedConfig, implementedConfigs) {
        return implementedConfigs.find(impl => 
            impl.key === expectedConfig.key || 
            this.calculateStringSimilarity(impl.key, expectedConfig.key) >= 0.9
        );
    }

    hasConfigValueMismatch(expected, actual) {
        if (!expected.expectedValue || !actual.value) return false;
        
        const expectedStr = String(expected.expectedValue).toLowerCase();
        const actualStr = String(actual.value).toLowerCase();
        
        return expectedStr !== actualStr && !expectedStr.includes(actualStr) && !actualStr.includes(expectedStr);
    }

    /**
     * Data extraction methods
     */
    extractExpectedFunctions(prdData) {
        const functions = [];
        
        for (const fr of prdData.functionalRequirements) {
            for (const func of fr.functions) {
                functions.push({
                    ...func,
                    source: fr.id,
                    context: fr.title
                });
            }
        }

        return functions;
    }

    extractExpectedApis(prdData) {
        const apis = [];
        
        for (const api of prdData.apiSpecs) {
            apis.push({
                ...api,
                source: api.context
            });
        }

        // Also extract from functional requirements
        for (const fr of prdData.functionalRequirements) {
            for (const endpoint of fr.apiEndpoints) {
                apis.push({
                    ...endpoint,
                    source: fr.id,
                    context: fr.title
                });
            }
        }

        return apis;
    }

    extractExpectedConfigs(prdData) {
        const configs = [];
        
        for (const configSection of prdData.configParameters) {
            for (const param of configSection.structure) {
                configs.push({
                    ...param,
                    source: configSection.context
                });
            }
        }

        // Also extract from functional requirements
        for (const fr of prdData.functionalRequirements) {
            for (const config of fr.configParams) {
                configs.push({
                    ...config,
                    source: fr.id
                });
            }
        }

        return configs;
    }

    /**
     * Utility methods
     */
    calculateStringSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1.0;
        
        const distance = this.levenshteinDistance(longer, shorter);
        return (longer.length - distance) / longer.length;
    }

    levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    parseParameters(signature) {
        const paramMatch = signature.match(/\(([^)]*)\)/);
        if (!paramMatch) return [];
        
        const params = paramMatch[1].split(',').map(p => p.trim()).filter(p => p);
        return params;
    }

    calculateMatchConfidence(expected, actual) {
        const nameSimilarity = this.calculateStringSimilarity(expected.name, actual.name);
        const paramCheck = this.compareParameters(expected, actual);
        const paramScore = paramCheck.hasDifferences ? 0.5 : 1.0;
        
        return Math.round((nameSimilarity * 0.7 + paramScore * 0.3) * 100);
    }

    calculateApiMatchConfidence(expected, actual) {
        const methodMatch = expected.method === actual.method ? 1.0 : 0.0;
        const pathSimilarity = this.calculateStringSimilarity(expected.path, actual.path);
        
        return Math.round((methodMatch * 0.6 + pathSimilarity * 0.4) * 100);
    }

    calculateConfigMatchConfidence(expected, actual) {
        const keySimilarity = this.calculateStringSimilarity(expected.key, actual.key);
        const valueMatch = this.hasConfigValueMismatch(expected, actual) ? 0.5 : 1.0;
        
        return Math.round((keySimilarity * 0.7 + valueMatch * 0.3) * 100);
    }

    countTotalRequirements(prdData) {
        return (
            this.extractExpectedFunctions(prdData).length +
            this.extractExpectedApis(prdData).length +
            this.extractExpectedConfigs(prdData).length
        );
    }

    prioritizeGaps(gaps) {
        const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        return gaps.sort((a, b) => {
            const aPriority = priorityOrder[a.severity] || 0;
            const bPriority = priorityOrder[b.severity] || 0;
            return bPriority - aPriority;
        });
    }

    generateSummary(gaps, matches, alignmentScore) {
        const gapsBySeverity = gaps.reduce((acc, gap) => {
            acc[gap.severity] = (acc[gap.severity] || 0) + 1;
            return acc;
        }, {});

        const gapsByType = gaps.reduce((acc, gap) => {
            acc[gap.type] = (acc[gap.type] || 0) + 1;
            return acc;
        }, {});

        return {
            alignmentScore,
            totalGaps: gaps.length,
            totalMatches: matches.length,
            gapsBySeverity,
            gapsByType,
            recommendation: this.generateRecommendation(alignmentScore, gaps)
        };
    }

    generateRecommendation(score, gaps) {
        if (score >= 90) {
            return 'Excellent alignment! Minor gaps can be addressed incrementally.';
        } else if (score >= 75) {
            return 'Good alignment with some gaps to address. Focus on HIGH severity gaps first.';
        } else if (score >= 50) {
            return 'Moderate alignment. Significant work needed to sync PRD with implementation.';
        } else {
            return 'Poor alignment. Major discrepancies between PRD and implementation require immediate attention.';
        }
    }

    suggestImplementationFile(expectedFunc, implData) {
        // Try to suggest the most appropriate file based on context
        if (implData.files && implData.files.length > 0) {
            const mainFile = implData.files.find(f => f.name.includes('index') || f.name.includes('main'));
            return mainFile ? mainFile.name : implData.files[0].name;
        }
        return 'appropriate implementation file';
    }

    generateRequirementSuggestion(implFunc) {
        return `**Requirement**: System must provide ${implFunc.name} functionality
**Details**: Implementation found for ${implFunc.signature}
**Acceptance Criteria**: 
- Function ${implFunc.name} should be available
- Function should handle appropriate parameters and return expected results`;
    }
}

module.exports = { GapDetector };