import React from 'react';
import { Settings } from 'lucide-react';

const SettingsPanel = ({
  wordBanks,
  selectedBank,
  setSelectedBank,
  dailyGoal,
  setDailyGoal,
}) => {
  return (
    <div className="fixed bottom-4 right-4">
      <div className="bg-white rounded-2xl shadow-xl p-4">
        <div className="flex items-center gap-4">
          <Settings className="w-5 h-5 text-gray-600" />
          <select
            value={selectedBank}
            onChange={(e) => setSelectedBank(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          >
            {Object.entries(wordBanks).map(([key, bank]) => (
              <option key={key} value={key}>
                {bank.name} ({bank.count}词)
              </option>
            ))}
          </select>
          
          <input
            type="number"
            min="10"
            max="100"
            step="5"
            value={dailyGoal}
            onChange={(e) => setDailyGoal(parseInt(e.target.value))}
            className="w-20 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
