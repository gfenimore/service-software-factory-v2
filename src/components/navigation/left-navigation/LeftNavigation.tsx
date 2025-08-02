interface LeftNavigationProps {
  className?: string;
  onNavigate?: (focusArea: string) => void;
}

export default function LeftNavigation({ className, onNavigate }: LeftNavigationProps) {
  // Hardcoded modules and focus areas for T-001 minimal implementation
  const modules = [
    {
      name: 'Accounts',
      focusAreas: ['Master View', 'Reports']
    },
    {
      name: 'Operations',
      focusAreas: ['Work Orders', 'Schedules', 'Routes']  // ← Updated
    },
    {
      name: 'Admin',
      focusAreas: ['User Management', 'System Settings']
    }
  ];

  return (
    <nav className={`navigation-container ${className || ''}`}>
      <h2>Navigation</h2>
      {modules.map((module) => (
        <div key={module.name} className="module-group">
          <h3>{module.name}</h3>
          <ul>
            {module.focusAreas.map((focusArea) => (
              <li key={focusArea}>
                <button 
                  onClick={() => onNavigate?.(`${module.name} > ${focusArea}`)}
                  className="focus-area-item"
                >
                  {focusArea}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
      
      <style jsx>{`
        .navigation-container {
          width: 300px;
          padding: 16px;
          border: 1px solid #ccc;
          background: #f9f9f9;
        }
        
        .module-group {
          margin-bottom: 16px;
        }
        
        .module-group h3 {
          margin: 0 0 8px 0;
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }
        
        .module-group ul {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        
        .focus-area-item {
          display: block;
          width: 100%;
          padding: 8px 12px;
          margin-bottom: 4px;
          border: none;
          background: white;
          text-align: left;
          cursor: pointer;
          border-radius: 4px;
          font-size: 13px;
        }
        
        .focus-area-item:hover {
          background: #e9ecef;
        }
      `}</style>
    </nav>
  );
}