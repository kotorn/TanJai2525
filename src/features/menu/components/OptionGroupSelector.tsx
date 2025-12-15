"use client";

import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { OptionGroup, Option } from "@/features/menu/actions/option-groups";
import { cn } from "@/lib/utils";

interface OptionGroupSelectorProps {
    group: OptionGroup;
    selectedOptions: string[]; // Array of Option IDs
    onChange: (selectedIds: string[]) => void;
    error?: string;
}

export function OptionGroupSelector({ group, selectedOptions, onChange, error }: OptionGroupSelectorProps) {
    const isMulti = group.max_selection > 1;

    const handleToggle = (optionId: string) => {
        if (isMulti) {
            // Multi-select logic
            if (selectedOptions.includes(optionId)) {
                onChange(selectedOptions.filter(id => id !== optionId));
            } else {
                if (selectedOptions.length < group.max_selection) {
                    onChange([...selectedOptions, optionId]);
                }
            }
        } else {
            // Single-select logic
            onChange([optionId]);
        }
    };

    return (
        <div className={cn("space-y-3 p-4 border rounded-lg", error ? "border-red-500 bg-red-50" : "border-gray-100 bg-white")}>
            <div className="flex justify-between items-baseline">
                <div>
                    <h3 className="font-bold text-gray-900">
                        {group.name}
                        {group.required && <span className="text-red-500 ml-1">*</span>}
                    </h3>
                    <p className="text-xs text-gray-500">
                        {isMulti 
                            ? `Select up to ${group.max_selection}` 
                            : 'Select one'}
                    </p>
                </div>
                {error && <span className="text-xs font-bold text-red-600">{error}</span>}
            </div>

            <div className="space-y-2">
                {group.options.map((opt) => {
                    const isSelected = selectedOptions.includes(opt.id);
                    return (
                        <div 
                            key={opt.id}
                            className={cn(
                                "flex items-center justify-between p-3 rounded-md border cursor-pointer transition-colors",
                                isSelected ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:bg-gray-50",
                                !opt.is_available && "opacity-50 pointer-events-none bg-gray-100"
                            )}
                            onClick={() => opt.is_available && handleToggle(opt.id)}
                        >
                            <div className="flex items-center gap-3">
                                {isMulti ? (
                                    <Checkbox checked={isSelected} className="pointer-events-none" />
                                ) : (
                                    <div className={cn(
                                        "w-4 h-4 rounded-full border flex items-center justify-center",
                                        isSelected ? "border-orange-600" : "border-gray-400"
                                    )}>
                                        {isSelected && <div className="w-2 h-2 rounded-full bg-orange-600" />}
                                    </div>
                                )}
                                <span className={cn("text-sm font-medium", !opt.is_available && "line-through")}>
                                    {opt.name}
                                </span>
                            </div>
                            
                            {opt.price !== 0 && (
                                <span className="text-xs font-medium text-gray-600">
                                    {opt.price > 0 ? '+' : ''}{opt.price}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
