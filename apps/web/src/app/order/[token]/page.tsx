import { createClient } from '@/lib/supabase/server'; // Adapting to likely project structure
import { redirect } from 'next/navigation';
import { Button } from '@tanjai/ui';
import { AlertCircle } from 'lucide-react';

export default async function OrderTokenPage({ params }: { params: { token: string } }) {
  const supabase = createClient();
  
  // 1. Fetch Token
  const { data: qr, error } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('token', params.token)
    .single();

  if (error || !qr) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-6 text-center">
        <div className="mb-4 rounded-full bg-red-100 p-3 text-red-600">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">QR Code Invalid</h1>
        <p className="mt-2 text-gray-600">This QR code is invalid or has been deleted.</p>
      </div>
    );
  }

  // 2. Check Expiry
  if (qr.expires_at && new Date(qr.expires_at) < new Date()) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-6 text-center">
        <div className="mb-4 rounded-full bg-orange-100 p-3 text-orange-600">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">QR Code Expired</h1>
        <p className="mt-2 text-gray-600">This dynamic QR code has expired. Please ask staff for a new one.</p>
        <Button className="mt-6" variant="outline">Call Staff</Button>
      </div>
    );
  }

  // 3. Resolve Destination
  // Static: /r/[id]/t/[table]
  // Dynamic: /r/[id]/t/[table]?dyn=[token] (To track session/payment)
  
  const table = qr.table_number || 'dynamic'; // 'dynamic' might map to a generic table or 0
  
  // Note: Adjust URL pattern to match actual app routes found in existing tests (e.g. /r/[id]/t/[table])
  // Assuming /r/[restaurant_id]/t/[table_id] is correct based on 'offline-bomb.spec.ts'
  const destination = `/r/${qr.restaurant_id}/t/${table}?token=${qr.token}`;
  
  // 4. Redirect
  redirect(destination);
}
