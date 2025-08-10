#!/usr/bin/env node

/**
 * Quick test of slice extraction for us-004
 */

const fs = require('fs');

// Hardcoded slice data for us-004 based on the file
const sliceData = {
  story: "US-004",
  slices: [
    {
      number: 1,
      name: "Three-Column Layout Foundation",
      tasks: ["T-001", "T-002", "T-003", "T-004"],
      userValue: "See properly structured three-column layout",
      manifestExists: fs.existsSync('.sdlc/05-backlog/A-accounts/master-view/processor-manifest-vs1.json'),
      status: "ready"
    },
    {
      number: 2,
      name: "Account Cards Display",
      tasks: ["T-005", "T-006", "T-007", "T-008"],
      userValue: "View all accounts as informative cards",
      manifestExists: fs.existsSync('.sdlc/05-backlog/A-accounts/master-view/processor-manifest-vs2.json'),
      status: "ready"
    },
    {
      number: 3,
      name: "Interactive Selection",
      tasks: ["T-009", "T-010", "T-011"],
      userValue: "Select accounts with clear visual feedback",
      manifestExists: fs.existsSync('.sdlc/05-backlog/A-accounts/master-view/processor-manifest-vs3.json'),
      status: "pending"
    }
  ],
  currentSlice: 3,  // First one without manifest
  totalSlices: 3
};

// Save to tracking file
const outputPath = '.sdlc/current-work/value-slices.json';
fs.writeFileSync(outputPath, JSON.stringify(sliceData, null, 2));

console.log('✅ Slice data saved for US-004');
console.log(`\nFound ${sliceData.slices.length} slices:`);
sliceData.slices.forEach(slice => {
  const status = slice.manifestExists ? '✅ Has manifest' : '❌ No manifest';
  console.log(`  Slice ${slice.number}: ${slice.name} - ${status}`);
});

console.log(`\nCurrent slice to run: ${sliceData.currentSlice}`);
console.log('\nData saved to:', outputPath);