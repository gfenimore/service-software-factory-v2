#!/usr/bin/env node

/**
 * extract-value-slices.js
 * Extracts value slice information from task documents
 */

const fs = require('fs');
const path = require('path');

class ValueSliceExtractor {
  constructor() {
    this.slices = [];
    this.story = null;
  }

  // Parse a task file for value slices
  parseTaskFile(filePath) {
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return null;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    // Extract story number from filename
    const storyMatch = path.basename(filePath).match(/us-(\d+)/i);
    this.story = storyMatch ? `US-${storyMatch[1]}` : 'Unknown';

    let currentSlice = null;
    let inSliceSection = false;
    let inTaskSection = false;
    let sliceNumber = 0;

    lines.forEach((line, index) => {
      // Detect VALUE SLICE CHECKPOINT
      if (line.includes('VALUE SLICE CHECKPOINT')) {
        sliceNumber++;
        const nameMatch = lines[index + 1]?.match(/^(.+)$/);
        
        currentSlice = {
          number: sliceNumber,
          name: nameMatch ? nameMatch[1].replace(/^#+\s*/, '').trim() : `Slice ${sliceNumber}`,
          tasks: [],
          userValue: '',
          requiresArchitect: false,
          estimatedMinutes: 0,
          status: 'pending',
          processorCount: 0
        };
        
        this.slices.push(currentSlice);
        inSliceSection = true;
        inTaskSection = false;
      }

      // Extract user value
      if (inSliceSection && line.includes('User can now:')) {
        currentSlice.userValue = line.replace('User can now:', '').trim();
      }

      // Extract tasks
      if (inSliceSection && line.match(/^[T-]\d+:/)) {
        const taskMatch = line.match(/^(T-\d+):/);
        if (taskMatch && currentSlice) {
          currentSlice.tasks.push(taskMatch[1]);
          inTaskSection = true;
        }
      }

      // Count processors mentioned
      if (inTaskSection && line.includes('PROCESSOR')) {
        currentSlice.processorCount++;
      }

      // Detect if architect is needed
      if (inSliceSection && (line.includes('ARCHITECT') || line.includes('architect'))) {
        currentSlice.requiresArchitect = true;
      }

      // End of slice section
      if (inSliceSection && line.startsWith('---')) {
        inSliceSection = false;
        inTaskSection = false;
        
        // Estimate time based on task count and processors
        if (currentSlice) {
          currentSlice.estimatedMinutes = 
            (currentSlice.tasks.length * 15) + 
            (currentSlice.processorCount * 5) +
            (currentSlice.requiresArchitect ? 30 : 0);
        }
      }
    });

    // Check for completed slices based on manifest files
    this.checkCompletedSlices();

    return {
      story: this.story,
      slices: this.slices,
      currentSlice: this.findCurrentSlice(),
      totalSlices: this.slices.length,
      extractedFrom: filePath,
      extractedAt: new Date().toISOString()
    };
  }

  // Check which slices are completed
  checkCompletedSlices() {
    const manifestDir = '.sdlc/05-backlog/A-accounts/master-view';
    
    this.slices.forEach(slice => {
      const manifestPath = path.join(manifestDir, `processor-manifest-vs${slice.number}.json`);
      if (fs.existsSync(manifestPath)) {
        // Check if manifest has been processed
        const logPattern = `processor-run-*-vs${slice.number}.log`;
        const hasLogs = fs.readdirSync('.').some(file => 
          file.match(new RegExp(logPattern.replace('*', '.*')))
        );
        
        slice.status = hasLogs ? 'completed' : 'ready';
        
        // Read manifest for more accurate processor count
        try {
          const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
          if (manifest.processors) {
            slice.processorCount = manifest.processors.length;
          }
        } catch (e) {
          // Keep estimated count
        }
      }
    });
  }

  // Find the current slice to work on
  findCurrentSlice() {
    // First pending or ready slice
    const nextSlice = this.slices.find(s => 
      s.status === 'pending' || s.status === 'ready'
    );
    
    return nextSlice ? nextSlice.number : this.slices.length;
  }

  // Save to JSON file
  saveToFile(outputPath) {
    const data = {
      story: this.story,
      slices: this.slices,
      currentSlice: this.findCurrentSlice(),
      totalSlices: this.slices.length,
      lastUpdated: new Date().toISOString()
    };

    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    return data;
  }

  // Generate summary report
  generateReport() {
    const report = [];
    
    report.push(`# Value Slices for ${this.story}`);
    report.push('');
    report.push(`Total Slices: ${this.slices.length}`);
    report.push(`Current Slice: ${this.findCurrentSlice()}`);
    report.push('');
    report.push('## Slices');
    report.push('');

    this.slices.forEach(slice => {
      const status = slice.status === 'completed' ? '✅' : 
                    slice.status === 'ready' ? '🔵' : '⭕';
      
      report.push(`### ${status} Slice ${slice.number}: ${slice.name}`);
      report.push(`- Tasks: ${slice.tasks.join(', ')}`);
      report.push(`- User Value: ${slice.userValue}`);
      report.push(`- Estimated: ${slice.estimatedMinutes} minutes`);
      report.push(`- Processors: ${slice.processorCount}`);
      report.push(`- Status: ${slice.status}`);
      report.push('');
    });

    report.push('## Progress');
    const completed = this.slices.filter(s => s.status === 'completed').length;
    const percentage = Math.round((completed / this.slices.length) * 100);
    report.push(`${completed}/${this.slices.length} slices completed (${percentage}%)`);
    report.push('');

    report.push('## Next Steps');
    const current = this.findCurrentSlice();
    if (current <= this.slices.length) {
      report.push(`Run: ./scripts/run-slice.sh ${current}`);
    } else {
      report.push('All slices completed! 🎉');
    }

    return report.join('\n');
  }
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node extract-value-slices.js <task-file.md> [output.json]');
    console.log('\nExample:');
    console.log('  node extract-value-slices.js .sdlc/05-backlog/A-accounts/master-view/us-004-tasks.md');
    process.exit(1);
  }

  const inputFile = args[0];
  const outputFile = args[1] || '.sdlc/current-work/value-slices.json';

  console.log('Value Slice Extractor');
  console.log('====================\n');
  console.log(`Input: ${inputFile}`);
  console.log(`Output: ${outputFile}\n`);

  const extractor = new ValueSliceExtractor();
  const result = extractor.parseTaskFile(inputFile);

  if (result) {
    // Save JSON
    extractor.saveToFile(outputFile);
    console.log(`✅ Extracted ${result.slices.length} slices for ${result.story}`);
    
    // Display report
    console.log('\n' + extractor.generateReport());
    
    // Save report
    const reportPath = outputFile.replace('.json', '-report.md');
    fs.writeFileSync(reportPath, extractor.generateReport());
    console.log(`\nReport saved to: ${reportPath}`);
  } else {
    console.error('Failed to extract value slices');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = ValueSliceExtractor;