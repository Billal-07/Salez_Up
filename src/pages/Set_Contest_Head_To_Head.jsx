
import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import image from '../../public/images/image.jpg'


let SelectedTeamVsTeam = null;
let FilterAgentsTeamVsTeam = [];

const pointsDistribution = [
  { "members": 1, "points": [350] },
  { "members": 2, "points": [230, 120] },
  { "members": 3, "points": [180, 110, 60] },
  { "members": 4, "points": [150, 100, 60, 40] },
  { "members": 5, "points": [130, 90, 60, 40, 30] },
  { "members": 6, "points": [110, 80, 60, 45, 30, 25] },
  { "members": 7, "points": [95, 75, 55, 45, 35, 25, 20] },
  { "members": 8, "points": [85, 70, 55, 45, 35, 25, 20, 15] },
  { "members": 9, "points": [75, 65, 50, 40, 35, 30, 25, 20, 10] },
  { "members": 10, "points": [70, 60, 50, 40, 35, 30, 25, 20, 15, 5] },
  { "members": 11, "points": [65, 55, 45, 40, 35, 30, 25, 20, 15, 12, 8] },
  { "members": 12, "points": [60, 50, 45, 40, 35, 30, 25, 20, 15, 12, 10, 8] },
  { "members": 13, "points": [55, 48, 42, 38, 34, 30, 26, 22, 18, 14, 10, 8, 5] },
  { "members": 14, "points": [52, 46, 40, 36, 32, 28, 24, 20, 18, 16, 14, 12, 8, 4] },
  { "members": 15, "points": [50, 44, 38, 34, 30, 26, 24, 22, 20, 18, 14, 12, 8, 6, 4] }
];

