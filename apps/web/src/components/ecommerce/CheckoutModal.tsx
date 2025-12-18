'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  total: number;
}

export function CheckoutModal({ isOpen, onClose, cartItems, total }: CheckoutModalProps) {
  const [step, setStep] = useState<'shipping' | 'payment' | 'confirmation'>('shipping');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    postalCode: '',
    prefecture: '',
    city: '',
    street: '',
    building: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'shipping') {
      setStep('payment');
    } else if (step === 'payment') {
      setStep('confirmation');
      // TODO: Process payment
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl mx-4 bg-anon-jet rounded-2xl shadow-anon-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-anon-davys-gray">
          <h2 className="text-anon-2 font-bold text-white">
            Checkout
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-anon-spanish-gray hover:text-white hover:bg-anon-eerie-black rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 px-8 py-4 bg-anon-eerie-black">
          <Step number={1} label="Shipping" active={step === 'shipping'} completed={step !== 'shipping'} />
          <Divider />
          <Step number={2} label="Payment" active={step === 'payment'} completed={step === 'confirmation'} />
          <Divider />
          <Step number={3} label="Confirm" active={step === 'confirmation'} completed={false} />
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="px-8 py-6 max-h-[60vh] overflow-y-auto">
          {step === 'shipping' && (
            <ShippingForm formData={formData} setFormData={setFormData} />
          )}
          {step === 'payment' && (
            <PaymentForm />
          )}
          {step === 'confirmation' && (
            <ConfirmationStep cartItems={cartItems} total={total} formData={formData} />
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between px-8 py-6 border-t border-anon-davys-gray bg-anon-eerie-black">
          <div className="flex flex-col">
            <span className="text-anon-7 text-anon-spanish-gray">Total Amount</span>
            <span className="text-anon-2 font-bold text-anon-salmon-pink">฿{total.toFixed(2)}</span>
          </div>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-8 py-3 bg-anon-salmon-pink hover:bg-anon-sandy-brown text-white font-bold text-anon-6 rounded-xl transition-colors shadow-anon-hover"
          >
            {step === 'shipping' && 'Continue to Payment'}
            {step === 'payment' && 'Confirm Order'}
            {step === 'confirmation' && 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Step indicator component
function Step({ number, label, active, completed }: { number: number; label: string; active: boolean; completed: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center font-bold text-anon-8
        ${completed ? 'bg-anon-ocean-green text-white' : ''}
        ${active ? 'bg-anon-salmon-pink text-white' : ''}
        ${!active && !completed ? 'bg-anon-davys-gray text-anon-sonic-silver' : ''}
      `}>
        {completed ? '✓' : number}
      </div>
      <span className={`text-anon-7 font-medium ${active ? 'text-white' : 'text-anon-sonic-silver'}`}>
        {label}
      </span>
    </div>
  );
}

function Divider() {
  return <div className="w-12 h-0.5 bg-anon-davys-gray" />;
}

// Shipping Form Component
function ShippingForm({ formData, setFormData }: any) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-anon-3 font-bold text-white mb-4">Shipping Address</h3>
      
      {/* Name */}
      <div>
        <label className="block text-anon-7 text-anon-cultured mb-2">
          Name <span className="text-anon-bittersweet">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 bg-anon-eerie-black text-white border border-anon-davys-gray rounded-lg focus:border-anon-salmon-pink focus:outline-none focus:ring-2 focus:ring-anon-salmon-pink/20 transition-colors"
          placeholder="Enter your full name"
        />
      </div>

      {/* Phone & Email */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-anon-7 text-anon-cultured mb-2">
            Phone Number <span className="text-anon-bittersweet">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-anon-eerie-black text-white border border-anon-davys-gray rounded-lg focus:border-anon-salmon-pink focus:outline-none focus:ring-2 focus:ring-anon-salmon-pink/20 transition-colors"
            placeholder="08X-XXX-XXXX"
          />
        </div>
        <div>
          <label className="block text-anon-7 text-anon-cultured mb-2">
            Email Address (for receipt)
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-anon-eerie-black text-white border border-anon-davys-gray rounded-lg focus:border-anon-salmon-pink focus:outline-none focus:ring-2 focus:ring-anon-salmon-pink/20 transition-colors"
            placeholder="your@email.com"
          />
        </div>
      </div>

      {/* Postal Code & Prefecture */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-anon-7 text-anon-cultured mb-2">
            Postal Code (7 digits)
          </label>
          <input
            type="text"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            maxLength={7}
            className="w-full px-4 py-3 bg-anon-eerie-black text-white border border-anon-davys-gray rounded-lg focus:border-anon-salmon-pink focus:outline-none focus:ring-2 focus:ring-anon-salmon-pink/20 transition-colors"
            placeholder="1000001"
          />
          <p className="mt-1 text-anon-9 text-anon-sonic-silver">
            <button type="button" className="text-anon-salmon-pink hover:underline">
              Type 1000001 to auto-fill (Tokyo)
            </button>
          </p>
        </div>
        <div>
          <label className="block text-anon-7 text-anon-cultured mb-2">
            Prefecture
          </label>
          <input
            type="text"
            name="prefecture"
            value={formData.prefecture}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-anon-eerie-black text-white border border-anon-davys-gray rounded-lg focus:border-anon-salmon-pink focus:outline-none focus:ring-2 focus:ring-anon-salmon-pink/20 transition-colors"
            placeholder="Tokyo"
          />
        </div>
      </div>

      {/* City/Locality */}
      <div>
        <label className="block text-anon-7 text-anon-cultured mb-2">
          City/Locality
        </label>
        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-anon-eerie-black text-white border border-anon-davys-gray rounded-lg focus:border-anon-salmon-pink focus:outline-none focus:ring-2 focus:ring-anon-salmon-pink/20 transition-colors"
          placeholder="Chiyoda-ku"
        />
      </div>

      {/* Street Address */}
      <div>
        <label className="block text-anon-7  text-anon-cultured mb-2">
          Street Address
        </label>
        <input
          type="text"
          name="street"
          value={formData.street}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-anon-eerie-black text-white border border-anon-davys-gray rounded-lg focus:border-anon-salmon-pink focus:outline-none focus:ring-2 focus:ring-anon-salmon-pink/20 transition-colors"
          placeholder="1-1-1 Chiyoda"
        />
      </div>

      {/* Building/Room (Optional) */}
      <div>
        <label className="block text-anon-7 text-anon-cultured mb-2">
          Building / Room (Optional)
        </label>
        <input
          type="text"
          name="building"
          value={formData.building}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-anon-eerie-black text-white border border-anon-davys-gray rounded-lg focus:border-anon-salmon-pink focus:outline-none focus:ring-2 focus:ring-anon-salmon-pink/20 transition-colors"
          placeholder="Apartment 101"
        />
      </div>
    </div>
  );
}

// Payment Form Component
function PaymentForm() {
  return (
    <div className="space-y-6">
      <h3 className="text-anon-3 font-bold text-white mb-4">Payment Method</h3>
      
      {/* LINE Pay Option */}
      <button
        type="button"
        className="w-full p-6 bg-[#06C755] hover:bg-[#05B34C] text-white rounded-xl flex items-center justify-between transition-colors shadow-anon-card"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
            <span className="text-2xl font-bold text-[#06C755]">L</span>
          </div>
          <div className="text-left">
            <p className="font-bold text-anon-5">Pay with LINE Pay</p>
            <p className="text-anon-8 text-white/80">Fast & Secure</p>
          </div>
        </div>
        <div className="text-anon-7">→</div>
      </button>

      {/* Cash on Delivery */}
      <button
        type="button"
        className="w-full p-6 bg-anon-eerie-black hover:bg-anon-onyx text-white rounded-xl flex items-center justify-between border-2 border-anon-davys-gray transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-anon-davys-gray rounded-lg flex items-center justify-center">
            <span className="text-2xl">💵</span>
          </div>
          <div className="text-left">
            <p className="font-bold text-anon-5">Cash on Delivery</p>
            <p className="text-anon-8 text-anon-sonic-silver">Pay when you receive</p>
          </div>
        </div>
        <div className="text-anon-7">→</div>
      </button>
    </div>
  );
}

// Confirmation Step Component
function ConfirmationStep({ cartItems, total, formData }: any) {
  return (
    <div className="space-y-6">
      <h3 className="text-anon-3 font-bold text-white mb-4">Order Summary</h3>
      
      {/* Cart Items */}
      <div className="space-y-3">
        {cartItems.map((item: any) => (
          <div key={item.id} className="flex justify-between items-center p-4 bg-anon-eerie-black rounded-lg">
            <div>
              <p className="text-anon-6 text-white font-medium">{item.name}</p>
              <p className="text-anon-8 text-anon-sonic-silver">Qty: {item.quantity}</p>
            </div>
            <p className="text-anon-6 text-anon-salmon-pink font-bold">฿{(item.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
      </div>

      {/* Shipping Address Summary */}
      <div className="p-4 bg-anon-eerie-black rounded-lg">
        <p className="text-anon-7 text-anon-spanish-gray mb-2">Shipping to:</p>
        <p className="text-anon-6 text-white font-medium">{formData.name}</p>
        <p className="text-anon-8 text-anon-sonic-silver">{formData.phone}</p>
        <p className="text-anon-8 text-anon-sonic-silver mt-1">
          {formData.street}, {formData.city}, {formData.prefecture} {formData.postalCode}
        </p>
      </div>

      {/* Total */}
      <div className="flex justify-between items-center p-4 bg-anon-salmon-pink/10 border border-anon-salmon-pink rounded-lg">
        <span className="text-anon-5 text-white font-bold">Total Amount</span>
        <span className="text-anon-2 text-anon-salmon-pink font-black">฿{total.toFixed(2)}</span>
      </div>
    </div>
  );
}
