"use client";

import { useState, useEffect, useMemo } from "react";
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerDescription, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { OptionGroup, MenuOption } from "@/features/menu/types";
import { useCartStore } from "../store/cart-store";
import { Minus, Plus, X } from "lucide-react";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ItemDetailsModalProps {
    item: any | null;
    open: boolean;
    onClose: () => void;
}

export default function ItemDetailsModal({ item, open, onClose }: ItemDetailsModalProps) {
    const [quantity, setQuantity] = useState(1);
    // State to track selected options. Key = GroupID, Value = Array of OptionIDs
    const [selections, setSelections] = useState<Record<string, string[]>>({});
    
    // Reset state when item changes
    useEffect(() => {
        if (open && item) {
            setQuantity(1);
            
            // Initialize defaults
            const initialSelections: Record<string, string[]> = {};
            if (item.options && Array.isArray(item.options)) {
                (item.options as OptionGroup[]).forEach(group => {
                    const defaultOptions = group.options
                        .filter(opt => opt.is_default)
                        .map(opt => opt.id);
                    
                    if (defaultOptions.length > 0) {
                        initialSelections[group.id] = defaultOptions;
                    } else if (group.required && group.max_selection === 1 && group.options.length > 0) {
                        // Auto-select first if required and single select (UX choice)
                        initialSelections[group.id] = [group.options[0].id];
                    } else {
                        initialSelections[group.id] = [];
                    }
                });
            }
            setSelections(initialSelections);
        }
    }, [open, item]);

    const addItem = useCartStore(state => state.addItem);

    if (!item) return null;

    const options = (item.options || []) as OptionGroup[];

    // Calculate total price
    const basePrice = item.price;
    const optionsPrice = options.reduce((total, group) => {
        const groupSelections = selections[group.id] || [];
        const groupPrice = groupSelections.reduce((gTotal, optId) => {
            const opt = group.options.find(o => o.id === optId);
            return gTotal + (opt?.price || 0);
        }, 0);
        return total + groupPrice;
    }, 0);
    
    const unitPrice = basePrice + optionsPrice;
    const totalPrice = unitPrice * quantity;

    const handleOptionToggle = (groupId: string, optionId: string, isMulti: boolean) => {
        setSelections(prev => {
            const current = prev[groupId] || [];
            if (isMulti) {
                if (current.includes(optionId)) {
                    return { ...prev, [groupId]: current.filter(id => id !== optionId) };
                } else {
                    return { ...prev, [groupId]: [...current, optionId] };
                }
            } else {
                // Single select - replace
                return { ...prev, [groupId]: [optionId] };
            }
        });
    };

    const handleAddToCart = () => {
        // Validate Required Groups
        for (const group of options) {
            const groupSelections = selections[group.id] || [];
            if (group.required && groupSelections.length === 0) {
                toast.error(`Please select ${group.name}`);
                return;
            }
        }

        // Build selected options list for Cart Item
        const selectedOptionsList: { groupName: string, optionName: string, price: number }[] = [];
        
        options.forEach(group => {
            const groupSelections = selections[group.id] || [];
            groupSelections.forEach(optId => {
                const opt = group.options.find(o => o.id === optId);
                if (opt) {
                    selectedOptionsList.push({
                        groupName: group.name,
                        optionName: opt.name,
                        price: opt.price
                    });
                }
            });
        });

        addItem({
            menuItemId: item.id,
            name: item.name,
            price: unitPrice,
            quantity: quantity,
            image_url: item.image_url,
            selectedOptions: selectedOptionsList
        });

        toast.success("Added to order");
        onClose();
    };

    return (
        <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
            <DrawerContent className="max-h-[96vh] flex flex-col">
                <div className="flex-1 overflow-y-auto">
                    {/* Header Image */}
                    <div className="relative h-48 w-full bg-gray-100 shrink-0">
                         {item.image_url ? (
                            <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                No Image
                            </div>
                        )}
                        <Button 
                            variant="secondary" 
                            size="icon" 
                            className="absolute top-4 right-4 rounded-full bg-white/80 backdrop-blur-sm"
                            onClick={onClose}
                        >
                            <X className="size-4" />
                        </Button>
                    </div>

                    <div className="p-4 space-y-6 pb-32">
                        {/* Title & Description */}
                        <div>
                            <div className="flex justify-between items-start">
                                <h2 className="text-2xl font-bold">{item.name}</h2>
                                <span className="text-xl font-bold text-orange-600">฿{unitPrice}</span>
                            </div>
                            <p className="text-gray-500 mt-1">{item.description}</p>
                        </div>

                        {/* Options */}
                        <div className="space-y-6">
                            {options.map(group => (
                                <div key={group.id} className="space-y-3">
                                    <div className="flex justify-between items-baseline">
                                        <h3 className="font-bold text-lg">
                                            {group.name}
                                            {group.required && <span className="text-red-500 ml-1">*</span>}
                                        </h3>
                                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                                            {group.max_selection > 1 ? 'Select Multiple' : 'Select One'}
                                        </span>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {group.options.map(opt => {
                                            const isSelected = (selections[group.id] || []).includes(opt.id);
                                            return (
                                                <div 
                                                    key={opt.id} 
                                                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                                                        isSelected ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:bg-gray-50'
                                                    }`}
                                                    onClick={() => handleOptionToggle(group.id, opt.id, group.max_selection > 1)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {group.max_selection > 1 ? (
                                                            <Checkbox checked={isSelected} id={opt.id} className="pointer-events-none" />
                                                        ) : (
                                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                                                isSelected ? 'border-orange-600' : 'border-gray-400'
                                                            }`}>
                                                                {isSelected && <div className="w-2 h-2 rounded-full bg-orange-600" />}
                                                            </div>
                                                        )}
                                                        <span className="font-medium text-gray-700">{opt.name}</span>
                                                    </div>
                                                    {opt.price > 0 && (
                                                        <span className="text-sm text-gray-500">+฿{opt.price}</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t bg-white absolute bottom-0 left-0 right-0 z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center justify-between gap-4 mb-4">
                        <div className="flex items-center border rounded-lg bg-gray-50">
                            <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                                <Minus className="size-4" />
                            </Button>
                            <span className="w-8 text-center font-bold text-lg">{quantity}</span>
                            <Button variant="ghost" size="icon" onClick={() => setQuantity(quantity + 1)}>
                                <Plus className="size-4" />
                            </Button>
                        </div>
                    </div>
                    <Button className="w-full h-12 text-lg font-bold" onClick={handleAddToCart}>
                        Add to Order - ฿{totalPrice}
                    </Button>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