const TeamAgentsDisplay = ({ selectedTeam, filteredAgents }) => {
  return (
    <div className='flex flex-col items-center w-full mt-10'>
      {selectedTeam && (
        <div className='mt-8 w-full'>
          <div className='grid grid-cols-9 max-sm:grid-cols-3 max-md:grid-cols-4 max-lg:grid-cols-6 max-xl:grid-cols-8 gap-4 max-lg:gap-8 max-xl:gap-5'>
            {(() => {
              const teamSize = filteredAgents.length;
              const distributionEntry = pointsDistribution.find(entry => entry.members == teamSize);
              const points = distributionEntry ? distributionEntry.points : [];
              // console.log("Agents", filteredAgents)
              return filteredAgents.map((_, index) => (
                <div key={index} className='flex flex-col gap-[7px] w-full sm:w-[82px]'>
                  <label className='text-[14px] font-normal leading-[21px] text-dGreen'>
                    {`${index + 1}${index == 0 ? 'st' : index == 1 ? 'nd' : index == 2 ? 'rd' : 'th'} Place`}
                  </label>
                  <input
                    type='number'
                    value={points[index] || ''}
                    readOnly
                    className='w-full bg-lGreen text-center p-2 text-[14px] placeholder-[#8fa59c] font-[500] border-none h-[45px]'
                  />
                </div>
              ));
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

const AgentTypes = 'AGENT';
const Agents = ({ agent, onDoubleClick, isTeamMember = false }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: AgentTypes,
    item: { agent },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),

    canDrag: !isTeamMember,

  }), [agent, isTeamMember]);

  return (
    <div
      ref={drag}
      className={`text-center ${isTeamMember ? 'w-full h-full' : 'w-1/2 sm:w-1/3 md:w-1/4 lg:w-[10%]'} p-2`}
      onDoubleClick={() => onDoubleClick(agent)}
    >
      <div className={`relative ${isTeamMember ? '' : 'aspect-square'} overflow-hidden`}>
        <img
          src={agent.image_path || image}
          alt={`${agent.first_name} ${agent.last_name}`}
          className={`object-cover w-full h-full rounded-full ${isTeamMember ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        />
      </div>
      <p className="mt-2 text-sm font-semibold text-center">{`${agent.first_name} ${agent.last_name}`}</p>
    </div>
  );
};

const TeamAreas = ({ agents = [], onDrop, oppositeTeam, onAgentRemove }) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'AGENT',
    drop: (item) => {
      if (agents.length > 0 && agents[0]?.team?.id !== item.agent.team.id) {
        alert(`All agents in a team must belong to the same team (${agents[0]?.team?.team_name}).`);
        return;
      }
      onDrop(item.agent);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });
  const handleDoubleClick = (agent) => {
    onAgentRemove(agent);
  };
  return (
    <div className="w-full md:w-[22%]">
      <div
        ref={drop}
        className={`grid grid-cols-2 gap-4 p-4 ${isOver ? 'bg-gray-100' : 'bg-white'} rounded-lg`}
      >
        {[...Array(1)].map((_, index) => (
          <div
            key={index}
            className="overflow-hidden border-4 border-red-300 border-dashed aspect-square rounded-2xl"
          >
            {agents[index] && (
              <Agents
                agent={agents[index]}
                onDoubleClick={() => handleDoubleClick(agents[index])}
                isTeamMember={true}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};


export default function Set_Contest_Head_To_Head() {

  const [agents, setAgents] = useState([]);
  const [leftTeam, setLeftTeam] = useState([]);
  const [rightTeam, setRightTeam] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedTeam1, setselectedTeam1] = useState('');
  const [teamSelected, setTeamSelected] = useState(false);
  const [error, setError] = useState('');
  const [selectedCompetitionTeam, setSelectedCompetitionTeam] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [teamAgentCounts, setTeamAgentCounts] = useState({});
  const [dropdownOptions, setDropdownOptions] = useState([]);
  const [selectedCount, setSelectedCount] = useState('');



  const [targetAmount, setTargetAmount] = useState(0);
  const [selectedKpi, setSelectedKpi] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [inputType, setInputType] = useState('');
  const [kpiOptions, setKpiOptions] = useState([]);
  const [selectedVouchers, setSelectedVouchers] = React.useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [firstPrize, setFirstPrize] = useState();
  const [secondPrize, setSecondPrize] = useState();
  const [thirdPrize, setThirdPrize] = useState();
  // const totalPrize = parseFloat(firstPrize) + parseFloat(secondPrize) + parseFloat(thirdPrize);
  const totalPrize = parseFloat(firstPrize);
  const [selectedFoods, setSelectedFoods] = React.useState([]);
  const [food, setFood] = useState([]);
  const [selectedExperiences, setSelectedExperiences] = React.useState([]);
  const [exp, setExp] = useState([]);
  const [cashValue, setCashValue] = useState(350);
  const [tvTheme, setTvTheme] = useState("theme1");

  const [teamLocked, setTeamLocked] = useState(false);



  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const currentDate = getCurrentDate();
  const [startDate, setStartDate] = useState(currentDate);
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('');
  const [daysDifference, setDaysDifference] = useState(0)
  const [timeDiff, setTimeDiff] = useState(0);
  const [minTime, setMinTime] = useState('');
  const [prizeSelected, setPrizeSelected] = useState("");

  useEffect(() => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    setStartTime(`${hours}:${minutes}`);
    setMinTime(`${hours}:${minutes}`);
  }, []);


  const [leftTeamAgents, setLeftTeamAgents] = useState(Array(selectedCount).fill([]));
  const [rightTeamAgents, setRightTeamAgents] = useState(Array(selectedCount).fill([]));


  useEffect(() => {
    fetch('http://crmapi.devcir.co/api/sales_agents')
      .then(response => response.json())
      .then(data => {
        setAgents(data);

        const campaignCounts = data.reduce((acc, agent) => {
          const teamName = agent.team.team_name;
          acc[teamName] = (acc[teamName] || 0) + 1;
          return acc;
        }, {});

        const teamsWithTwoOrMoreAgents = Object.keys(campaignCounts).filter(
          team => campaignCounts[team] >= 2
        );
        setTeams(teamsWithTwoOrMoreAgents);

        const counts = {};
        teamsWithTwoOrMoreAgents.forEach(team => {
          const count = campaignCounts[team];
          counts[team] = Math.round(count / 2);
        });
        setTeamAgentCounts(counts);
      })
      .catch(error => {
        console.error('Error fetching sales agents:', error);
      });
  }, []);

  useEffect(() => {
    const currentDate = new Date().toISOString().split('T')[0];

    if (startDate < currentDate) {
      alert('Start date cannot be before the current date');
      setStartDate(currentDate);
      return;
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end < start) {
        alert('End date must be after the start date');
        setEndDate('');
        return;
      }

      const diffInTime = end.getTime() - start.getTime();
      const diffInDays = diffInTime / (1000 * 3600 * 24);
      setDaysDifference(diffInDays);
      console.log(`Days Difference: ${diffInDays}`);
    }

    if (startDate && startTime && endDate && endTime) {
      const startDateTime = new Date(`${startDate}T${startTime}:00`);
      const endDateTime = new Date(`${endDate}T${endTime}:00`);

      if (endDateTime < startDateTime) {
        alert('End date and time must be after the start date and time');
        setEndTime('');
        return;
      }

      const diffInTime = endDateTime - startDateTime;

      const hours = Math.floor(diffInTime / (1000 * 60 * 60));
      const minutes = Math.floor((diffInTime % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffInTime % (1000 * 60)) / 1000);

      const formattedTimeDiff = `${hours}h ${minutes}m ${seconds}s`;
      setTimeDiff(formattedTimeDiff);
      console.log(`Time Difference: ${formattedTimeDiff}`);
    }
  }, [startDate, endDate, startTime, endTime]);


  useEffect(() => {
    fetch('http://crmapi.devcir.co/api/kpi_info')
      .then(response => response.json())
      .then(data => setKpiOptions(data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  useEffect(() => {
    const fetchExp = async () => {
      try {
        const response = await fetch('http://crmapi.devcir.co/api/experiences');
        const data = await response.json();
        setExp(data);
      } catch (error) {
        console.error('Error fetching Experiences:', error);
      }
    };

    fetchExp();
  }, []);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const response = await fetch('http://crmapi.devcir.co/api/vouchers');
        const data = await response.json();
        setVouchers(data);
      } catch (error) {
        console.error('Error fetching vouchers:', error);
      }
    };

    fetchVouchers();
  }, []);

  useEffect(() => {
    const fetchFood = async () => {
      try {
        const response = await fetch('http://crmapi.devcir.co/api/foods');
        const data = await response.json();
        setFood(data);
      } catch (error) {
        console.error('Error fetching foods:', error);
      }
    };

    fetchFood();
  }, []);


  useEffect(() => {
    setLeftTeamAgents((prev) => {
      const newAgents = [...prev];
      while (newAgents.length < selectedCount) {
        newAgents.push([]);
      }
      while (newAgents.length > selectedCount) {
        newAgents.pop();
      }
      return newAgents;
    });

    setRightTeamAgents((prev) => {
      const newAgents = [...prev];
      while (newAgents.length < selectedCount) {
        newAgents.push([]);
      }
      while (newAgents.length > selectedCount) {
        newAgents.pop();
      }
      return newAgents;
    });
  }, [selectedCount]);



  const filteredAgents = selectedTeam1
  ? agents.filter(agent => agent.team.team_name === selectedTeam1)
  : agents;

  const assignPointsToAgents = (agents) => {
    const numberOfAgents = agents.length;
    const pointsEntry = pointsDistribution.find(entry => entry.members == numberOfAgents);

    if (!pointsEntry) {
      console.error(`No point distribution found for ${numberOfAgents} agents`);
      return agents;
    }

    const agentsWithPoints = agents.map((agent, index) => ({
      ...agent,
      points: pointsEntry.points[index] || 0,
    }));

    return agentsWithPoints;
  };


  const handleDropLeftTeam = (index, agent) => {
    if (isAgentSelected(agent)) return;
    setLeftTeamAgents((prev) => {
      const newTeams = [...prev];
      if (!newTeams[index]) newTeams[index] = [];
      newTeams[index] = [...newTeams[index], agent];
      return newTeams;
    });

    setAgents((prev) => prev.filter((a) => a.id !== agent.id));
    setTeamLocked(true);
  };

  const handleDropRightTeam = (index, agent) => {
    if (isAgentSelected(agent)) return;
    setRightTeamAgents((prev) => {
      const newTeams = [...prev];
      if (!newTeams[index]) newTeams[index] = [];
      newTeams[index] = [...newTeams[index], agent];
      return newTeams;
    });

    setAgents((prev) => prev.filter((a) => a.id !== agent.id));
    setTeamLocked(true);
  };


  const [allTeamAgents, setAllTeamAgents] = useState([]);

  useEffect(() => {
    setAllTeamAgents([...leftTeamAgents, ...rightTeamAgents]);
  }, [leftTeamAgents, rightTeamAgents]);


  const removeAgentFromTeam = (agent, setTeam, index) => {
    setTeam((prev) => {
      const newTeams = [...prev];
      newTeams[index] = newTeams[index].filter((a) => a.id !== agent.id);
      return newTeams;
    });
    setAgents((prev) => [...prev, agent]);
    const allTeamsEmpty = leftTeamAgents.every(team => team.length == 0) &&
      rightTeamAgents.every(team => team.length == 0);
    if (allTeamsEmpty) {
      setTeamLocked(false);
    }
  };


  useEffect(() => {
    const allLeftAgentsRemoved = leftTeamAgents.flat().every((team) => team.length == 0);
    const allRightAgentsRemoved = rightTeamAgents.flat().every((team) => team.length == 0);

    if (allLeftAgentsRemoved && allRightAgentsRemoved) {
      setTeamLocked(false);
    } else {
      // console.log("Teams are still locked");
    }
  }, [leftTeamAgents, rightTeamAgents]);


  const handleTeamSelect = (team) => {
    if (teamLocked) {
      return;
    }

    if (!isDragging) {
      setselectedTeam1(team);
      setTeamSelected(true);

      const agentCount = agents.filter(agent =>
        agent.team.team_name === team
      ).length;

      const halfCount = Math.floor(agentCount / 2);

      setDropdownOptions([...Array(halfCount)].map((_, i) => i + 1));
    }
  };


  useEffect(() => {
    if (selectedTeam1) {
      setSelectedCount(1);
    }
  }, [selectedTeam1]);

  const bothTeamsHaveAgent = () => {
    return leftTeam.length == 1 && rightTeam.length == 1;
  };

  const handleCash = (prizeType) => {
    const agentsExistInLeft = leftTeamAgents.every((team) => team.length > 0);
    const agentsExistInRight = rightTeamAgents.every((team) => team.length > 0);

    if (!teamSelected) {
      alert('Kindly select an agent for the competition')
      return;
    }

    if (!agentsExistInLeft || !agentsExistInRight) {
      alert("Kindly select an agent for both sides of team.");
      return;
    }
    if (selectedVouchers.length > 0 || selectedFoods.length > 0 || selectedExperiences.length > 0) {
      const confirmReset = window.confirm("All previous data will be lost. Do you want to continue?");
      if (!confirmReset) {
        return;
      }
    }
    setSelectedVouchers([]);
    setSelectedFoods([]);
    setSelectedExperiences([]);
    setPrizeSelected(prizeType);
  };


  const handleVoucher = (prizeType) => {
    const agentsExistInLeft = leftTeamAgents.every((team) => team.length > 0);
    const agentsExistInRight = rightTeamAgents.every((team) => team.length > 0);

    if (!teamSelected) {
      alert('Kindly select an agent for the competition')
      return;
    }

    if (!agentsExistInLeft || !agentsExistInRight) {
      alert("Kindly select an agent for both sides of team.");
      return;
    }
    if (prizeSelected == "VOUCHER") {
      return;
    }
    if (selectedFoods.length > 0 || selectedExperiences.length > 0) {
      const confirmReset = window.confirm("All previous data will be lost. Do you want to continue?");
      if (!confirmReset) {
        return;
      }
    }
    setSelectedFoods([]);
    setSelectedExperiences([]);
    setPrizeSelected(prizeType);
  };

  const handleFood = (prizeType) => {
    const agentsExistInLeft = leftTeamAgents.every((team) => team.length > 0);
    const agentsExistInRight = rightTeamAgents.every((team) => team.length > 0);

    if (!teamSelected) {
      alert('Kindly select an agent for the competition')
      return;
    }

    if (!agentsExistInLeft || !agentsExistInRight) {
      alert("Kindly select an agent for both sides of team.");
      return;
    }
    if (prizeSelected == "FOOD") {
      return;
    }
    if (selectedVouchers.length > 0 || selectedExperiences.length > 0) {
      const confirmReset = window.confirm("All previous data will be lost. Do you want to continue?");
      if (!confirmReset) {
        return;
      }
    }
    setSelectedVouchers([]);
    setSelectedExperiences([]);
    setPrizeSelected(prizeType);
  };

  const handleExp = (prizeType) => {
    const agentsExistInLeft = leftTeamAgents.every((team) => team.length > 0);
    const agentsExistInRight = rightTeamAgents.every((team) => team.length > 0);

    if (!teamSelected) {
      alert('Kindly select an agent for the competition')
      return;
    }

    if (!agentsExistInLeft || !agentsExistInRight) {
      alert("Kindly select an agent for both sides of team.");
      return;
    }
    if (prizeSelected == "EXPERIENCE") {
      return;
    }
    if (selectedVouchers.length > 0 || selectedFoods.length > 0) {
      const confirmReset = window.confirm("All previous data will be lost. Do you want to continue?");
      if (!confirmReset) {
        return;
      }
    }
    setSelectedVouchers([]);
    setSelectedFoods([]);
    setPrizeSelected(prizeType);
  };

  const [numberTarget, setNumberTarget] = useState()
  const [dollarTarget, setDollarTarget] = useState('')
  const [percentageTarget, setPercentageTarget] = useState('')

  const handleNumberChange = (e) => {
    const value = e.target.value;
    setNumberTarget(value)
    const regex = /^[0-9]*$/;
    if (!regex.test(value)) {
      alert("Kindly enter a positive integer.");
      setNumberTarget()
      e.target.value = "";
      return;
    }
  };

  const handleDollarChange = (e) => {
    let value = e.target.value.replace('$', '');
    setDollarTarget(value)
    const regex = /^[0-9]*$/;
    if (!regex.test(value)) {
      alert("Kindly enter a positive integer.");
      setDollarTarget("")
      e.target.value = "$";
      return;
    }
    e.target.value = `$${value}`;
  };

  const handlePercentageChange = (e) => {
    let value = e.target.value.replace('%', '');
    setPercentageTarget(value)
    const regex = /^([0-9]+(\.[0-9]*)?|\.?[0-9]+)$/;
    if (!regex.test(value) || parseFloat(value) > 100) {
      alert("Kindly enter a value between 0 and 100.");
      setPercentageTarget()
      e.target.value = "";
      return;
    }
    e.target.value = `${value}%`;
  };

  const handleButtonClick = (type) => {
    if (!selectedKpi) {
      alert("Kindly select the KPI name.");
      return;
    }
    if (inputType == type) {
      return;
    }
    if (numberTarget || dollarTarget || percentageTarget) {
      const confirmReset = window.confirm("All previous data will be lost. Do you want to continue?");
      if (!confirmReset) {
        return;
      }
    }
    setInputType(type);
    setNumberTarget()
    setDollarTarget()
    setPercentageTarget()
    setShowInput(true);
  };


  const isAgentSelected = (agent) => {
    return leftTeamAgents.flat().some(a => a.id == agent.id) ||
      rightTeamAgents.flat().some(a => a.id == agent.id);
  };


  SelectedTeamVsTeam = selectedTeam1;
  FilterAgentsTeamVsTeam = filteredAgents;

  const badges = [
    { name: 'Bronze', range: '0-100 Points', color: 'bg-amber-600', image_path: '/images/bronze.png' },
    { name: 'Gold', range: '300-500 Points', color: 'bg-gray-500', image_path: '/images/silver.png' },
    { name: 'Silver', range: '100-300 Points', color: 'bg-yellow-500', image_path: '/images/gold.png' },
    { name: 'Platinum', range: '500-700 Points', color: 'bg-gray-400', image_path: '/images/platinium.png' },
    { name: 'Unicorn', range: '700-1000 Points', color: 'bg-purple-600', image_path: '/images/unicorn.png' },
  ];

  const handleInputChange = (e) => {
    const value = e.target.value;
    const regex = /^[0-9]*$/;
    if (!regex.test(value)) {
      alert("Kindly enter only positive integers without any special characters.");
      e.target.value = "";
      return;
    }
    const numericValue = parseInt(value, 10);
    if (numericValue > 0) {
      setTargetAmount(numericValue); // Set the value if it's a valid positive integer
    } else if (value == "") {
      // Allow empty input to be reset to 0
      setTargetAmount(0);
    } else {
      alert("Kindly enter a value above zero.");
      e.target.value = ""; // Reset the input if a non-positive value is entered
    }
  };



  const [headToHeadData, setHeadToHeadData] = useState([]);
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);

  const validateTeams = () => {
    const allLeftTeamsFilled = leftTeamAgents.every((agents) => agents.length > 0);
    const allRightTeamsFilled = rightTeamAgents.every((agents) => agents.length > 0);
    return allLeftTeamsFilled && allRightTeamsFilled;
  };
  useEffect(() => {
    setIsSubmitEnabled(validateTeams());
  }, [leftTeamAgents, rightTeamAgents]);

  // const handleSubmitTeam = () => {
  //   const leftTeamData = leftTeamAgents.map((team, index) => ({
  //     teamIndex: index,
  //     agents: team,
  //   }));

  //   const rightTeamData = rightTeamAgents.map((team, index) => ({
  //     teamIndex: index,
  //     agents: team,
  //   }));

  //   const headToHeadPairs = leftTeamData.map((leftTeam, index) => ({
  //     headToHead: `HeadToHead${index + 1}`,
  //     matchups: leftTeam.agents.map((leftAgent, agentIndex) => ({
  //       leftAgent,
  //       rightAgent: rightTeamData[index]?.agents[agentIndex] || null, 
  //     })),
  //   }));

  //   if (
  //     !startDate
  //   ) {
  //     alert("Kindly fill all the fields");
  //   } else {
  //     console.log("Matchups:", headToHeadPairs)
  //     console.log("Contest Details:");
  //     console.log("Start Date:", startDate);
  //     console.log("End Date:", endDate);
  //     console.log("Start Time:", startTime);
  //     console.log("End Time:", endTime);
  //     console.log("Revenue Target:", selectedKpi);
  //     console.log("Prize Type:", prizeSelected);
  //     console.log("1st Prize:", firstPrize);
  //     console.log("2nd Prize:", secondPrize);
  //     console.log("3rd Prize:", thirdPrize);
  //     console.log("Total Prize:", totalPrize);
  //     console.log("Theme:", tvTheme);
  //     console.log("Points Distribution::", pointsDistribution[allTeamAgents.length - 1]);

  //     if (prizeSelected == "VOUCHER") {
  //       console.log("Selected Vouchers:", selectedVouchers);
  //     } else if (prizeSelected == "FOOD") {
  //       console.log("Selected Foods:", selectedFoods);
  //     } else if (prizeSelected == "EXPERIENCE") {
  //       console.log("Selected Experiences:", selectedExperiences);
  //     }
  //   }
  // };


  const handleSubmitTeam = () => {
    const leftTeamData = leftTeamAgents.map((team, index) => ({
      teamIndex: index,
      agents: team,
    }));

    const rightTeamData = rightTeamAgents.map((team, index) => ({
      teamIndex: index,
      agents: team,
    }));

    const headToHeadPairs = leftTeamData.map((leftTeam, index) => ({
      headToHead: `HeadToHead${index + 1}`,
      matchups: leftTeam.agents.map((leftAgent, agentIndex) => ({
        leftAgent,
        rightAgent: rightTeamData[index]?.agents[agentIndex] || null,
      })),
    }));

    // Check if all fields are filled
    if (!startDate || !endDate || !startTime || !endTime || !selectedKpi || !prizeSelected || !firstPrize || !totalPrize || !tvTheme) {
      alert("Kindly fill all the fields");
      return;
    }

    console.log("Matchups:", headToHeadPairs);
    console.log("Contest Details:");
    console.log("Start Date:", startDate);
    console.log("End Date:", endDate);
    console.log("Start Time:", startTime);
    console.log("End Time:", endTime);
    console.log("Revenue Target:", selectedKpi);
    console.log("Prize Type:", prizeSelected);
    console.log("1st Prize:", firstPrize);
    console.log("Total Prize:", totalPrize);
    console.log("Theme:", tvTheme);
    console.log("Points Distribution:", pointsDistribution[allTeamAgents.length - 1]);

    if (prizeSelected == "VOUCHER") {
      console.log("Selected Vouchers:", selectedVouchers);
    } else if (prizeSelected == "FOOD") {
      console.log("Selected Foods:", selectedFoods);
    } else if (prizeSelected == "EXPERIENCE") {
      console.log("Selected Experiences:", selectedExperiences);
    }
  };


  // _____________________________________ Rendering cash, food, exp, vouchers div ____________________________________________

  const renderPrizeForm = (prizeSelected) => {

    const handleFirstPrizeChange = (e) => {
      const value = e.target.value;

      if (/^-/.test(value)) {
        alert("Kindly enter a positive value");
        setFirstPrize("");
      } else if (!isNaN(value) && parseInt(value) >= 0 && Number.isInteger(parseFloat(value))) {
        setFirstPrize(value);
      } else {
        alert("Kindly enter a positive integer");
        setFirstPrize("");
      }
    };


    const handleSecondPrizeChange = (e) => {
      const value = e.target.value;

      if (/^-/.test(value)) {
        alert("Kindly enter a positive value");
        setSecondPrize("");
      } else if (!isNaN(value) && parseInt(value) >= 0 && Number.isInteger(parseFloat(value))) {
        setSecondPrize(value);
      } else {
        alert("Kindly enter a positive integer");
        setSecondPrize("");
      }
    };

    const handleThirdPrizeChange = (e) => {
      const value = e.target.value;

      if (/^-/.test(value)) {
        alert("Kindly enter a positive value");
        setThirdPrize("");
      } else if (!isNaN(value) && parseInt(value) >= 0 && Number.isInteger(parseFloat(value))) {
        setThirdPrize(value);
      } else {
        alert("Kindly enter a positive integer");
        setThirdPrize("");
      }
    };



    if (prizeSelected == "CASH" && teamSelected)

      return (
        <>
          <div className='flex flex-col w-full gap-6 p-8 pb-12 ml-[-40px] card'>
            <div className='flex flex-wrap items-center gap-[20px] justify-between'>
              <div className='flex gap-[10px]'>
                <img src="/images/1stprize.png" alt="" className='w-[57px] h-[79px] opacity-80' />
                <div className='flex flex-col gap-[11px]'>
                  <label htmlFor='firstPrize' className='text-sm font-normal leading-[21px] text-left text-dGreen'>1st prize</label>
                  <input
                    type="number" id='firstPrize'
                    placeholder='$0'
                    value={firstPrize}
                    onChange={handleFirstPrizeChange}
                    className='bg-lGreen p-2 text-[14px] placeholder-[#8fa59c] font-[500] border-none h-[45px] w-[130px] max-sm:w-[100px]'
                  />
                </div>
              </div>
              <div className='flex gap-[12px] ml-[-14px]'>
                <img src="/images/2prize.png" alt="" className='w-[57px] h-[79px] opacity-80' />
                <div className='flex flex-col gap-[11px]'>
                  <label htmlFor='secondPrize' className='text-sm font-normal  leading-[21px] text-left text-dGreen'>2nd prize</label>
                  <input
                    type="number" id='secondPrize'
                    placeholder='$0'
                    value={secondPrize}
                    onChange={handleSecondPrizeChange}
                    className='bg-lGreen p-2 text-[14px] placeholder-[#8fa59c] font-[500] border-none h-[45px] w-[130px] max-sm:w-[100px]'
                    disabled
                  />
                </div>
              </div>
              <div className='flex gap-[12px] ml-[-14px]'>
                <img src="/images/3prize.png" alt="" className='w-[57px] h-[79px] opacity-80' />
                <div className='flex flex-col gap-[11px]'>
                  <label htmlFor='thirdPrize' className='text-sm font-normal leading-[21px] text-left text-dGreen'>3rd prize</label>
                  <input
                    type="number" id='thirdPrize'
                    placeholder='$0'
                    value={thirdPrize}
                    onChange={handleThirdPrizeChange}
                    className='bg-lGreen p-2 text-[14px] placeholder-[#8fa59c] font-[500] border-none h-[45px] w-[130px] max-sm:w-[100px]'
                    disabled
                  />
                </div>
              </div>
              <div className='flex flex-col gap-[11px] max-sm:flex-row'>
                <label htmlFor='totalPrize' className='text-sm font-normal leading-[21px] text-left text-dGreen'>Total prize</label>
                <input
                  type="number"
                  id='totalPrize'
                  placeholder='$0'
                  value={isNaN(totalPrize) ? "0.00" : totalPrize}  // Check for NaN
                  readOnly
                  className='bg-lGreen p-2 text-[14px] placeholder-[#8fa59c] font-[500] border-none h-[45px] w-[130px] max-sm:w-[100px]'
                />
              </div>
            </div>
          </div>
        </>
      );

    if (prizeSelected == "VOUCHER" && teamSelected)
      return (
        <>
          <div className='flex flex-col w-full gap-6 p-8 pb-12 card ml-[-40px]' id='currentTeamLeaders'>
            <h1 className='font-[500] leading-[33px] text-[22px] text-[#269F8B]'>Select Vouchers</h1>
            <div className='flex flex-wrap items-center gap-[10px] justify-start mx-5'>

              <div className='grid grid-cols-6 gap-x-[30px] gap-y-12'>
                {vouchers.map((voucher) => (
                  <div key={voucher.id} className='flex flex-col items-center gap-4 mb-6'>
                    <img
                      src={voucher.voucher_image}
                      className={`w-[130px] h-[90px] border border-1 border-black/10 rounded-xl cursor-pointer transition-all duration-300 
          ${selectedVouchers.includes(voucher.name)
                          ? 'opacity-100'
                          : 'opacity-40 '
                        }`}
                      onClick={() => {
                        const updatedSelection = selectedVouchers.includes(voucher.name)
                          ? []
                          : [voucher.name];

                        setSelectedVouchers(updatedSelection);
                        console.log(`Voucher Name: ${voucher.name}, Status: ${voucher.status}`);
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between w-full p-4 space-x-2 ml-[-20px]">
                <div className="flex items-center space-x-2">
                  <img src="/images/1stprize.png" alt="1st prize" className="w-[57px] h-[79px]" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">1st prize</span>
                    <input type="number" placeholder='$0'
                      value={firstPrize}
                      onChange={handleFirstPrizeChange} className="bg-lGreen p-2 text-[14px] placeholder-[#8fa59c] font-[500] border-none h-[45px] w-[130px] max-sm:w-[100px]" />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <img src="/images/2prize.png" alt="2nd prize" className="w-[57px] h-[79px]" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">2nd prize</span>
                    <input type="number"
                      value={secondPrize}
                      placeholder='$0' onChange={handleSecondPrizeChange} className="bg-lGreen p-2 text-[14px] placeholder-[#8fa59c] font-[500] border-none h-[45px] w-[130px] max-sm:w-[100px]"
                      disabled
                    />

                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <img src="/images/3prize.png" alt="3rd Time" className="w-[57px] h-[79px]" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">3rd Time</span>
                    <input type="number"
                      value={thirdPrize}
                      placeholder='$0' onChange={handleThirdPrizeChange} className="bg-lGreen p-2 text-[14px] placeholder-[#8fa59c] font-[500] border-none h-[45px] w-[130px] max-sm:w-[100px]"
                      disabled
                    />
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-sm font-semibold">Total Prize</span>
                  <input
                    type="number"
                    id='totalPrize'
                    placeholder='$0'
                    value={isNaN(totalPrize) ? "0.00" : totalPrize}
                    readOnly
                    className='bg-lGreen p-2 text-[14px] placeholder-[#8fa59c] font-[500] border-none h-[45px] w-[130px] max-sm:w-[100px]'
                  />
                </div>
              </div>

            </div>
          </div>
        </>
      )

    if (prizeSelected == "FOOD" && teamSelected)
      return (
        <>
          <div className='flex flex-col w-full gap-6 p-8 pb-12 card ml-[-40px]' id='currentTeamLeaders'>
            <h1 className='font-[500] leading-[33px] text-[22px] text-[#269F8B]'>Select Food</h1>
            <div className='flex flex-wrap items-center gap-[10px] justify-start mx-5'>
              <div className='grid grid-cols-6 gap-x-[30px] gap-y-12'>
                {food.map((foodItem) => (
                  <div key={foodItem.id} className='flex flex-col items-center gap-4 mb-6'>
                    <img
                      src={foodItem.food_image}
                      alt={foodItem.name}
                      className={`w-[130px] h-[90px] border border-1 border-black/10 rounded-xl cursor-pointer transition-all duration-300 
          ${selectedFoods.includes(foodItem.name)
                          ? 'opacity-100'
                          : 'opacity-40 '
                        }`}
                      onClick={() => {
                        const updatedSelection = selectedFoods.includes(foodItem.name)
                          ? []
                          : [foodItem.name];

                        setSelectedFoods(updatedSelection);
                        console.log(`Food Name: ${foodItem.name}, Status: ${foodItem.status}`);
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between w-full p-4 space-x-2 ml-[-20px]">
                <div className="flex items-center space-x-2">
                  <img src="/images/1stprize.png" alt="1st prize" className="w-[57px] h-[79px]" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">1st prize</span>
                    <input type="number"
                      value={firstPrize}
                      placeholder='$0' onChange={handleFirstPrizeChange} className="bg-lGreen p-2 text-[14px] placeholder-[#8fa59c] font-[500] border-none h-[45px] w-[130px] max-sm:w-[100px]" />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <img src="/images/2prize.png" alt="2nd prize" className="w-[57px] h-[79px]" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">2nd prize</span>
                    <input type="number"
                      value={secondPrize}
                      disabled
                      placeholder='$0' onChange={handleSecondPrizeChange} className="bg-lGreen p-2 text-[14px] placeholder-[#8fa59c] font-[500] border-none h-[45px] w-[130px] max-sm:w-[100px]" />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <img src="/images/3prize.png" alt="3rd Time" className="w-[57px] h-[79px]" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">3rd Time</span>
                    <input type="number"
                      value={thirdPrize}
                      disabled
                      placeholder='$0' onChange={handleThirdPrizeChange} className="bg-lGreen p-2 text-[14px] placeholder-[#8fa59c] font-[500] border-none h-[45px] w-[130px] max-sm:w-[100px]" />
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-sm font-semibold">Total Prize</span>
                  <input
                    type="number"
                    id='totalPrize'
                    placeholder='$0'
                    value={isNaN(totalPrize) ? "0.00" : totalPrize}  // Check for NaN
                    readOnly
                    className='bg-lGreen p-2 text-[14px] placeholder-[#8fa59c] font-[500] border-none h-[45px] w-[130px] max-sm:w-[100px]'
                  />
                </div>
              </div>

            </div>
          </div>
        </>
      )

    if (prizeSelected == "EXPERIENCE" && teamSelected)
      return (
        <>
          <div className='flex flex-col w-full gap-6 p-8 pb-12 ml-[-40px] card' id='currentTeamLeaders'>
            <h1 className='font-[500] leading-[33px] text-[22px] text-[#269F8B]'>Select Experiences</h1>
            <div className='flex flex-wrap items-center gap-[10px] justify-start mx-5'>


              <div className='grid grid-cols-6 gap-x-[30px] gap-y-12'>
                {exp.map((expItem) => (
                  <div key={expItem.id} className='flex flex-col items-center gap-4 mb-6'>
                    <img
                      src={expItem.experience_image}
                      alt={expItem.name}
                      className={`w-[130px] h-[90px] border border-1 border-black/10 rounded-xl cursor-pointer transition-all duration-300 
          ${selectedExperiences.includes(expItem.name)
                          ? 'opacity-100'
                          : 'opacity-40 '
                        }`}
                      onClick={() => {
                        const updatedSelection = selectedExperiences.includes(expItem.name)
                          ? [] // Deselect the experience if it is already selected
                          : [expItem.name]; // Select the experience, replacing any previous selection

                        setSelectedExperiences(updatedSelection);
                        console.log(`Experience Name: ${expItem.name}, Status: ${expItem.status}`);
                      }}
                    />
                  </div>
                ))}
              </div>


              <div className="flex items-center justify-between w-full p-4 space-x-2 ml-[-20px]">
                <div className="flex items-center space-x-2">
                  <img src="/images/1stprize.png" alt="1st prize" className="w-[57px] h-[79px]" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">1st prize</span>
                    <input type="number"
                      value={firstPrize}
                      placeholder='$0' onChange={handleFirstPrizeChange} className="bg-lGreen p-2 text-[14px] placeholder-[#8fa59c] font-[500] border-none h-[45px] w-[130px] max-sm:w-[100px]" />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <img src="/images/2prize.png" alt="2nd prize" className="w-[57px] h-[79px]" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">2nd prize</span>
                    <input type="number"
                      value={secondPrize}
                      placeholder='$0' onChange={handleSecondPrizeChange} className="bg-lGreen p-2 text-[14px] placeholder-[#8fa59c] font-[500] border-none h-[45px] w-[130px] max-sm:w-[100px]"
                      disabled
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <img src="/images/3prize.png" alt="3rd Time" className="w-[57px] h-[79px]" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">3rd Time</span>
                    <input type="number"
                      value={thirdPrize}
                      placeholder='$0' onChange={handleThirdPrizeChange} className="bg-lGreen p-2 text-[14px] placeholder-[#8fa59c] font-[500] border-none h-[45px] w-[130px] max-sm:w-[100px]"
                      disabled
                    />
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-sm font-semibold">Total Prize</span>
                  {/* <input type="text"  value={totalPrize.toFixed(2)}  readOnly className="bg-lGreen p-2 text-[14px] placeholder-[#8fa59c] font-[500] border-none h-[45px] w-[130px] max-sm:w-[100px]" /> */}
                  <input
                    type="number"
                    id='totalPrize'
                    placeholder='$0'
                    value={isNaN(totalPrize) ? "0.00" : totalPrize}  // Check for NaN
                    readOnly
                    className='bg-lGreen p-2 text-[14px] placeholder-[#8fa59c] font-[500] border-none h-[45px] w-[130px] max-sm:w-[100px]'
                  />
                </div>
              </div>

            </div>
          </div>

        </>
      )

  }

  // _____________________________________ Rendering cash, food, exp, vouchers div ____________________________________________



  return (
    <DndProvider backend={HTML5Backend}>
      <div className='flex'>
        <div className='w-full p-8'>

          <div className='flex flex-col w-full gap-6 p-8 pb-12 card ml-[-30px]'>
            <h1 className='font-[500] leading-[33px] text-[22px] text-[#269F8B]'>Select Agents</h1>
            <div className='flex gap-4 mb-4 items-center'>
              {teams.map((team, index) => (
                <button
                  key={index}
                  onClick={() => handleTeamSelect(team)}
                  className={`px-4 py-2 rounded-lg ${selectedTeam1 == team ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                  disabled={teamLocked || (isDragging && selectedCompetitionTeam !== team)}
                >
                  {team}
                </button>
              ))}
              {teams.length > 0 && (
                <select
                  className="ml-2 p-2 rounded-lg"
                  onChange={(e) => setSelectedCount(Number(e.target.value))}
                  value={selectedCount}
                >
                  <option value="">Select</option>
                  {dropdownOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              )}
            </div>

            {[...Array(Number(selectedCount))].map((_, index) => (
              <div key={index} className='flex items-center justify-between mb-8'>
                <TeamAreas
                  agents={leftTeamAgents[index] || []}
                  onDrop={(agent) => handleDropLeftTeam(index, agent)}
                  oppositeTeam={rightTeamAgents[index] || []}
                  onAgentRemove={(agent) => removeAgentFromTeam(agent, setLeftTeamAgents, index)}
                />
                <div className='text-4xl font-bold text-gray-700'>VS</div>
                <TeamAreas
                  agents={rightTeamAgents[index] || []}
                  onDrop={(agent) => handleDropRightTeam(index, agent)}
                  oppositeTeam={leftTeamAgents[index] || []}
                  onAgentRemove={(agent) => removeAgentFromTeam(agent, setRightTeamAgents, index)}
                />
              </div>
            ))}

            {error && <p className="text-red-500">{error}</p>}

            {teamSelected ? (
              <div className='p-6 bg-white rounded-lg'>
                <h2 className='mb-4 text-2xl font-bold text-center text-gray-700'>Drag and Drop to Team</h2>
                <div className='flex flex-wrap'>
                  {filteredAgents.map((agent, index) => (
                    <Agents
                      key={index}
                      agent={agent}
                      onDoubleClick={() => { }}
                      isTeamMember={isAgentSelected(agent)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className='p-6 bg-white rounded-lg'>
                <h2 className='mb-4 text-2xl font-bold text-center text-gray-700'>Select a team to view agents</h2>
              </div>
            )}
          </div>

          <div className='flex flex-col mt-6 w-full gap-6 p-8 pb-12 card ml-[-40px]'>
            <h1 className='font-[500] leading-[33px] text-[22px] text-[#269F8B]'>Contest Details</h1>
            <form className='flex flex-wrap justify-start gap-x-[70px] gap-y-[35px]'>

              <div className='flex flex-col gap-2 w-[187px]'>
                <label htmlFor='startDate' className='font-[400] text-[14px] text-dGreen'>Start Date</label>
                <div className='relative custom-date-input'>
                  <img src="/icons/calendarIcon.png" alt="" className='absolute w-[18px] h-[17px] top-[14px] right-[9px]' />
                  <input
                    type="date"
                    id='startDate'
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={currentDate}
                    className='date-input w-full text-[#8fa59c] bg-lGreen p-2 text-[14px] font-[500] border-none h-[45px]' />
                </div>
              </div>

              <div className='flex flex-col gap-2 w-[175px]'>
                <label htmlFor='endDate' className='font-[400] text-[14px] text-dGreen'>End Date</label>
                <div className='relative custom-date-input'>
                  <img src="/icons/calendarIcon.png" alt="" className='absolute w-[18px] h-[17px] top-[14px] right-[9px]' />
                  <input
                    type="date"
                    id='endDate'
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    className='date-input w-full text-[#8fa59c] bg-lGreen p-2 text-[14px] font-[500] border-none h-[45px]' />
                </div>
              </div>

              <div className='flex flex-col gap-2 w-[175px]'>
                <label htmlFor='startTime' className='font-[400] text-[14px] text-dGreen'>Start Time</label>
                <div className='relative custom-time-input'>
                  <img src="/icons/clockIcon.png" alt="" className='absolute w-[26px] h-[26px] top-[9px] right-[9px]' />
                  <input
                    type="time"
                    id='startTime'
                    required
                    value={startTime}
                    min={minTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className='time-input w-full text-[#8fa59c]  bg-lGreen p-2 text-[14px] font-[500] border-none h-[45px]'
                  />
                </div>
              </div>

              <div className='flex flex-col gap-2 w-[175px]'>
                <label htmlFor='endTime' className='font-[400] text-[14px] text-dGreen'>End Time</label>
                <div className='relative custom-time-input'>
                  <img src="/icons/clockIcon.png" alt="" className='absolute w-[26px] h-[26px] top-[9px] right-[9px]' />
                  <input
                    type="time"
                    id='endTime'
                    required
                    onChange={(e) => setEndTime(e.target.value)}
                    className='time-input w-full text-[#8fa59c] bg-lGreen p-2 text-[14px] font-[500] border-none h-[45px]' />
                </div>
              </div>

              <div className='flex flex-col gap-2 w-[188px]'>
                <label htmlFor='selectKPI' className='font-[400] text-[14px] text-dGreen'>KPI</label>
                <select id='selectKPI'
                  onChange={(e) => setSelectedKpi(e.target.value)}
                  required
                  className="text-[12px] font-[500] transition duration-75 border-none shadow-[0px_4px_4px_0px_#40908417] rounded-[10px] focus:border-dGreen focus:ring-1 focus:ring-inset focus:ring-dGreen bg-none h-[45px]" >
                  <option value=''>Select KPI</option>
                  {kpiOptions.map(option => (
                    <option key={option.id} value={option.kpi_value}>{option.kpi_name}</option>
                  ))}
                </select>
              </div>

              <div className='flex flex-col gap-2 w-[175px]'>
                <label htmlFor='KPI Target' className='font-[400] text-[14px] text-dGreen'> {selectedKpi ? `${selectedKpi} Target` : 'Target'}</label>
                <div className='flex gap-2 mt-[-26px]'>
                  <button className='px-2 py-1  w-[114px] rounded-lg mt-8 bg-themeGreen text-white' type="button" onClick={() => handleButtonClick('Number')}>Number</button>
                  <button className='px-2 py-1  w-[114px] rounded-lg mt-8 bg-themeGreen text-white' type="button" onClick={() => handleButtonClick('Dollar')}>Dollar</button>
                  <button className='px-2 py-1  w-[114px] rounded-lg mt-8 bg-themeGreen text-white' type="button" onClick={() => handleButtonClick('Per')}>Percentage</button>
                </div>

                {showInput && inputType == 'Number' && (
                  <input
                    type="number"
                    placeholder={`${selectedKpi ? selectedKpi : ""} Target`}
                    min={0}
                    onChange={handleNumberChange}
                    value={numberTarget}
                    className='w-full bg-lGreen p-2 text-[14px] placeholder-[#8fa59c] font-[500] border-none h-[45px] mt-2' />
                )}

                {showInput && inputType == 'Dollar' && (
                  <div className="relative w-full mt-2">
                    <input
                      type="text"
                      placeholder={`${selectedKpi} Target`}
                      onChange={handleDollarChange}
                      value={dollarTarget}
                      className='w-full bg-lGreen p-2 pr-8 text-[14px] placeholder-[#8fa59c] font-[500] border-none h-[45px]'
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[14px] font-[500] text-dGreen">$</span>
                  </div>
                )}

                {showInput && inputType == 'Per' && (
                  <div className="relative w-full mt-2">
                    <input
                      type="text"
                      placeholder={`${selectedKpi} Target`}
                      onChange={handlePercentageChange}
                      value={percentageTarget}
                      className='w-full bg-lGreen p-2 pr-8 text-[14px] placeholder-[#8fa59c] font-[500] border-none h-[45px]'
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[14px] font-[500] text-dGreen">%</span>
                  </div>
                )}
              </div>
              <div className='flex flex-col gap-2 w-[175px]'>
                <label htmlFor='Contest Formula' className='font-[400] text-[14px] text-dGreen'>Contest Formula</label>
                <input
                  type="text" id='Contest Formula'
                  placeholder='Formula...'
                  className='w-full bg-lGreen p-2 text-[14px] placeholder-[#8fa59c] font-[500] border-none h-[45px]' />
              </div>
            </form>
          </div>

          <div className='flex flex-col w-full gap-6 p-8 pb-12 card ml-[-30px] mt-8 ' >
            <h1 className='font-[500] leading-[33px] text-[22px] text-[#269F8B]'>Add Prize</h1>
            <div className='flex flex-wrap items-center gap-[20px] justify-between'>

              <div onClick={() => handleCash("CASH")} className={`cursor-pointer ${(!leftTeamAgents.some((team) => team.length > 0) || !rightTeamAgents.some((team) => team.length > 0)) ? "opacity-80 cursor-not-allowed" : ""}`}>
                <img src="/images/cash.png" alt="Cash" className={`w-[139px] h-[88px] ${prizeSelected == 'CASH' ? "" : "opacity-40"}`} />
                <h1 className={`text-[20px] font-normal leading-[30px] mt-6 text-center ${prizeSelected == 'CASH' ? "text-[#269F8B]" : "text-[#333333] opacity-40"}`} >CASH</h1>
              </div>

              <div onClick={() => handleVoucher("VOUCHER")} className={`cursor-pointer ${(!leftTeamAgents.some((team) => team.length > 0) || !rightTeamAgents.some((team) => team.length > 0)) ? "opacity-80 cursor-not-allowed" : ""}`}>
                <img src="/images/voucher.png" alt="Voucher" className={`w-[103px] h-[95px] ${prizeSelected == 'VOUCHER' ? "" : "opacity-40"}`} />
                <h1 className={`text-[20px] font-normal leading-[30px] mt-6 text-center ${prizeSelected == 'VOUCHER' ? "text-[#269F8B]" : "text-[#333333] opacity-40"}`}>VOUCHER</h1>
              </div>

              <div onClick={() => handleFood("FOOD")} className={`cursor-pointer ${(!leftTeamAgents.some((team) => team.length > 0) || !rightTeamAgents.some((team) => team.length > 0)) ? "opacity-80 cursor-not-allowed" : ""}`}>
                <img src="/images/food.png" alt="Food" className={`w-[103px] h-[95px] ${prizeSelected == 'FOOD' ? "" : "opacity-40"}`} />
                <h1 className={`text-[20px] font-normal leading-[30px] mt-6 text-center ${prizeSelected == 'FOOD' ? "text-[#269F8B]" : "text-[#333333] opacity-40"}`}>FOOD</h1>
              </div>

              <div onClick={() => handleExp("EXPERIENCE")} className={`cursor-pointer ${(!leftTeamAgents.some((team) => team.length > 0) || !rightTeamAgents.some((team) => team.length > 0)) ? "opacity-80 cursor-not-allowed" : ""}`}>
                <img src="/images/experience.png" alt="Experience" className={`w-[103px] h-[95px] ${prizeSelected == 'EXPERIENCE' ? "" : "opacity-40"}`} />
                <h1 className={`text-[20px] font-normal leading-[30px] mt-6 text-center ${prizeSelected == 'EXPERIENCE' ? "text-[#269F8B]" : "text-[#333333] opacity-40"}`}>EXPERIENCE</h1>
              </div>

            </div>
          </div>
          {renderPrizeForm(prizeSelected)}



          <div className='flex flex-col w-full gap-6 p-8 pb-12 card  ml-[-30px] mt-8'>
            <h1 className='font-[500] leading-[33px] text-[22px] text-[#269F8B]'>Add Points</h1>
            <div className='flex flex-wrap items-center gap-[20px] justify-between w-full'>
              <div className="relative w-full sm:w-[477px] flex items-center gap-[10px] sm:gap-[23px] mb-10">
                <span className='text-[12px] sm:text-[15.6px] font-semibold leading-[23.4px] tracking-[0.01em] text-left text-[#79A39D]'>0</span>
                <input
                  type="range"
                  min="0"
                  max="350"
                  value={cashValue}
                  onChange={(e) => setCashValue(e.target.value)}
                  className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer slider"
                  disabled
                />
                <div
                  style={{ left: `${((cashValue / 1280) * 100)}%` }}
                  className="absolute top-8 sm:top-10 w-[50px] sm:w-[66px] h-[25px] sm:h-[35px] flex justify-center items-center ml-52 max-sm:ml-[50px]  bg-themeGreen text-white text-xs sm:text-sm font-bold leading-[21px] text-center">
                  {cashValue}
                </div>
                <span className='text-[12px] sm:text-[15.6px] font-semibold leading-[10.4px] mr-10 tracking-[0.01em] text-left text-[#79A39D]'>350</span>
              </div>
              <div className='flex flex-wrap justify-between w-full sm:flex-1'>
                {badges.map((badge, index) => (
                  <div key={index} className='text-center flex flex-col justify-center items-center gap-[2px] w-1/2 sm:w-auto'>
                    <img src={badge.image_path} alt='' className='w-[45px] h-[45px] sm:w-[61px] sm:h-[61px]' />
                    <h2
                      className={`text-[12px] sm:text-[14.4px] font-semibold leading-[21.6px] opacity-50 inline-block text-transparent bg-clip-text ${badge.color}`}
                    >
                      {badge.name}
                    </h2>
                    <p className='text-[8px] bgre sm:text-[10px] font-normal leading-[15px] opacity-50 text-[#072D20]'>{badge.range}</p>
                  </div>
                ))}
              </div>
            </div>


            <div className='flex flex-col items-center w-full mt-2'>
              <TeamAgentsDisplay selectedTeam={selectedTeam1} filteredAgents={allTeamAgents} />
            </div>



          </div>

          <div className='flex flex-col w-full gap-6 p-8 pb-12 card ml-[-30px] mt-8'>
            <h1 className='font-[500] leading-[33px] text-[22px] text-[#269F8B]'>Select Theme</h1>


            <div className='flex flex-wrap items-center gap-[20px] justify-start'>
              <img src="images/theme1.png" alt="" className={`w-[237px] h-[128px] cursor-pointer rounded-[18px] ${tvTheme == "theme1" ? "" : "opacity-40"}`} onClick={() => setTvTheme("theme1")} />
              <img src="images/theme2.png" alt="" className={`w-[237px]  cursor-pointer rounded-[24px] ${tvTheme == "theme2" ? "" : "opacity-40"}`} onClick={() => setTvTheme("theme2")} />
            </div>


          </div>
          <div className='w-full flex justify-end '>
            <button
              onClick={handleSubmitTeam}
              className={`px-6 py-4 font-bold  w-[214px]  mr-[30px] rounded-lg bg-themeGreen text-white mt-8`}>
              Submit
            </button>
          </div>



        </div>




      </div>
    </DndProvider>
  );
}