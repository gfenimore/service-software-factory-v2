'use client';

// CONCEPT LINE: Test page for Service Locations
// This is for rapid validation only - not production code!

import { ServiceLocations } from '@/concept/components/ServiceLocations';

export default function ConceptLocationsPage() {
  console.log("🚀 Concept Locations Page Loaded!");
  
  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      {/* Concept Mode Banner */}
      <div style={{
        backgroundColor: '#fbbf24',
        color: '#78350f',
        padding: '12px',
        textAlign: 'center',
        fontSize: '14px',
        fontWeight: 'bold'
      }}>
        🎨 CONCEPT MODE - Rapid Validation with Mock Data - Not Production Code
      </div>
      
      {/* Main Component */}
      <ServiceLocations />
      
      {/* Footer with concept info */}
      <div style={{
        marginTop: '40px',
        padding: '20px',
        textAlign: 'center',
        color: '#666',
        fontSize: '13px'
      }}>
        <p>
          <strong>Concept Line Features:</strong> any types ✅ | console.log ✅ | 
          mock data ✅ | no tests ✅ | inline styles ✅
        </p>
        <p style={{ marginTop: '8px' }}>
          Time to build: ~2 hours | Ready for stakeholder feedback
        </p>
      </div>
    </div>
  );
}