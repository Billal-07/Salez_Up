import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SideBar from '../components/SideBar';
import 'react-circular-progressbar/dist/styles.css';
import dataJson from '../Data.json';
import fallbackImage from "/public/images/image_not_1.jfif";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRotateRight } from '@fortawesome/free-solid-svg-icons';


// -------------------------- Dynamic Logic --------------------------------//



const SalesAgent_Dashboard = () => {
    const [tableData, setTableData] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [selectedCampaignId, setSelectedCampaignId] = useState(null);
    const [selectedTeamName, setSelectedTeamName] = useState(null);
    const [selectedTeams, setSelectedTeams] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [performanceData, setPerformanceData] = useState([]);
    const [localStorageData, setLocalStorageData] = useState([]);
    const [currentDataIndex, setCurrentDataIndex] = useState(0);

        // const fetchLocal = () => {
        //     const extractedTableData = localStorage.getItem('tableData');
        //     if (extractedTableData) {
        //         const parsedData = JSON.parse(extractedTableData);
        //         setLocalStorageData(parsedData);
        //         // console.log("Data1:",localStorageData)
        //         console.log("Data2:", parsedData)
        //     }
        // }

        // useEffect(() => {
        //     fetchLocal()
        // }, []);

        // Function to fetch data from localStorage
        const fetchLocal = () => {
            const extractedTableData = localStorage.getItem('tableData');
            if (extractedTableData) {
                const parsedData = JSON.parse(extractedTableData);
                setLocalStorageData(parsedData);
                console.log("Data fetched from localStorage:", parsedData);
            }
        };
    
        // Use useEffect to set up the listener on mount
        useEffect(() => {
            fetchLocal(); // Initial fetch
    
            // Event listener for changes in localStorage
            const handleStorageChange = (event) => {
                if (event.key === 'tableData') {
                    fetchLocal(); // Fetch updated data when localStorage changes
                }
            };
    
            window.addEventListener('storage', handleStorageChange);
    
            // Clean up the event listener on unmount
            return () => {
                window.removeEventListener('storage', handleStorageChange);
            };
        }, []);

    const [campaignPerformanceMap, setCampaignPerformanceMap] = useState({});
    // Fetch campaigns and teams on component mount
    useEffect(() => {
        const fetchCampaignsAndAgents = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('https://crmapi.devcir.co/api/campaigns_and_teams');
                if (!response.ok) {
                    throw new Error('Failed to fetch campaigns');
                }
                const data = await response.json();
                const fetchedTeams = data.filter(
                    (team) => team.team.manager_id == localStorage.getItem("id")
                );

                // Group teams by campaign
                const groupedCampaigns = fetchedTeams.reduce((acc, team) => {
                    const existingCampaign = acc.find(c => c.campaign.id === team.campaign.id);
                    if (existingCampaign) {
                        existingCampaign.teams.push(team);
                    } else {
                        acc.push({
                            ...team,
                            teams: [team]
                        });
                    }
                    return acc;
                }, []);

                setCampaigns(groupedCampaigns);

                if (groupedCampaigns.length > 0) {
                    const firstCampaign = groupedCampaigns[0];
                    setSelectedCampaignId(firstCampaign.campaign.id);
                    // Set initial teams for the first campaign
                    setSelectedTeams(firstCampaign.teams.map((team) => team.team.team_name));

                    // Fetch initial campaign's KPI data
                    await handleCampaignClick(firstCampaign);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCampaignsAndAgents();
    }, []);

    // Extract data from JSON on component mount
    useEffect(() => {
        const extractedData = Object.values(dataJson).map(day => {
            const [dayName, values] = Object.entries(day)[0];
            return { dayName, values };
        });
        setTableData(extractedData);
    }, []);


    const handleCampaignClick = async (campaign) => {
        try {
            // Set the selected campaign
            setSelectedCampaignId(campaign.campaign.id);

            // Set the teams for the selected campaign
            setSelectedTeams(campaign.teams.map(team => team.team.team_name));

            // Check if we already have performance data for this campaign
            if (campaignPerformanceMap[campaign.campaign.id]) {
                setPerformanceData(campaignPerformanceMap[campaign.campaign.id]);
                return;
            }

            // Fetch KPI data for teams
            const teamKpiPromises = campaign.teams.map(async (team) => {
                const agentsResponse = await fetch(`https://crmapi.devcir.co/api/sales_agents/team/${team.team.team_id}`);
                if (!agentsResponse.ok) {
                    throw new Error(`Failed to fetch sales agents for team ${team.team.team_id}`);
                }
                const agentsData = await agentsResponse.json();

                // Parse the KPI data from the first agent (assuming similar KPIs for the team)
                const firstAgent = agentsData[0];
                if (firstAgent && firstAgent.kpi_data) {
                    const kpiDataParsed = JSON.parse(firstAgent.kpi_data);

                    // Transform KPI data to match the existing table structure
                    const transformedKpiData = kpiDataParsed.kpiData.map((kpi) => ({
                        kpi: kpi.kpi_Name,
                        target: kpi.target,
                        actual: '-', // You might want to fetch actual values from another API
                        percentToTarget: '-', // Calculate based on actual vs target
                        commission: kpi.opportunity.toFixed(2),
                        gatekeeper: kpi.gatekeeper || 'N/A',
                        gatekeeperTarget: '-'
                    }));






                    // Update the campaign performance map
                    setCampaignPerformanceMap(prev => ({
                        ...prev,
                        [campaign.campaign.id]: transformedKpiData
                    }));

                    // Set the performance data for the current campaign
                    setPerformanceData(transformedKpiData);
                }
            });

            await Promise.all(teamKpiPromises);
        } catch (err) {
            console.error("Error fetching agents:", err);
            setPerformanceData([]); // Reset performance data on error
        }
    };



    const [percent_Target, setPercent_Target] = useState('')


    // Handle team click to fetch KPI data

    const handleTeamClick = async (teamName) => {
        try {
            fetchLocal()
            // Find the campaign and team that matches the team name
            const selectedCampaign = campaigns.find(campaign =>
                campaign.teams.some(team => team.team.team_name === teamName)
            );

            if (selectedCampaign) {
                const selectedTeam = selectedCampaign.teams.find(
                    team => team.team.team_name === teamName
                );

                // Fetch agents and KPI data for the specific team
                const agentsResponse = await fetch(`https://crmapi.devcir.co/api/sales_agents/team/${selectedTeam.team_id}`);


                if (!agentsResponse.ok) {
                    throw new Error(`Failed to fetch sales agents for team ${selectedTeam.team_id}`);
                }
                const agentsData = await agentsResponse.json();

                console.log("Selected Agent Data: ", agentsData)

                // Parse the KPI data from the first agent
                const firstAgent = agentsData[0];

                console.log("First Agent: ", firstAgent)


                if (firstAgent) {
                    const kpiDataParsed = JSON.parse(firstAgent.kpi_data);

                    console.log("Marium is here: ", kpiDataParsed)

                    const transformedKpiData = kpiDataParsed.kpiData.map(kpi => ({
                        kpi: kpi.kpi_Name,
                        target: kpi.target,
                        actual: '-',
                        percentToTarget: '-',
                        commission: kpi.opportunity.toFixed(2),
                        gatekeeper: kpi.gatekeeper || 'N/A',
                        gatekeeperTarget: '-'
                    }));

                    console.log("----Transformed Data---", transformedKpiData)
                    setPerformanceData(transformedKpiData);

                    // Settng Index to Initial VALUE 0

                    setCurrentDataIndex(0);
                }
                else {
                    console.log("Error nhi hai data hi nhi hai")
                }
            }
        } catch (err) {
            console.log("Error fetching team KPI data:", err);
            setPerformanceData([]);
        }
    };


    const handleNextData = () => {
        if (currentDataIndex < localStorageData.length - 1) {
            setCurrentDataIndex(prev => prev + 1);
        }
    };

    const handlePreviousData = () => {
        if (currentDataIndex > 0) {
            setCurrentDataIndex(prev => prev - 1);
        }
    };

    const getPercentColor = (percent) => {
        const numPercent = parseInt(percent);
        if (isNaN(numPercent)) return 'bg-gray-100 text-gray-800';

        if (numPercent < 40) return 'bg-green-200 text-green-800';
        if (numPercent >= 40 && numPercent < 60) return 'bg-red-200 text-red-800';
        return 'bg-blue-200 text-blue-800';
    };

    const handleReload = () => {
        console.log("Reloaded Local")
        fetchLocal()
    }

    return (
        <div className='mx-2'>
            <Navbar />
            <div className='flex gap-3'>
                <SideBar />
                <div className='w-full mt-8 md:ml-12 mr-5 flex flex-col gap-[32px] mb-4'>
                    <div className='flex flex-col w-full gap-6 p-8 pb-12 card white'>
                        <div className='flex flex-col'>
                            <div className='flex justify-between items-center mb-4'>
                                <h1 className='font-[500] leading-[33px] text-[22px] text-[#269F8B]'>Campaign Performance</h1>
                                <div className='flex'>
                                    <button className='px-6 py-1 text-sm font-medium text-[#269F8B] border border-gray-300 bg-white rounded-l shadow-xl'>All</button>
                                    <button className='px-3 py-1 text-sm font-medium text-[#ABABAB] border-t border-b border-r border-gray-300 bg-white'>Revenue</button>
                                    <button className='px-3 py-1 text-sm font-medium text-[#ABABAB] border-t border-b border-r border-gray-300 bg-white'>Units</button>
                                    <button className='px-3 py-1 text-sm font-medium text-[#ABABAB] border-t border-b border-r border-gray-300 bg-white'>Conversion</button>
                                    <button className='px-3 py-1 text-sm font-medium text-[#ABABAB] border-t border-b border-r border-gray-300 bg-white'>Dials</button>
                                    <button className='px-3 py-1 text-sm font-medium text-[#ABABAB] border-t border-b border-r border-gray-300 bg-white'>Productivity</button>
                                </div>
                            </div>

                            {/* Campaigns Display */}
                            <div className='flex justify-end'>
                                {isLoading ? (
                                    <div className="text-sm text-gray-500">Loading campaigns...</div>
                                ) : (
                                    campaigns.map((campaign) => (
                                        <div
                                            key={campaign.id}
                                            className="w-10 h-10 bg-cover bg-center rounded-full ml-2"
                                            style={{
                                                backgroundImage: `url(${campaign.campaign.image_path || fallbackImage})`,
                                                opacity: selectedCampaignId == campaign.id ? 1 : 0.5,
                                                cursor: 'pointer',
                                            }}
                                            onClick={() => handleCampaignClick(campaign)}
                                        />
                                    ))
                                )}
                            </div>

                            {/* Teams Display */}

                            <div className='flex justify-between'>

                                <div className='flex flex-wrap items-center justify-between gap-3 lg:justify-start'>
                                    {selectedTeams.map((teamName, index) => (
                                        <div key={index}>
                                            <p
                                                className='w-[124px] h-[41px] flex items-center justify-center text-[17px] leading-[25px] font-[400] rounded-[192px] bg-themeGreen text-white text-center cursor-pointer'
                                                onClick={() => handleTeamClick(teamName)}
                                            >
                                                {teamName}
                                            </p>
                                        </div>
                                    ))}
                                </div>


                                <div>
                                    <FontAwesomeIcon icon={faArrowRotateRight} onClick={handleReload} className='text-2xl mt-[-6px] text-themeGreen pt-4 hover:cursor-pointer hover:transition-all hover:scale-110 hover:duration-300' />
                                </div>

                            </div>


                        </div>

                        {/* Performance Table */}
                        <div className='bg-white rounded-lg shadow-sm overflow-hidden border-2 border-gray-100'>
                            <div className='p-6'>




                                {localStorageData.length > 0 && performanceData.length > 0 && (
                                    <div className='flex justify-between items-center mb-12'>
                                        <div className='text-lg font-semibold text-[#269F8B]'>
                                            Day: {localStorageData[currentDataIndex]?.dayName || 'N/A'}
                                        </div>
                                        <div className='flex items-center gap-4'>
                                            <button
                                                onClick={handlePreviousData}
                                                disabled={currentDataIndex === 0}
                                                className={`px-4 py-2 rounded ${currentDataIndex === 0
                                                    ? 'bg-gray-200 text-gray-400'
                                                    : 'bg-[#269F8B] text-white hover:bg-opacity-90'}`}
                                            >
                                                Previous
                                            </button>
                                            <span className='text-sm text-gray-600'>
                                                {currentDataIndex + 1} / {localStorageData.length}
                                            </span>
                                            <button
                                                onClick={handleNextData}
                                                disabled={currentDataIndex === localStorageData.length - 1}
                                                className={`px-4 py-2 rounded ${currentDataIndex === localStorageData.length - 1
                                                    ? 'bg-gray-200 text-gray-400'
                                                    : 'bg-[#269F8B] text-white hover:bg-opacity-90'}`}
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}



                                <table className='w-full'>
                                    <thead>
                                        <tr className='text-left text-sm font-medium text-gray-500'>
                                            <th className='pb-2 text-[#269F8B]'>KPIs</th>
                                            <th className='pb-2 text-[#269F8B] text-center'>Target</th>
                                            <th className='pb-2 text-[#269F8B] text-center'>Actual</th>
                                            <th className='pb-2 text-[#269F8B] text-center'>% to Target</th>
                                            <th className='pb-2 text-[#269F8B] text-center'>Commission</th>
                                            <th className='pb-2 text-[#269F8B] text-center'>Gatekeeper</th>
                                            <th className='pb-2 text-[#269F8B] text-center'>Gatekeeper Target</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {performanceData.length > 0 ? (
                                            performanceData.map((row, index) => (
                                                <tr key={index} className='text-sm'>
                                                    <td className='py-2 text-[#269F8B] font-medium'>{row.kpi}</td>
                                                    <td className='py-2 text-center'>{row.target}</td>
                                                    <td className='py-2 text-center'>  {localStorageData.length > 0
                                                        ? localStorageData[currentDataIndex].values[index]
                                                        : '-'}</td>
                                                    {/* <td className='py-2 text-center'>
                                                        <span className={px-6 py-1 ${getPercentColor(row.percentToTarget)}}>
                                                            {row.percentToTarget}
                                                        </span>
                                                         </td> */}
                                                    <td className='py-2 text-center'>
                                                        <span className={`px - 6 py-1 ${getPercentColor(row.percentToTarget)}`}>


                                                            {
                                                                localStorageData.length > 0
                                                                    ? ((localStorageData[currentDataIndex].values[index] / row.target) * 100).toFixed(2)
                                                                    : '-'
                                                            }&nbsp;&nbsp;%

                                                        </span>
                                                    </td>
                                                    <td className='py-2 text-center'>${row.commission}</td>
                                                    <td className={`px-6 py-1 text-center ${row.gatekeeper == 'N/A' ? 'bg-gray-100' : ''}`}>
                                                        {row.gatekeeper}
                                                    </td >
                                                    <td className={`px-6 py-1 text-center`}>
                                                        <span className={`inline - block ${row.gatekeeperTarget == '-' ? 'bg-gray-100 w-12' : ''}`}>
                                                            {row.gatekeeperTarget}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="text-center py-4 text-gray-500">
                                                    Select a team to view KPI data
                                                </td>
                                            </tr>

                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div >
                </div >
            </div >
        </div >
    );
};

export default SalesAgent_Dashboard;