import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LabelList } from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
import 'react-circular-progressbar/dist/styles.css';


const Agent_barchart = ({ data }) => {

  const currentYear = new Date().getFullYear();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(currentYear);


  useEffect(() => {
    const generatedYears = Array.from(
      { length: 10 },
      (_, i) => currentYear + i
    );
    setYears(generatedYears);
  }, [currentYear]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleYearSelect = (year) => {
    setSelectedYear(year);
    setIsDropdownOpen(false);
  };

  const CustomYAxisTick = ({ x, y, payload }) => {
    return (
      <text
        x={x - 20}
        y={y + 16}
        dy={3}
        textAnchor="end"
        fill="black"
        fontSize={14}
      >
        ${payload.value}
      </text>
    );
  };

  const CustomizedDot = (props) => {
    const { cx, cy, value } = props;
    return (
      <g>
        <circle cx={cx} cy={cy} r={4} fill="white" stroke="#009245" strokeWidth={2} />
        <text
          x={cx}
          y={cy - 10}
          textAnchor="middle"
          fill="#009245"
          fontSize={12}
          fontWeight="600"
        >
          ${value}k
        </text>
      </g>
    );
  };


  return (

    <div className="flex-1 bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-2 relative">
        <h3 className="text-xl text-[#009245]">Actual vs Target</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-[#009245]"></div>
            <span className="text-sm text-[#072D20]">Target</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-[#00EFD8]"></div>
            <span className="text-sm text-[#072D20]">Actual</span>
          </div>
          <div className="relative z-10">
            <button
              className="flex items-center text-lg text-[#072D20] border-[#009245]"
              onClick={toggleDropdown}
            >
              {selectedYear}
              <FontAwesomeIcon icon={faAngleDown} className="ml-2 text-[#072D20]" />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full w-[180%] right-0 mt-2 bg-white border border-gray-300 shadow-lg rounded-md max-h-40 overflow-y-auto z-50" style={{ zIndex: 50 }}>
                {years.map((year) => (
                  <div
                    key={year}
                    className="px-4 py-2 text-sm text-[#072D20] text-center hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleYearSelect(year)}
                  >
                    {year}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>



      <ResponsiveContainer width="100%" height="86%">
        <BarChart data={data} margin={{ top: 20, left: 50, bottom: 5 }}>
          <XAxis
            dataKey="month"
            axisLine={{ stroke: '#1E8675', strokeWidth: 2 }}
            tickLine={false}
          />
          <YAxis
            tickCount={6}
            tick={<CustomYAxisTick />}
            axisLine={false}
            tickLine={false}
            width={30}
            domain={[0, 12000]}
            ticks={[2400, 4800, 7200, 9600, 12000, 16000]}
          />
          <Bar dataKey="value" fill="#1E8675" barSize={20}>
            <LabelList
              dataKey="value"
              position="top"
              content={({ x, y, value }) => (
                <g>
                  <rect
                    x={x - 12}
                    y={y - 30}
                    width={46}
                    height={20}
                    fill="#FFFFFF"
                    stroke="#E0E0E0"
                    strokeWidth={1}
                    rx={4}
                    ry={4}
                  />
                  <text
                    x={x + 8}
                    y={y - 16}
                    textAnchor="middle"
                    fill="#009245"
                    fontSize={12}
                    fontWeight="600"
                  >
                    ${value}
                  </text>
                </g>
              )}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

    </div>


  );
};

export default Agent_barchart;
