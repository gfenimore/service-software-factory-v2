// CONCEPT LINE: Location Form - No validation needed!
// Just make it work for demo purposes

import React, { useState } from 'react';

export const LocationForm = ({ location, onSave, onCancel }: any) => {
  // Initialize form with location data or defaults
  const [formData, setFormData] = useState(location || {
    name: '',
    address: '',
    accountName: '',
    status: 'active'
  });
  
  console.log("📝 Form opened:", location ? 'Edit mode' : 'Add mode');
  console.log("📋 Initial data:", formData);
  
  // Simple field update handler
  const updateField = (field: string, value: any) => {
    console.log(`✏️ Updating ${field}:`, value);
    setFormData({ ...formData, [field]: value });
  };
  
  // Handle form submission
  const handleSubmit = (e: any) => {
    e.preventDefault();
    console.log("💾 Form submitted:", formData);
    onSave(formData);
  };
  
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onCancel}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 999
        }}
      />
      
      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        width: '90%',
        maxWidth: '500px',
        zIndex: 1000,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '20px' }}>
          {location ? '✏️ Edit Location' : '➕ Add New Location'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          {/* Location Name */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '4px', 
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              Location Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="e.g., Downtown Service Center"
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '14px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          {/* Address */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '4px', 
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder="e.g., 123 Main St, Springfield, IL 62701"
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '14px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          {/* Account Name */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '4px', 
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              Account Name
            </label>
            <input
              type="text"
              value={formData.accountName}
              onChange={(e) => updateField('accountName', e.target.value)}
              placeholder="e.g., Springfield Municipal"
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '14px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          {/* Status */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '4px', 
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => updateField('status', e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '14px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                boxSizing: 'border-box',
                backgroundColor: 'white'
              }}
            >
              <option value="active">🟢 Active</option>
              <option value="inactive">🔴 Inactive</option>
            </select>
          </div>
          
          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '10px 20px',
                backgroundColor: '#f3f4f6',
                border: '1px solid #ddd',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              {location ? 'Save Changes' : 'Add Location'}
            </button>
          </div>
        </form>
        
        {/* Debug Info - Concept Mode Only */}
        <div style={{
          marginTop: '20px',
          padding: '12px',
          backgroundColor: '#f9fafb',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#666'
        }}>
          <strong>🐛 Form State (Concept Mode):</strong>
          <pre style={{ margin: '8px 0 0 0' }}>
            {JSON.stringify(formData, null, 2)}
          </pre>
        </div>
      </div>
    </>
  );
};