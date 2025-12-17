export default function TablePage({ params }: { params: { id: string } }) {
  // In a real app, we would validate table ID here serverside
  // and redirect to the menu with table context
  
  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-white p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome to Table {params.id}</h1>
        <p className="text-gray-400 mb-8">Redirecting to menu...</p>
        <a 
          href={`/menu?table=${params.id}`} 
          className="bg-primary-500 px-6 py-2 rounded-lg font-bold"
        >
          Open Menu Now
        </a>
      </div>
    </div>
  );
}
