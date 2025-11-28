export default function AdminDashboard() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-gray-500 font-medium mb-2">Total Partners</h3>
                    <p className="text-4xl font-black text-gray-900">3</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-gray-500 font-medium mb-2">Active Tariffs</h3>
                    <p className="text-4xl font-black text-gray-900">12</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-gray-500 font-medium mb-2">System Status</h3>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        <span className="font-bold text-green-600">Operational</span>
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 mt-8">
                <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                <p className="text-gray-600">Select a section from the sidebar to manage content.</p>
            </div>
        </div>
    )
}
