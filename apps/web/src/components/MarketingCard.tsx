"use client";
import React from "react";
import { LucideIcon } from "lucide-react";

interface MarketingCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

export default function MarketingCard({
  icon: Icon,
  title,
  description,
  color,
}: MarketingCardProps) {
  return (
    <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 hover:shadow-2xl transition-all group">
      <div
        className={`${color} p-4 rounded-2xl w-fit mb-6 text-white shadow-lg`}
      >
        <Icon size={32} />
      </div>
      <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tighter">
        {title}
      </h3>
      <p className="text-slate-500 font-medium leading-relaxed">
        {description}
      </p>
    </div>
  );
}
