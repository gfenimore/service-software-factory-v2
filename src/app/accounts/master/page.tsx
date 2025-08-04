export default function AccountsMasterView() {
  return (
    <div className="h-full">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Accounts Master View</h1>
      <div className="grid grid-cols-3 gap-6 h-full min-h-[600px]">
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
          <div className="text-center p-6">
            <h2 className="text-lg font-medium text-gray-700 mb-2">Left Column</h2>
            <p className="text-gray-500">3-Column Accounts Interface</p>
            <p className="text-gray-500">Coming Soon!</p>
          </div>
        </div>
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
          <div className="text-center p-6">
            <h2 className="text-lg font-medium text-gray-700 mb-2">Center Column</h2>
            <p className="text-gray-500">3-Column Accounts Interface</p>
            <p className="text-gray-500">Coming Soon!</p>
          </div>
        </div>
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
          <div className="text-center p-6">
            <h2 className="text-lg font-medium text-gray-700 mb-2">Right Column</h2>
            <p className="text-gray-500">3-Column Accounts Interface</p>
            <p className="text-gray-500">Coming Soon!</p>
          </div>
        </div>
      </div>
    </div>
  );
}