import React from 'react';
import 'react-circular-progressbar/dist/styles.css';


const ContestSummary = () => {

    const prizes = [
        { name: 'Cash', amount: 50, iconSrc: '/images/cash.png' },
        { name: 'Vouchers', amount: 50, iconSrc: '/images/voucher.png' },
        { name: 'Food', amount: 50, iconSrc: '/images/food.png' },
        { name: 'Experiences', amount: 0, iconSrc: '/images/experience.png' }
    ];


    const Badge = ({ rank }) => {
        const images = {
            1: '/images/1stprizes.png',
            2: '/images/2prize.png',
            3: '/images/3prize.png',
        };

        return (
            <>
                {rank <= 3 && (
                    <div className="absolute -top-1  w-8 h-8 rounded-full">
                        <img
                            src={images[rank]}
                            alt={`Rank ${rank}`}
                            className="w-full h-[40px] object-cover"
                        />
                    </div>
                )}
            </>
        );
    };

    const LeaderboardItem = ({ rank, name, score, image, badgess }) => (
        <div className="flex items-center mb-4 w-full">

            <div className="relative w-10 text-center ">
                <Badge rank={rank} />
                <div className={`w-10 text-center text-lg font-semibold ${rank <= 3 ? 'invisible' : 'text-[#327D71]'}`}>
                    {rank}
                </div>
            </div>

            <div className="relative w-16 h-16 rounded-full">
                <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover"
                />

                <img
                    src={badgess}
                    alt="Badge"
                    className="absolute bottom-0 top-9 left-10 w-8 h-8 z-10"
                />
            </div>



            <div className="text-sm font-semibold ml-4 w-32 truncate text-[#009245]">{name}</div>
            <div className="flex-grow mx-4 relative ">
                <div className="bg-[#C6E5D5] rounded-full h-3 relative overflow-hidden">
                    <div
                        className="h-3 rounded-full"
                        style={{
                            width: `${Math.min((score / 220) * 100, 100)}%`,
                            background: 'linear-gradient(90deg, #1A7465 0%, #2DDAB9 100%)',
                        }}
                    ></div>
                    <div
                        className="absolute font-bold bg-white text-[#009245] text-xs rounded px-4 py-1"
                        style={{
                            top: '-6px',
                            left: `calc(${Math.min((score / 220) * 100, 100)}% - 20px)`,
                            zIndex: 10,
                        }}
                    >
                        {score}
                    </div>
                    <div
                        className="absolute top-0 h-3 bg-transparent"
                        style={{
                            left: `${Math.min((score / 210) * 100, 100)}%`,
                            right: 0,
                        }}
                    ></div>
                </div>
            </div>
        </div>
    );


    const Leaderboard = ({ leaderboardData }) => (
        <div className="rounded-lg shadow-sm border-2 border-gray-100 py-8 mt-4 w-full max-w-10xl">
            <div className="px-6">
                {leaderboardData.map((item, index) => (
                    <LeaderboardItem
                        key={index}
                        rank={index + 1}
                        name={item.name}
                        score={item.score}
                        image={item.image}
                        badgess={item.badge}
                    />
                ))}
            </div>
        </div>
    );

    const contestants = [
        { name: 'Sarah Smith', level: 'Unicorn', points: 200, money: 150, avatar: '/images/dashboard_img1.png', badgeColor: '/images/unicorn.png' },
        { name: 'Anujaa Kumar', level: 'Platinum', points: 150, money: 100, avatar: '/images/dashboard_img2.png', badgeColor: '/images/platinium.png' },
        { name: 'Fernanda Celde', level: 'Gold', points: 75, money: 50, avatar: '/images/dashboard_img3.png', badgeColor: '/images/gold.png' },
    ];

    const leaderboardData = [
        { name: 'Sarah Smith', score: 200, image: '/images/dashboard_img1.png', badge: '/images/unicorn.png' },
        { name: 'Anujaa Kumar', score: 150, image: '/images/dashboard_img2.png', badge: '/images/platinium.png' },
        { name: 'Fernando Celde', score: 75, image: '/images/dashboard_img3.png', badge: '/images/gold.png' },
        { name: 'Pinaji Koarima', score: 74, image: '/images/dashboard_img1.png', badge: '/images/silver.png' },
        { name: 'Nava Yaghnel', score: 60, image: '/images/dashboard_img2.png', badge: '/images/silver.png' },
        { name: 'Monaki Nahans', score: 50, image: '/images/dashboard_img3.png', badge: '/images/bronze.png' },
        { name: 'Tians jdife', score: 35, image: '/images/dashboard_img2.png', badge: '/images/bronze.png' },
        { name: 'Nualiri sjahej', score: 20, image: '/images/dashboard_img1.png', badge: '/images/bronze.png' },
    ];


    return (

        <>
                <div className='w-auto mt-8 md:ml-12 mr-5 flex flex-col gap-[32px] mb-4'>                   
                    <div className='flex flex-col w-auto gap-6 p-8 pb-12 card'>
                        <div className='flex justify-between items-center mb-4'>
                            <h1 className='font-[500] leading-[33px] text-[22px] text-[#269F8B]'>Contest Summary</h1>
                            <div className='flex'>
                                <button className='px-3 py-1 text-sm font-medium text-[#ABABAB] border-t border-b border-r border-l border-gray-300 bg-white'>Week</button>
                                <button className='px-6 py-1 text-sm font-medium text-[#269F8B] border border-gray-300 bg-white rounded-l shadow-xl'>Month</button>
                                <button className='px-3 py-1 text-sm font-medium text-[#ABABAB] border-t border-b border-r border-gray-300 bg-white'>Year</button>
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <div className="flex h-24 px-4 space-x-10 rounded-lg border-b-4 border-[#009245]/5">
                                <div className="flex flex-row items-center pl-1 space-x-14 pr-1 border-r-4 border-[#009245]/5">
                                    <img src='/images/medals.png' alt='Medal' className="w-[23px] h-[50.18px]" />
                                    <p className="text-black text-[15px] font-normal">CONTESTS</p>
                                    <h2 className="text-white bg-themeGreen px-4 py-[10px] rounded-xl text-xl font-semibold ">2</h2>
                                </div>
                                <div className="flex flex-row items-center pl-1 space-x-14 pr-1 border-r-4 border-[#009245]/5">
                                    <img src='/images/stars.png' alt='Medal' className="w-[33px] h-[30.7px]" />
                                    <p className="text-black text-[15px] font-normal">POINTS</p>
                                    <h2 className="text-white bg-themeGreen px-4 py-[10px] rounded-xl text-xl font-semibold">200</h2>
                                </div>
                                <div className="flex flex-row items-center pl-1 space-x-14 pr-1 ">
                                    <img src='/images/cashBag.png' alt='Medal' className="w-[33px] h-[41px]" />
                                    <p className="text-black text-[15px] font-normal">TOTAL PRIZES</p>
                                    <h2 className="text-white bg-themeGreen px-4 py-[10px] rounded-xl text-xl font-semibold">$150</h2>
                                </div>
                            </div>

                            <div className="flex p-1">
                                {prizes.map((prize, index) => (
                                    <div
                                        key={index}
                                        className="w-full p-4 flex items-center space-x-4 bg-white shadow-md"
                                    >
                                        <img src={prize.iconSrc} alt={prize.name} className="w-[39.2px] h-[30.36px]" />
                                        <p className="text-[#000000] text-[11.76px] font-normal">{prize.name}</p>
                                        <h2 className="bg-white shadow-lg p-2 text-[#269F8B] text-lg font-semibold shadow-[#00A46C26]">${prize.amount}</h2>
                                    </div>
                                ))}
                            </div>

                        </div>

                        <div className="container mx-auto">

                            <div className='flex justify-center  bg-white rounded-lg shadow-sm order-2 border-2 border-gray-100 py-8'>
                                {contestants.map((contestant, index) => (
                                    <div key={index} className='flex flex-col items-center mx-4 '>
                                        <div className='relative'>
                                            <img src={contestant.avatar} alt={contestant.name} className='w-[173px] h-[173px] rounded-full' />
                                            <div className='absolute top-32  left-24 w-[81px] h-[81px] rounded-full'>
                                                <img src={contestant.badgeColor} alt='Badge' className='w-full h-full object-cover rounded-full' />
                                            </div>
                                        </div>
                                        <p className='mt-10 text-lg font-medium text-[#009245]'>{contestant.name}</p>
                                        <p className={`mt-1 text-base font-bold bg-clip-text text-transparent ${index == 0 ? 'bg-gradient-to-r from-[#1DD6FF] to-[#D21EFF]' : index == 1 ? 'bg-[#4F4F4F]' : 'bg-[#FFC700]'}`}>{contestant.level}</p>
                                        <div className='flex items-center mt-1'>
                                            <img src='images/star.png' alt='Star' className='w-6 h-6 mt-1' />
                                            <span className='ml-1 text-base text-[#6A6A6A] font-medium'>{contestant.points} points</span>
                                        </div>
                                        <div className='flex items-center mt-1'>
                                            <img src='images/bag.png' alt='Star' className='w-6 h-6 mt-1' />
                                            <span className='ml-2 text-base text-[#6A6A6A] font-medium'>${contestant.money}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>



                            <div>
                                <Leaderboard leaderboardData={leaderboardData} />
                            </div>


                        </div>
                    </div>



                    {/* ______________________________________________________________________________________________________ */}

                </div>
        </>

    )
}

export default ContestSummary;