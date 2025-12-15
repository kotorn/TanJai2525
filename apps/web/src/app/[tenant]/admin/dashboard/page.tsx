'use client';

import { useState } from 'react';

export default function AdminDashboardPage({ params }: { params: { tenant: string } }) {
    const [numTables, setNumTables] = useState(4);
    const [qrLinks, setQrLinks] = useState<string[]>([]);

    const generateLinks = () => {
        const links = [];
        // Assuming we are running on localhost:3000 or the production domain
        // In client component, window.location.origin works
        const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

        for (let i = 1; i <= numTables; i++) {
            // Format: /tenant?tableId=X
            links.push(`${origin}/${params.tenant}?tableId=${i}`);
        }
        setQrLinks(links);
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

            <div className="bg-white p-6 rounded shadow mb-6">
                <h2 className="font-bold text-lg mb-4">QR Code Generator</h2>
                <div className="flex gap-4 items-center mb-4">
                    <label>Number of Tables:</label>
                    <input
                        type="number" value={numTables} onChange={e => setNumTables(parseInt(e.target.value))}
                        className="border p-2 rounded"
                    />
                    <button
                        onClick={generateLinks}
                        className="bg-purple-600 text-white px-4 py-2 rounded font-bold hover:bg-purple-700"
                    >
                        Generate Links
                    </button>
                </div>

                {qrLinks.length > 0 && (
                    <div className="space-y-2 bg-gray-50 p-4 rounded">
                        {qrLinks.map((link, idx) => (
                            <div key={idx} className="flex justify-between items-center border-b pb-2">
                                <span className="font-mono text-sm">{link}</span>
                                <a
                                    href={link} target="_blank" rel="noopener noreferrer"
                                    className="text-blue-600 font-bold text-sm"
                                >
                                    Open Table {idx + 1}
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
