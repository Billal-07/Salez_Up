import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretUp } from '@fortawesome/free-solid-svg-icons';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';


const My_Commission = () => {

    const [activeButton, setActiveButton] = useState("Current Month");

    const contributionData = [
        { name: 'Commission', amount: 850, percentage: 85, color: '#009245' },
        { name: 'Contests', amount: 150, percentage: 15, color: '#A4D837' },
        { name: 'Team Rank', amount: '3rd', percentage: 3 / 8 * 100, color: '#FFC107', max: 8 },
    ];

    const buttons = ["Current Month", "Quarter", "Year", "Custom"];

    return (
        <>
                <div className='w-full mt-8 md:ml-12 mr-5 flex flex-col gap-[32px] mb-4'>
                    <div className='flex flex-col w-full gap-6 p-8 pb-12 card bg-[#009245]/5' >
                        <h1 className='font-[500] leading-[33px] text-[22px] text-[#269F8B] '>My Commission</h1>
                        <div className="flex w-full gap-4">

                            <div className="flex-1 bg-white p-4 rounded-xl shadow-sm">
                                <div className="flex justify-between items-center mt-4 ">
                                    <h2 className="text-2xl text-[#009245]">Total Commission</h2>
                                    <div className="flex items-center">
                                        <FontAwesomeIcon icon={faCaretUp} className="text-[#009245]" />
                                        <span className="text-[#009245] text-2xl font-semibold ml-2"> 2.5%</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mt-4">
                                    <p className="text-3xl font-semibold text-[#1E8675]">$1000</p>
                                    <p className="text-lg text-[#5F5E5E]">vs $8750 last month</p>
                                </div>

                                <div className="flex space-x-2 mt-12">
              {buttons.map((label) => (
                <button
                  key={label}
                  onClick={() => setActiveButton(label)}
                  className={`px-4 py-1 border-2 rounded-lg text-lg ${
                    activeButton === label
                      ? "border-[#1E8675] text-[#009245]"
                      : "border-[#E5E5E5] text-[#072D20]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
</div>



                            <div className="flex-1 bg-white p-6 rounded-xl shadow-sm">
                                <div className="flex items-start justify-between px-4 mt-2">
                                    
                                    {contributionData.map((item, index) => (
                                        
                                        <div key={index} className="flex flex-col items-center">
                                             <p className="text-lg  text-[#009245]">
                                            {item.name}
                                        </p> 
                                            <p className="text-lg text-[#1E8675] font-semibold mb-1">
                                                {item.name == 'Team Rank' ? item.amount : `$${item.amount}`}
                                            </p>
                                           
                                            <div className="w-24 h-24 mt-4">
                                            <CircularProgressbar
                                                value={item.percentage}
                                                text={item.name === 'Team Rank' ? '3/8' : `${item.percentage}%`}
                                                styles={buildStyles({
                                                    pathColor: item.color,
                                                    textColor: item.color,
                                                    trailColor: '#f0f0f0',
                                                    textSize: '22px',
                                                    pathTransitionDuration: 0.5,
                                                })}
                                            />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>




                        </div>
                    </div>
                </div>


        </>

    )
}

export default My_Commission;