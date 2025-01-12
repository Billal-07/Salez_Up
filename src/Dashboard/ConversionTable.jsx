import React, { useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { FaArrowUp } from "react-icons/fa";
import Agent_Ranking_chart from "./Agent_Ranking_chart";
import Agent_barchart from "./Agent_barchart";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const HalfDonutChart = ({ data, colors }) => {
  const options = {
    rotation: -90, // Start at the top
    circumference: 180, // Half circle (180 degrees)
    cutout: "90%", // Adjust the thickness of the donut
    plugins: {
      legend: {
        display: false, // Hides the legend
      },
      tooltip: {
        enabled: false, // Disables tooltip
      },
    },
  };

  const chartData = {
    labels: ["Progress", "Remaining"],
    datasets: [
      {
        data: data,
        backgroundColor: colors,
        hoverBackgroundColor: colors,
        borderWidth: 0,
      },
    ],
  };

  return (
    <div style={{ width: "250px", height: "160px", marginLeft: "18%" }}> {/* Adjusted size */}
      <Doughnut data={chartData} options={options} />
    </div>
  );
};


const ConversionTable = () => {
  const agents = [
    {
      name: "Nava Yaghnsı",
      target: "50% to target",
      rank: 1,
      image: "/images/dashboard_img1.png",
    },
    {
      name: "Anujaa Kumar",
      target: "45% to target",
      rank: 2,
      image: "/images/dashboard_img2.png",
    },
    {
      name: "Nuraj Nujaraj",
      target: "45% to target",
      rank: 3,
      image: "/images/dashboard_img3.png",
    },
  ];

  const [leaderboardData, setLeaderboardData] = useState([
    { name: 'Charlotte King', score: 200, image: '/images/dashboard_img1.png', badge: '/images/unicorn.png' },
    { name: 'James White', score: 180, image: '/images/dashboard_img2.png', badge: '/images/platinium.png' },
    { name: 'Amelia Clark', score: 170, image: '/images/dashboard_img3.png', badge: '/images/gold.png' },
    { name: 'Ethan Lewis', score: 160, image: '/images/dashboard_img1.png', badge: '/images/silver.png' },
    { name: 'Harper Young', score: 140, image: '/images/dashboard_img2.png', badge: '/images/silver.png' },
    { name: 'Elijah Hall', score: 110, image: '/images/dashboard_img3.png', badge: '/images/bronze.png' },
    { name: 'Mila Turner', score: 90, image: '/images/dashboard_img2.png', badge: '/images/bronze.png' },
    { name: 'Logan Scott', score: 70, image: '/images/dashboard_img1.png', badge: '/images/bronze.png' },
  ]);

  const [barChartData, setBarChartData] = useState([
    { month: 'Jan', value: 9700 },
    { month: 'Feb', value: 6200 },
    { month: 'Mar', value: 8900 },
    { month: 'Apr', value: 3000 },
    { month: 'May', value: 4500 },
    { month: 'Jun', value: 7600 },
    { month: 'Jul', value: 8900 },
    { month: 'Aug', value: 6700 },
    { month: 'Sep', value: 9200 },
    { month: 'Oct', value: 2900 },
    { month: 'Nov', value: 11600 },
    { month: 'Dec', value: 5400 },
  ]);

  return (
    <div className="w-full flex flex-col space-y-4">
      <div className="w-full flex flex-row justify-between space-x-2">
        <div className="w-1/2 rounded-lg shadow p-6 max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <div className="text-2xl flex items-center">
              <img
                src="/images/3campaign.png"
                alt="3 Campaign"
                className="w-8 h-8 mr-2"
              />
              <p className="text-[#009245]">BDR</p>
            </div>
            <div className="text-base text-[#009245]">
              Agent Leaderboard
            </div>
          </div>
          <div className="flex justify-around">
            {agents.map((agent, index) => (
              <div key={index} className="text-center">
                <div className="relative">
                  <img
                    src={agent.image}
                    alt={agent.name}
                    className="w-20 h-20 rounded-full border-4 border-gray-200 mx-auto"
                  />
                  <div className="absolute -bottom-2 right-0 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                    <img
                      src={
                        agent.rank === 1
                          ? "/images/1stprizes.png"
                          : agent.rank === 2
                            ? "/images/2prize.png"
                            : "/images/3prize.png"
                      }
                      alt={`Rank ${agent.rank}`}
                      className="w-full h-full rounded-full"
                    />
                  </div>
                </div>
                <h3 className="mt-4 text-[#009245] font-semibold text-[15px]">{agent.name}</h3>
                <p className="text-[#009245] text-[12px] font-semibold">{agent.target}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 w-3/5 max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-lg text-[#009245]">Forecast Commission</p>
              <h2 className="text-xl font-bold text-green-600">$210</h2>
            </div>
            <div className="flex items-center text-[#009245] font-medium">
              <FaArrowUp className="mr-1" />
              <span>3.5%</span>
            </div>
          </div>

          {/* Actual vs Target and Forecast Finish */}
          <div className="flex items-center justify-between">
            {/* Actual vs Target */}
            <div className="flex-1 flex flex-col justify-center items-center text-center">
              <h3 className="font-medium text-gray-800">Actual vs Target</h3>
              <p className="text-xs text-green-600 mb-4">105% to target</p>

              {/* Half-Donut Chart */}
              <div className="relative flex justify-center items-center -mt-9">
                <HalfDonutChart
                  data={[100, 0]} // Progress and remaining
                  colors={["#289780", "#f3f4f6"]} // Progress and remaining colors
                />
                <div className="absolute inset-0 flex mt-16 flex-col justify-evenly items-center">
                  <p className="text-green-500 text-2xl font-light">21%</p>
                  <div className="flex justify-evenly space-x-20 text-sm text-gray-500 w-full">
                    <span>0%</span>
                    <span>20%</span>
                  </div>
                </div>
              </div>
              {/* <p className="text-sm text-red-400 mt-2">Gatekeeper</p> */}
            </div>

            {/* Divider */}
            <div className="w-px bg-gray-300 h-40 mx-4"></div>

            {/* Forecast Finish */}
            <div className="flex-1 flex flex-col justify-center items-center text-center">
              <h3 className="font-medium text-gray-800">Forecast Finish</h3>
              <p className="text-xs text-green-600 mb-4">^ 105% to target</p>

              {/* Half-Donut Chart */}
              <div className="relative flex justify-center items-center -mt-9">
                <HalfDonutChart
                  data={[80, 20]} // Progress and remaining
                  colors={["#289780", "#f3f4f6"]} // Progress and remaining colors
                />
                <div className="absolute inset-0 flex mt-16 flex-col justify-evenly items-center">
                  <p className="text-green-500 text-2xl font-light">21%</p>
                  <div className="flex justify-evenly space-x-20 text-sm text-gray-500 w-full">
                    <span>0%</span>
                    <span>21%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Agent_Ranking_chart leaderboardData={leaderboardData} />
      <Agent_barchart data={barChartData} />
    </div>
  );
};

export default ConversionTable;
