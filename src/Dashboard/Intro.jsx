import React from 'react';
import 'react-circular-progressbar/dist/styles.css';

const Intro = () => {

    const tiers = [
        { name: 'Bronze', points: '0-100 Points', icon: '/images/bronze.png', color: 'bg-amber-700' },
        { name: 'Silver', points: '100-300 Points', icon: '/images/silver.png', color: 'bg-gray-400' },
        { name: 'Gold', points: '300-500 Points', icon: '/images/gold.png', color: 'bg-yellow-500' },
        { name: 'Platinum', points: '500-700 Points', icon: '/images/platinium.png', color: 'bg-gray-600' },
        { name: 'Unicorn', points: '700-1000 Points', icon: '/images/unicorn.png', color: 'bg-blue-400' },
      ];
    

  return (
<>
  <div className='w-auto mt-8 md:ml-12 mr-5 flex flex-col gap-[32px] mb-4 bg-pink-300'>

    <div className='bg-yellow-300 relative z-10'>
      <p>This is the yellow div</p>
    </div>

    <div className='flex flex-col w-full gap-6 p-8 pb-12 card bg-gray-100 relative z-0'>
      <div className="flex justify-between items-center w-full">
        {tiers.map((tier, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <img src={tier.icon} alt={tier.name} className="w-16 h-16" />
            <div className="text-center">
              <p className="font-medium text-gray-700">{tier.name}</p>
              <p className="text-sm text-gray-500">{tier.points}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

  </div>
</>

  );
};

export default Intro;