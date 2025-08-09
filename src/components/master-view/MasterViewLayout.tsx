'use client'

import React from 'react'
import type { MasterViewLayoutProps, LayoutGridAreas } from '@/types/masterView.types'

export function MasterViewLayout({ children, className = '' }: MasterViewLayoutProps) {
  const gridAreas = React.Children.toArray(children) as [React.ReactNode, React.ReactNode, React.ReactNode]
  
  return (
    <div 
      className={`master-view-layout ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns: '300px 400px 1fr',
        gridTemplateRows: '100vh',
        gridTemplateAreas: '"column-one column-two column-three"',
        gap: 0,
        overflow: 'hidden',
        width: '100%',
        height: '100vh'
      }}
      data-testid="master-view-layout"
    >
      <div 
        className="master-view-column-one"
        style={{
          gridArea: 'column-one',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          borderRight: '1px solid #e5e7eb'
        }}
      >
        {gridAreas[0]}
      </div>
      
      <div 
        className="master-view-column-two"
        style={{
          gridArea: 'column-two',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          borderRight: '1px solid #e5e7eb'
        }}
      >
        {gridAreas[1]}
      </div>
      
      <div 
        className="master-view-column-three"
        style={{
          gridArea: 'column-three',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto'
        }}
      >
        {gridAreas[2]}
      </div>
    </div>
  )
}