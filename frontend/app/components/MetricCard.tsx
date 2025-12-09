"use client";
import { useState } from "react";

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  trend?: number;
}

export default function MetricCard({ icon, label, value, trend }: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-blue-600 text-lg">{icon}</div>
            <p className="text-sm font-medium text-gray-600">{label}</p>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-semibold text-gray-900">{value}</p>
            {trend !== undefined && (
              <span className={`text-xs font-medium ${trend > 0 ? "text-red-600" : "text-green-600"}`}>
                {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
