export default function PaymentPage({ params }: { params: { id: string } }) {
  // Mock payment status check
  const isPaid = false; 

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-white p-4">
      <div className="glass-panel p-8 rounded-2xl max-w-sm w-full text-center border border-white/10">
        {isPaid ? (
             <>
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-3xl">check</span>
                </div>
                <h1 className="text-2xl font-bold mb-2">Payment Successful</h1>
                <p className="text-gray-400">Transaction {params.id}</p>
             </>
        ) : (
            <>
                <div className="w-16 h-16 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                     <span className="material-symbols-outlined text-3xl">hourglass_top</span>
                </div>
                <h1 className="text-2xl font-bold mb-2">Processing Payment</h1>
                <p className="text-gray-400">Transaction {params.id}</p>
                <div className="mt-6">
                    <button className="w-full bg-primary-500 py-3 rounded-xl font-bold">
                        Confirm Payment
                    </button>
                </div>
            </>
        )}
      </div>
    </div>
  );
}
