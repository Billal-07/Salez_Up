import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { FaArrowUp } from "react-icons/fa";
import Agent_Ranking_chart from "./Agent_Ranking_chart";
import Agent_barchart from "./Agent_barchart";

ChartJS.register(ArcElement, Tooltip, Legend);


const HalfDonutChart = ({ data, colors }) => {
  const options = {
    rotation: -90,
    circumference: 180,
    cutout: "92%",
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
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


const RevenueTable = () => {
  const [agents, setAgents] = useState([]);
  const [aggregatedData, setAggregatedData] = useState(JSON.parse(localStorage.getItem('aggregated data')));
  const [leaderboardData, setLeaderboardData] = useState([
    { name: 'Sarah Smith', score: 200, image: '/images/dashboard_img1.png', badge: '/images/unicorn.png' },
    { name: 'Anujaa Kumar', score: 150, image: '/images/dashboard_img2.png', badge: '/images/platinium.png' },
    { name: 'Fernando Celde', score: 75, image: '/images/dashboard_img3.png', badge: '/images/gold.png' },
    { name: 'Pinaji Koarima', score: 74, image: '/images/dashboard_img1.png', badge: '/images/silver.png' },
    { name: 'Nava Yaghnel', score: 60, image: '/images/dashboard_img2.png', badge: '/images/silver.png' },
    { name: 'Monaki Nahans', score: 50, image: '/images/dashboard_img3.png', badge: '/images/bronze.png' },
    { name: 'Tians jdife', score: 35, image: '/images/dashboard_img2.png', badge: '/images/bronze.png' },
    { name: 'Nualiri sjahej', score: 20, image: '/images/dashboard_img1.png', badge: '/images/bronze.png' },
  ]);

  const [barChartData, setBarChartData] = useState([
    { month: 'Jan', value: 10000 },
    { month: 'Feb', value: 9000 },
    { month: 'Mar', value: 7000 },
    { month: 'Apr', value: 2000 },
    { month: 'May', value: 6700 },
    { month: 'Jun', value: 4000 },
    { month: 'Jul', value: 9001 },
    { month: 'Aug', value: 5000 },
    { month: 'Sep', value: 8000 },
    { month: 'Oct', value: 1000 },
    { month: 'Nov', value: 11000 },
    { month: 'Dec', value: 3400 },
  ]);

  useEffect(() => {
    const fetchAgents = async () => {
      const response = await fetch(`http://127.0.0.1:8000/api/sales_agents/team/${localStorage.getItem('Team_id')}`);
      const data = await response.json();
      const formattedAgents = data.map((agent, index) => {
        const kpiData = JSON.parse(agent.kpi_data);
        const target = kpiData.kpiData[1].target;
        const aggregatedValue = aggregatedData[index]?.aggregatedValues[1] || 1;
        console.log("aggregatedValue: ", aggregatedValue)
        const targetPercentage = (target / aggregatedValue) * 100;

        return {
          name: `${agent.first_name} ${agent.last_name}`,
          targetPercentage,
          rank: 0,
          image: agent.image_path || "/images/default_agent.png",
        };
      });

      const topAgents = formattedAgents
        .sort((a, b) => b.targetPercentage - a.targetPercentage)
        .slice(0, 3)
        .map((agent, index) => ({
          ...agent,
          rank: index + 1,
          target: `${agent.targetPercentage.toFixed(2)}%`,
        }));

      setAgents(topAgents);
    };

    fetchAgents();
  }, [aggregatedData]);

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
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-lg text-[#009245]">Forecast Commission</p>
              <h2 className="text-xl font-bold text-green-600">$560</h2>
            </div>
            <div className="flex items-center text-[#009245] font-medium">
              <FaArrowUp className="mr-1" />
              <span>2.5%</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1 flex flex-col justify-center items-center text-center">
              <h3 className="font-medium text-gray-800">Actual vs Target</h3>
              <p className="text-xs text-green-600 mb-4">50% to target</p>
              <div className="relative flex justify-center items-center -mt-9">
                <HalfDonutChart
                  data={[50, 50]}
                  colors={["#ff5f66", "#f3f4f6"]}
                />
                <div className="absolute inset-0 flex mt-16 flex-col justify-evenly items-center">
                  <p className="text-red-500 text-2xl font-normal">$5K</p>
                  <div className="flex justify-evenly space-x-20 text-sm text-gray-500 w-full">
                    <span>$0K</span>
                    <span>$10K</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-px bg-gray-300 h-40 mx-4"></div>

            <div className="flex-1 flex flex-col justify-center items-center text-center">
              <h3 className="font-medium text-gray-800">Forecast Finish</h3>
              <p className="text-xs text-green-600 mb-4">^ 112% to target</p>
              <div className="relative flex justify-center items-center -mt-9">
                <HalfDonutChart
                  data={[80, 20]}
                  colors={["#10b981", "#f3f4f6"]}
                />
                <div className="absolute inset-0 flex mt-16 flex-col justify-evenly items-center">
                  <p className="text-green-500 text-2xl font-normal">$12K</p>
                  <div className="flex justify-evenly space-x-20 text-sm text-gray-500 w-full">
                    <span>$0K</span>
                    <span>$15K</span>
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

export default RevenueTable;
