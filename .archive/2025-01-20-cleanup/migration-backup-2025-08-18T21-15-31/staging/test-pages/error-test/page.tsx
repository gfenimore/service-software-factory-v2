'use client'

import { useState } from 'react'

export default function ErrorTestPage() {
  const [items] = useState(['apple', 'banana', 'orange'])

  return (
    <div className="p-8">
      <h1>Testing Real Errors Are Still Caught</h1>

      {/* Fixed: Added key prop */}
      <ul>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>

      {/* This should generate a warning about missing key prop */}
    </div>
  )
}
