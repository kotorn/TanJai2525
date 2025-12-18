'use client';

import { Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';

type OrderStatus = 'pending_payment' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

interface OrderStatusTrackerProps {
  currentStatus: OrderStatus;
  createdAt: string;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
}

const statusConfig = {
  pending_payment: { label: 'Waiting for Payment', icon: Clock, color: 'text-yellow-600' },
  pending: { label: 'Order Confirmed', icon: CheckCircle, color: 'text-blue-600' },
  processing: { label: 'Processing', icon: Package, color: 'text-purple-600' },
  shipped: { label: 'Shipped', icon: Truck, color: 'text-orange-600' },
  delivered: { label: 'Delivered', icon: CheckCircle, color: 'text-green-600' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-red-600' },
  refunded: { label: 'Refunded', icon: XCircle, color: 'text-gray-600' },
};

export function OrderStatusTracker({
  currentStatus,
  createdAt,
  paidAt,
  shippedAt,
  deliveredAt,
  cancelledAt,
}: OrderStatusTrackerProps) {
  const config = statusConfig[currentStatus];
  const Icon = config.icon;

  const steps = [
    { status: 'pending', label: 'Confirmed', timestamp: paidAt || createdAt },
    { status: 'processing', label: 'Processing', timestamp: paidAt },
    { status: 'shipped', label: 'Shipped', timestamp: shippedAt },
    { status: 'delivered', label: 'Delivered', timestamp: deliveredAt },
  ];

  const currentStepIndex = steps.findIndex(s => s.status === currentStatus);
  const isCancelled = currentStatus === 'cancelled' || currentStatus === 'refunded';

  if (isCancelled) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <XCircle className="w-8 h-8 text-red-600" />
          <div>
            <h3 className="font-bold text-red-900">{config.label}</h3>
            <p className="text-anon-8 text-red-700">
              {cancelledAt && new Date(cancelledAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-anon-card">
      {/* Current Status */}
      <div className="flex items-center gap-3 mb-6">
        <Icon className={`w-8 h-8 ${config.color}`} />
        <div>
          <h3 className="font-bold text-anon-eerie-black">{config.label}</h3>
          <p className="text-anon-8 text-anon-sonic-silver">
            Last updated: {new Date(createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="relative">
        {steps.map((step, index) => {
          const isCompleted = index <= currentStepIndex;
          const isActive = index === currentStepIndex;

          return (
            <div key={step.status} className="relative flex items-start mb-6 last:mb-0">
              {/* Line connector */}
              {index < steps.length - 1 && (
                <div
                  className={`absolute left-4 top-8 w-0.5 h-full ${
                    isCompleted ? 'bg-anon-ocean-green' : 'bg-anon-cultured'
                  }`}
                />
              )}

              {/* Step indicator */}
              <div
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                  isCompleted
                    ? 'bg-anon-ocean-green text-white'
                    : 'bg-anon-cultured text-anon-sonic-silver'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-current" />
                )}
              </div>

              {/* Step content */}
              <div className="ml-4 flex-1">
                <p
                  className={`font-medium ${
                    isActive ? 'text-anon-eerie-black' : 'text-anon-sonic-silver'
                  }`}
                >
                  {step.label}
                </p>
                {step.timestamp && (
                  <p className="text-anon-9 text-anon-spanish-gray">
                    {new Date(step.timestamp).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
