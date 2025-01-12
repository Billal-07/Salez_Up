import React, { useState } from "react";
import 'react-circular-progressbar/dist/styles.css';

const Agent_Ranking_chart = ({ leaderboardData }) => {

    const [activeButton, setActiveButton] = useState("Month");
    const buttons = ["Day", "Week", "Month", "Year"];

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
            {/* Header Section */}
            <div className="flex items-center justify-between px-6">
                {/* Heading */}
                <h1 className=" text-xl text-[#009245]">Agent Ranking: Performance vs Actual</h1>

                {/* Buttons */}
                <div className="flex space-x-2">
                    {buttons.map((button) => (
                        <button
                            key={button}
                            onClick={() => setActiveButton(button)}
                            className={`px-3 py-1 text-sm font-medium border border-gray-300 bg-white ${activeButton === button
                                    ? "text-[#269F8B] shadow-xl"
                                    : "text-[#ABABAB]"
                                }`}
                        >
                            {button}
                        </button>
                    ))}
                </div>
            </div>

            {/* Leaderboard Section */}
            <div className="px-6 mt-4">
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

    return (

        <div>
            <Leaderboard leaderboardData={leaderboardData} />
        </div>
    );
};

export default Agent_Ranking_chart;
