'use client';

import { useState } from 'react';
import LeftNavigation from '@/components/navigation/left-navigation/LeftNavigation';

export default function TestNavPage() {
  const [selectedArea, setSelectedArea] = useState<string>('');

  const handleNavigate = (focusArea: string) => {
    setSelectedArea(focusArea);
    console.log('Navigation clicked:', focusArea);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Left Navigation Test - T-001 Implementation</h1>
      <p>Testing the basic LeftNavigation component with 4 modules and their focus areas.</p>
      
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <div>
          <LeftNavigation onNavigate={handleNavigate} />
        </div>
        
        <div style={{ flex: 1, padding: '20px', border: '1px solid #ddd', borderRadius: '4px' }}>
          <h2>Navigation Test Results</h2>
          {selectedArea ? (
            <div>
              <p><strong>Selected Focus Area:</strong> {selectedArea}</p>
              <p style={{ color: 'green' }}>✅ Navigation component is working!</p>
            </div>
          ) : (
            <p style={{ color: '#666' }}>Click on any focus area in the navigation to test...</p>
          )}
          
          <div style={{ marginTop: '20px' }}>
            <h3>T-001 Verification Checklist:</h3>
            <ul>
              <li>✅ Base LeftNavigation component created</li>
              <li>✅ Displays 4 modules: Accounts, Operations, Inventory, Admin</li>
              <li>✅ Shows focus areas in flat list format</li>
              <li>✅ Component renders without errors</li>
              <li>✅ Basic interaction works (click handling)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}