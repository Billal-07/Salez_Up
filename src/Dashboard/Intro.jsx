import React from 'react';
import { BadgeCheck, Trophy, Clock, Star } from 'lucide-react';

const Intro = () => {

  const tiers = [
    { name: 'Bronze', points: '0-100 Points', icon: '/images/bronzes.png', textColor: 'text-[#A35100]' },
    { name: 'Silver', points: '100-300 Points', icon: '/images/silver.png', textColor: 'text-[#636363]' },
    { name: 'Gold', points: '300-500 Points', icon: '/images/gold.png', textColor: 'text-[#A35100]' },
    { name: 'Platinum', points: '500-700 Points', icon: '/images/platinium.png', textColor: 'text-[#5F5F5F]' },
    { name: 'Unicorn', points: '700-1000 Points', icon: '/images/unicorn.png', textColor: 'text-blue-400' },
  ];

  return (
    <div className="w-auto mt-8 md:ml-12 mr-5 flex flex-col gap-[32px] mb-4">
      <div className="flex flex-col w-auto gap-6 p-8 pb-12 card">
        {/* Profile Section */}
        <div className="flex items-start gap-8">
          <div className="flex-1">
            <div className="flex flex-row w-full">
              <div className='relative flex flex-col w-full'>
                <h2 className="text-2xl text-gray-600 mt-6 mb-6"><span className="font-bold">Good Morning</span>, Nshali</h2>
                <div className='flex flex-row'>
                  {/* Profile Image */}
                  <img
                    src="/images/dashboard_img3.png"
                    alt="Profile"
                    className="w-[150px] h-[150px] rounded-full object-cover border-4 border-white shadow-lg"
                  />

                  {/* Badge */}
                  <div className="absolute top-44 left-24 w-[60px] h-[60px] rounded-full">
                    <img
                      src="/images/unicorn.png"
                      alt="Badge"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div className='flex flex-col mt-8 ml-5'>
                    <p className="text-gray-500 text-xl mb-2">Sales Agent</p>
                    <h3 className="text-3xl font-normal text-gray-600">Sarah Smart</h3>
                    <button
                      className="mt-4 px-4 py-[4px] w-2/3 text-white font-medium rounded-lg"
                      style={{
                        background: "linear-gradient(to right, #30c4fe 0%, #7a75fd 50%, #be95be 80%)"
                      }}
                    >
                      <p className='text-2xl'>Unicorn</p>
                    </button>
                  </div>
                </div>

              </div>

              {/* Headings */}
              {/* <div className="flex flex-col -mt-16 ml-10 justify-center items-center text-center">
              </div> */}
            </div>

          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-x-16 gap-y-4 mt-6">

            <div className="max-w-xs bg-white rounded-xl shadow-sm border-l-4 border-purple-400 p-4">
              <div className="flex flex-col">
                <span className="text-gray-400 text-lg">Points</span>
                <div className="flex items-center gap-2 mt-4">
                  <img src='images/star.png' alt='Star' className='w-6 h-6 mt-[-2px]' />
                  <span className="text-gray-700 text-xl font-normal">875</span>
                </div>
              </div>
            </div>


            <div className="max-w-xs bg-white rounded-xl shadow-sm border-l-4 border-purple-400 p-4">
              <div className="flex flex-col">
                <span className="text-gray-400 text-lg">Points</span>
                <div className="flex items-center gap-2 mt-4">
                  <img src='images/bag.png' alt='Star' className='w-6 h-6 mt-[-2px]' />
                  <span className="text-gray-700 text-xl font-normal">875</span>
                </div>
              </div>
            </div>

            <div className="max-w-xs bg-white rounded-xl shadow-sm border-l-4 border-purple-400 p-4">
              <div className="flex flex-col">
                <span className="text-gray-400 text-lg">Points</span>
                <div className="flex items-center gap-2 mt-4">
                  <img src='images/trophy.png' alt='Star' className='w-6 h-6 mt-[-2px]' />
                  <span className="text-gray-700 text-xl font-normal">875</span>
                </div>
              </div>
            </div>

            <div className="max-w-xs bg-white rounded-xl shadow-sm border-l-4 border-purple-400 p-4 relative mt-4">
              <div className="flex flex-col">
                <span className="text-gray-400 text-lg">Points</span>
                <div className="flex items-center gap-2 mt-4">
                  <img src='images/prizee.png' alt='Star' className='w-6 h-6 mt-[-2px]' />
                  <span className="text-gray-700 text-xl font-normal">875</span>
                </div>
              </div>
            </div>

            <div className="max-w-xs bg-white rounded-xl shadow-sm border-l-4 border-purple-400 p-4 relative mt-4">
              <div className="flex flex-col">
                <span className="text-gray-400 text-lg">Points</span>
                <div className="flex items-center gap-2 mt-4">
                  <img src='images/time.png' alt='Star' className='w-8 h-8 mt-[-2px]' />
                  <span className="text-gray-700 text-xl font-normal">875</span>
                </div>
              </div>
            </div>

            <div className="max-w-xs bg-white rounded-xl shadow-sm border-l-4 border-purple-400 p-4 relative mt-4">
              <div className="flex flex-col">
                <span className="text-gray-400 text-lg">Points</span>
                <div className="flex items-center gap-2 mt-4">
                  <img src='images/bag.png' alt='Star' className='w-6 h-6 mt-[-2px]' />
                  <span className="text-gray-700 text-xl font-normal">875</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Tiers Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center bg-gray-50 rounded-xl p-6">
            {tiers.map((tier, index) => (
              <div key={index} className="flex flex-col items-center">
                {/* Tier Icon */}
                <div className=" rounded-full mb-2 flex items-center justify-center">
                  <img
                    src={tier.icon}
                    alt={tier.name}
                    className="w-[60%] h-[60%] rounded-full object-cover"
                  />
                </div>
                {/* Tier Name */}
                <p className={`font-medium mb-1 ${tier.textColor}`}>{tier.name}</p>
                {/* Tier Points */}
                <p className="text-xs text-gray-500">{tier.points}</p>
              </div>
            ))}
          </div>
        </div>



      </div>
    </div>
  );
};

export default Intro;