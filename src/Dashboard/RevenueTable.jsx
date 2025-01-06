import React from 'react';

const RevenueTable = () => {
  const agents = [
    {
      name: 'Nava Yaghnsi',
      target: 50,
      rank: 1,
      image: '/api/placeholder/48/48'
    },
    {
      name: 'Anujaa Kumar',
      target: 45,
      rank: 2,
      image: '/api/placeholder/48/48'
    },
    {
      name: 'Nuraj Nujaraj',
      target: 45,
      rank: 3,
      image: '/api/placeholder/48/48'
    }
  ];

  return (
    <div className="flex gap-4">
      {/* Agent Leaderboard Card */}
      <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-blue-50 rounded-md flex items-center justify-center">
            <span className="text-blue-600">3</span>
          </div>
          <h2 className="text-lg font-semibold">Agent Leaderboard</h2>
        </div>
        
        <div className="space-y-4">
          {agents.map((agent, index) => (
            <div key={agent.name} className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={agent.image}
                  alt={agent.name}
                  className="w-12 h-12 rounded-full"
                />
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs text-white ${
                  index === 0 ? 'bg-yellow-400' : 
                  index === 1 ? 'bg-gray-400' : 
                  'bg-orange-400'
                }`}>
                  {agent.rank}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{agent.name}</h3>
                <p className="text-sm">
                  <span className="text-green-600">{agent.target}%</span>
                  <span className="text-gray-500"> to target</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Forecast Commission Card */}
      <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Forecast Commission</h2>
          <div className="text-green-600 text-sm">↑ 2.5%</div>
        </div>
        
        <div className="text-2xl font-bold mb-6">$560</div>
        
        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Actual vs Target</span>
              <span className="text-green-600">50% to target</span>
            </div>
            <div className="relative h-2 bg-gray-100 rounded-full">
              <div className="absolute h-full w-1/2 bg-red-400 rounded-full" />
              <div className="absolute top-1/2 left-1/2 -translate-y-1/2 bg-white border border-red-400 rounded-full px-2 py-1 text-xs">
                $5k
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>$0</span>
              <span>$10k</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Forecast Finish</span>
              <span className="text-green-600">+112% to target</span>
            </div>
            <div className="relative h-2 bg-gray-100 rounded-full">
              <div className="absolute h-full w-4/5 bg-green-500 rounded-full" />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>$0</span>
              <span>$15k</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueTable;