import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { FaArrowUp } from "react-icons/fa";

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


const DialsTable = () => {
  const agents = [
    {
      name: "Nava Yaghnsı",
      target: "50% to target",
      rank: 1,
      image: "https://via.placeholder.com/100",
    },
    {
      name: "Anujaa Kumar",
      target: "45% to target",
      rank: 2,
      image: "https://via.placeholder.com/100",
    },
    {
      name: "Nuraj Nujaraj",
      target: "45% to target",
      rank: 3,
      image: "https://via.placeholder.com/100",
    },
  ];

  return (
    <div className="w-full flex flex-row justify-between space-x-2">
      <div className="w-1/2 rounded-lg shadow p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div className="text-2xl font-bold text-blue-500 flex items-center">
            <span className="text-2xl mr-2">3</span> BDR
          </div>
          <div className="text-base font-semibold text-green-600">
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
                <div
                  className={`absolute -bottom-2 right-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold ${agent.rank === 1
                    ? "bg-yellow-500"
                    : agent.rank === 2
                      ? "bg-gray-400"
                      : "bg-orange-500"
                    }`}
                >
                  {agent.rank}
                </div>
              </div>
              <h3 className="text-green-600 mt-4 font-semibold text-[15px]">{agent.name}</h3>
              <p className="text-green-600 text-[12px] font-medium">{agent.target}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6 w-3/5 max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-lg font-medium text-green-600">Forecast Commission</p>
            <h2 className="text-xl font-bold text-green-600">$47</h2>
          </div>
          <div className="flex items-center text-green-600 font-medium">
            <FaArrowUp className="mr-1" />
            <span>3.5%</span>
          </div>
        </div>

        {/* Actual vs Target and Forecast Finish */}
        <div className="flex items-center justify-between">
          {/* Actual vs Target */}
          <div className="flex-1 flex flex-col justify-center items-center text-center">
            <h3 className="font-medium text-gray-800">Actual vs Target</h3>
            <p className="text-xs text-green-600 mb-4">95% to target</p>

            {/* Half-Donut Chart */}
            <div className="relative flex justify-center items-center -mt-9">
              <HalfDonutChart
                data={[90, 10]} // Progress and remaining
                colors={["#ceec4f", "#f3f4f6"]} // Progress and remaining colors
              />
              <div className="absolute inset-0 flex mt-16 flex-col justify-evenly items-center">
                <p className="text-green-500 text-2xl font-light">190/Day</p>
                <div className="flex justify-evenly space-x-20 text-sm text-gray-500 w-full">
                  <span>0</span>
                  <span>200</span>
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
            <p className="text-xs text-green-600 mb-4">^ 95% to target</p>

            {/* Half-Donut Chart */}
            <div className="relative flex justify-center items-center -mt-9">
              <HalfDonutChart
                data={[80, 20]} // Progress and remaining
                colors={["#10b981", "#f3f4f6"]} // Progress and remaining colors
              />
              <div className="absolute inset-0 flex mt-16 flex-col justify-evenly items-center">
                <p className="text-green-500 text-2xl font-light">190/Day</p>
                <div className="flex justify-evenly space-x-20 text-sm text-gray-500 w-full">
                  <span>0</span>
                  <span>250</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DialsTable;
