'use client';

// CONCEPT LINE: Main Service Locations Component
// No TypeScript restrictions, console.log encouraged!

import React, { useState, useEffect } from 'react';
import { LocationList } from './LocationList';
import { LocationForm } from './LocationForm';
import { MOCK_LOCATIONS } from '../data/mockLocations';

export const ServiceLocations = () => {
  // any types are fine in concept mode!
  const [locations, setLocations] = useState<any>(MOCK_LOCATIONS);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list');
  
  // Debug logging is encouraged!
  console.log("🚀 ServiceLocations rendered");
  console.log("📍 Current locations:", locations.length);
  console.log("🔍 Search term:", searchTerm);
  console.log("✏️ Editing:", editingLocation?.name || 'none');
  
  // Filter locations based on search
  const filteredLocations = locations.filter((loc: any) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      loc.name.toLowerCase().includes(searchLower) ||
      loc.address.toLowerCase().includes(searchLower) ||
      loc.accountName.toLowerCase().includes(searchLower) ||
      loc.status.toLowerCase().includes(searchLower)
    );
  });
  
  console.log("🎯 Filtered results:", filteredLocations.length);
  
  // Handle location selection
  const handleSelectLocation = (location: any) => {
    console.log("👆 Selected location:", location.name);
    setSelectedLocation(location);
  };
  
  // Handle add new location
  const handleAddNew = () => {
    console.log("➕ Opening add form");
    setEditingLocation(null);
    setShowForm(true);
  };
  
  // Handle edit location
  const handleEdit = () => {
    if (selectedLocation) {
      console.log("✏️ Editing location:", selectedLocation.name);
      setEditingLocation(selectedLocation);
      setShowForm(true);
    }
  };
  
  // Handle save from form
  const handleSave = (formData: any) => {
    console.log("💾 Saving location:", formData);
    
    if (editingLocation) {
      // Update existing
      setLocations(locations.map((loc: any) => 
        loc.id === editingLocation.id ? { ...formData, id: editingLocation.id } : loc
      ));
      console.log("✅ Updated location:", formData.name);
    } else {
      // Add new
      const newLocation = {
        ...formData,
        id: Math.max(...locations.map((l: any) => l.id)) + 1,
        contactCount: 0,
        contacts: [],
        lastService: "Never",
        upcomingJobs: 0
      };
      setLocations([...locations, newLocation]);
      console.log("✅ Added new location:", newLocation.name);
    }
    
    setShowForm(false);
    setEditingLocation(null);
  };
  
  // Handle delete (concept mode - just filter out)
  const handleDelete = () => {
    if (selectedLocation && window.confirm(`Delete ${selectedLocation.name}?`)) {
      console.log("🗑️ Deleting location:", selectedLocation.name);
      setLocations(locations.filter((loc: any) => loc.id !== selectedLocation.id));
      setSelectedLocation(null);
    }
  };
  
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>
          Service Locations Management
        </h1>
        <p style={{ color: '#666' }}>
          Concept Mode - Rapid validation with mock data
        </p>
      </div>
      
      {/* Toolbar */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        marginBottom: '20px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        {/* Search Box */}
        <input
          type="text"
          placeholder="🔍 Search locations, addresses, or accounts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            minWidth: '250px',
            padding: '10px 16px',
            fontSize: '14px',
            border: '1px solid #ddd',
            borderRadius: '6px'
          }}
        />
        
        {/* View Mode Toggle */}
        <button
          onClick={() => setViewMode(viewMode === 'list' ? 'cards' : 'list')}
          style={{
            padding: '10px 16px',
            backgroundColor: '#f3f4f6',
            border: '1px solid #ddd',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          {viewMode === 'list' ? '📋 List View' : '📇 Card View'}
        </button>
        
        {/* Action Buttons */}
        <button
          onClick={handleAddNew}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          ➕ Add Location
        </button>
        
        {selectedLocation && (
          <>
            <button
              onClick={handleEdit}
              style={{
                padding: '10px 20px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              ✏️ Edit
            </button>
            <button
              onClick={handleDelete}
              style={{
                padding: '10px 20px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              🗑️ Delete
            </button>
          </>
        )}
      </div>
      
      {/* Stats Bar */}
      <div style={{
        display: 'flex',
        gap: '20px',
        padding: '16px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <div>
          <span style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {filteredLocations.length}
          </span>
          <span style={{ color: '#666', marginLeft: '8px' }}>
            Locations
          </span>
        </div>
        <div>
          <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#22c55e' }}>
            {filteredLocations.filter((l: any) => l.status === 'active').length}
          </span>
          <span style={{ color: '#666', marginLeft: '8px' }}>
            Active
          </span>
        </div>
        <div>
          <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>
            {filteredLocations.filter((l: any) => l.status === 'inactive').length}
          </span>
          <span style={{ color: '#666', marginLeft: '8px' }}>
            Inactive
          </span>
        </div>
      </div>
      
      {/* Location List */}
      <LocationList
        locations={filteredLocations}
        onSelect={handleSelectLocation}
        selectedId={selectedLocation?.id}
      />
      
      {/* Form Modal */}
      {showForm && (
        <LocationForm
          location={editingLocation}
          onSave={handleSave}
          onCancel={() => {
            console.log("❌ Form cancelled");
            setShowForm(false);
            setEditingLocation(null);
          }}
        />
      )}
      
      {/* Debug Panel - Only in Concept Mode! */}
      <div style={{
        marginTop: '40px',
        padding: '16px',
        backgroundColor: '#fef3c7',
        border: '1px solid #fbbf24',
        borderRadius: '8px'
      }}>
        <h3 style={{ margin: '0 0 8px 0', color: '#92400e' }}>
          🐛 Debug Info (Concept Mode)
        </h3>
        <pre style={{ fontSize: '12px', color: '#78350f' }}>
          {JSON.stringify({
            totalLocations: locations.length,
            filtered: filteredLocations.length,
            selected: selectedLocation?.name || 'none',
            searchTerm: searchTerm,
            formOpen: showForm,
            editing: editingLocation?.name || 'none'
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
};