// CONCEPT LINE: Location List - any types OK!
// Quick and dirty for validation

import React from 'react';

export const LocationList = ({ locations, onSelect, selectedId }: any) => {
  console.log("🎨 Rendering LocationList with", locations.length, "locations");
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {locations.map((location: any) => {
        const isSelected = selectedId === location.id;
        console.log(`Location ${location.name} selected:`, isSelected);
        
        return (
          <div
            key={location.id}
            onClick={() => onSelect(location)}
            style={{
              border: isSelected ? '2px solid blue' : '1px solid #ddd',
              borderRadius: '8px',
              padding: '16px',
              cursor: 'pointer',
              backgroundColor: isSelected ? '#f0f8ff' : 'white',
              transition: 'all 0.2s',
              boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (!isSelected) {
                e.currentTarget.style.backgroundColor = '#f9f9f9';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                e.currentTarget.style.backgroundColor = 'white';
              }
            }}
          >
            {/* Status Badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#333' }}>
                {location.name}
              </h3>
              <span
                style={{
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: 'white',
                  backgroundColor: location.status === 'active' ? '#22c55e' : '#ef4444'
                }}
              >
                {location.status.toUpperCase()}
              </span>
            </div>
            
            {/* Address */}
            <p style={{ margin: '4px 0', color: '#666', fontSize: '14px' }}>
              📍 {location.address}
            </p>
            
            {/* Account Info */}
            <p style={{ margin: '4px 0', color: '#666', fontSize: '14px' }}>
              🏢 {location.accountName}
            </p>
            
            {/* Quick Stats */}
            <div style={{ 
              display: 'flex', 
              gap: '20px', 
              marginTop: '12px',
              paddingTop: '12px',
              borderTop: '1px solid #eee'
            }}>
              <span style={{ fontSize: '13px', color: '#888' }}>
                👥 {location.contactCount} contacts
              </span>
              <span style={{ fontSize: '13px', color: '#888' }}>
                🔧 {location.upcomingJobs} upcoming jobs
              </span>
              <span style={{ fontSize: '13px', color: '#888' }}>
                📅 Last: {location.lastService}
              </span>
            </div>
          </div>
        );
      })}
      
      {locations.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          color: '#999',
          border: '2px dashed #ddd',
          borderRadius: '8px'
        }}>
          No locations found. Try adjusting your search.
        </div>
      )}
    </div>
  );
};