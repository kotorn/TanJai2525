'use client';

import { Smartphone, QrCode, Wallet, CreditCard } from 'lucide-react';
import { useState, useEffect } from 'react';
import QRCodeLib from 'qrcode';

type PaymentMethod = 'promptpay' | 'thai_qr' | 'line_pay' | 'cash';

interface PaymentSelectorProps {
  amount: number;
  onPaymentMethodSelected: (method: PaymentMethod, qrData?: string) => void;
}

export function PaymentSelector({ amount, onPaymentMethodSelected }: PaymentSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [promptpayId, setPromptpayId] = useState('0000000000000'); // Merchant PromptPay ID

  const paymentMethods = [
    {
      id: 'promptpay' as PaymentMethod,
      name: 'PromptPay',
      icon: Smartphone,
      color: 'bg-blue-600',
      description: 'Scan QR with mobile banking app',
    },
    {
      id: 'thai_qr' as PaymentMethod,
      name: 'Thai QR',
      icon: QrCode,
      color: 'bg-purple-600',
      description: 'Standard Thai QR Payment',
    },
    {
      id: 'line_pay' as PaymentMethod,
      name: 'LINE Pay',
      icon: Wallet,
      color: 'bg-[#06C755]',
      description: 'Pay with LINE',
    },
    {
      id: 'cash' as PaymentMethod,
      name: 'Cash on Delivery',
      icon: CreditCard,
      color: 'bg-gray-600',
      description: 'Pay when you receive',
    },
  ];

  const generateQRCode = async (data: string) => {
    try {
      const url = await QRCodeLib.toDataURL(data, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      setQrCodeUrl(url);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const handleSelect = async (method: PaymentMethod) => {
    setSelectedMethod(method);

    if (method === 'promptpay' || method === 'thai_qr') {
      // Generate QR code data (simplified version)
      const qrData = `00020101021229370016A000000677010111${promptpayId}5303764540${amount.toFixed(2)}5802TH5913Tanjai POS6007Bangkok6304`;
      await generateQRCode(qrData);
      onPaymentMethodSelected(method, qrData);
    } else {
      onPaymentMethodSelected(method);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-anon-3 font-bold text-anon-eerie-black">
        Select Payment Method
      </h3>

      {/* Payment Methods Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.id;

          return (
            <button
              key={method.id}
              onClick={() => handleSelect(method.id)}
              className={`p-4 border-2 rounded-xl text-left transition-all ${
                isSelected
                  ? 'border-anon-salmon-pink bg-anon-salmon-pink/5'
                  : 'border-anon-cultured hover:border-anon-salmon-pink/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`${method.color} p-2 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-anon-eerie-black">{method.name}</p>
                  <p className="text-anon-8 text-anon-sonic-silver">{method.description}</p>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 bg-anon-ocean-green rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* QR Code Display */}
      {(selectedMethod === 'promptpay' || selectedMethod === 'thai_qr') && qrCodeUrl && (
        <div className="bg-white p-6 rounded-xl shadow-anon-card text-center">
          <h4 className="font-bold text-anon-eerie-black mb-4">
            Scan to Pay ฿{amount.toFixed(2)}
          </h4>
          <img src={qrCodeUrl} alt="Payment QR Code" className="mx-auto mb-4" />
          <p className="text-anon-8 text-anon-sonic-silver">
            Scan this QR code with your mobile banking app
          </p>
          <p className="text-anon-9 text-anon-spanish-gray mt-2">
            Payment will be confirmed automatically
          </p>
        </div>
      )}

      {/* LINE Pay Info */}
      {selectedMethod === 'line_pay' && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <Wallet className="w-12 h-12 text-[#06C755] mx-auto mb-3" />
          <h4 className="font-bold text-green-900 mb-2">
            Continue with LINE Pay
          </h4>
          <p className="text-anon-8 text-green-700">
            You will be redirected to LINE app to complete payment
          </p>
        </div>
      )}

      {/* Cash on Delivery */}
      {selectedMethod === 'cash' && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
          <CreditCard className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h4 className="font-bold text-gray-900 mb-2">
            Cash on Delivery
          </h4>
          <p className="text-anon-8 text-gray-700">
            Pay ฿{amount.toFixed(2)} when you receive your order
          </p>
        </div>
      )}
    </div>
  );
}
