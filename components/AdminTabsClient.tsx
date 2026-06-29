"use client";

import { ReactNode, useState } from "react";

interface Props {
  pendingCount: number;
  openReports: number;
  pendingSuggestions: number;
  overviewTab: ReactNode;
  sellersTab: ReactNode;
  usersTab: ReactNode;
  reportsTab: ReactNode;
  suggestionsTab: ReactNode;
}

const TABS = ["Overview", "Sellers", "Users & Sign-ins", "Reports", "Suggestions"] as const;
type Tab = typeof TABS[number];

export function AdminTabsClient({
  pendingCount,
  openReports,
  pendingSuggestions,
  overviewTab,
  sellersTab,
  usersTab,
  reportsTab,
  suggestionsTab,
}: Props) {
  const [active, setActive] = useState<Tab>("Overview");

  const badges: Record<Tab, number> = {
    "Overview": pendingCount,
    "Sellers": 0,
    "Users & Sign-ins": 0,
    "Reports": openReports,
    "Suggestions": pendingSuggestions,
  };

  return (
    <div>
      <div className="flex gap-1 border-b border-gray-200 mb-8 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition border-b-2 -mb-px ${
              active === tab
                ? "border-green-600 text-green-700"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            {tab}
            {badges[tab] > 0 && (
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                tab === "Reports" ? "bg-red-100 text-red-700" :
                tab === "Suggestions" ? "bg-blue-100 text-blue-700" :
                "bg-yellow-100 text-yellow-700"
              }`}>
                {badges[tab]}
              </span>
            )}
          </button>
        ))}
      </div>

      {active === "Overview" && overviewTab}
      {active === "Sellers" && sellersTab}
      {active === "Users & Sign-ins" && usersTab}
      {active === "Reports" && reportsTab}
      {active === "Suggestions" && suggestionsTab}
    </div>
  );
}
