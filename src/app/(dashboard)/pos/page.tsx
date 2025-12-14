export default function POSPage() {
    return (
        <div className="flex h-full flex-col gap-4">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">POS Terminal</h2>
                <div className="flex items-center space-x-2">
                    {/* Action Buttons */}
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow">
                    <div className="p-6">
                        <h3>Menu Grid (Placeholder)</h3>
                        {/* MenuGrid component will go here */}
                    </div>
                </div>
                <div className="col-span-3 rounded-xl border bg-card text-card-foreground shadow">
                    <div className="p-6">
                        <h3>Current Order (Placeholder)</h3>
                        {/* ActiveOrder component will go here */}
                    </div>
                </div>
            </div>
        </div>
    );
}
