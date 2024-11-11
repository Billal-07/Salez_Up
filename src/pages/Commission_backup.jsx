import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SideBar from '../components/SideBar';
import axios from 'axios';
import { Plus, FilePenLine } from 'lucide-react';
import logo from '../../public/icons/Editing.png'
import { json } from 'react-router-dom';
// --------------------------- Saving Data ------------------------------//
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Commission = () => {
    // ------------------------- Declerations-----------------------------------//
    const [kpiTableVisible, setKpiTableVisible] = useState({});
    const [isCreated, setIsCreated] = useState(false);
    const [teams, setTeams] = useState([]);
    const [count, setCount] = useState(0);
    const [selectedTeam, setSelectedTeam] = useState();
    const [selectedTeamName, setSelectedTeamName] = useState("All Teams");
    const [teamData, setTeamData] = useState({});
    const [teamKpiData, setTeamKpiData] = useState({});
    const [campaigns, setCampaigns] = useState([]);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [opportunity_main, setOpportunity_main] = useState("");
    const currencies = ['$', '£', '€', '¥', '₹'];
    const [kpis, setKpis] = useState([]);
    const [selectedKpiId, setSelectedKpiId] = useState(null);
    const [kpiData, setKpiData] = useState([]);
    const [countData, setCountData] = useState(0);
    const [kpisInTable, setKpisInTable] = useState(0);
    const [filteredTeams, setFilteredTeams] = useState([]);
    const [customKpiData, setCustomKpiData] = useState({});
    const [selectedKpiNames, setSelectedKpiNames] = useState({});
    const [selectedKpis, setSelectedKpis] = useState({});
    const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthYear());

    // ------------------------------ Gatekeeper logic -------------------------------------//

    const [gatekeeperSet, setGatekeeperSet] = useState({});


    ////----------------------------------------- Pagination ------------------------------------------------//
    const [currentPage, setCurrentPage] = useState(1);
    const [agentsPerPage] = useState(9);
    const Pagination = ({ agentsPerPage, totalAgents, paginate, currentPage }) => {
        const pageNumbers = [];
        for (let i = 1; i <= Math.ceil(totalAgents / agentsPerPage); i++) {
            pageNumbers.push(i);
        }
        return (
            <nav>
                <ul className='flex justify-center mt-4'>
                    {pageNumbers.map(number => (
                        <li key={number} className='mx-1'>
                            <button
                                onClick={() => paginate(number)}
                                className={`px-3 py-1 rounded ${currentPage == number ? 'bg-themeGreen text-white' : 'bg-gray-200'}`}
                            >
                                {number}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        );
    };
    function getCurrentMonthYear() {
        const date = new Date();
        return date.toLocaleString('default', { month: 'short', year: 'numeric' });
    }
    function generateMonthOptions() {
        const options = ['All Agents'];
        for (let year = 2021; year <= 2030; year++) {
            for (let month = 0; month < 12; month++) {
                const date = new Date(year, month);
                const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
                options.push(monthYear);
            }
        }
        return options;
    }
    const monthOptions = generateMonthOptions();
    // -------------------- Custom KPI Data ------------------------------//

    const handleCustomKpiInputChange = (teamId, index, field, value) => {
        const kpiExists = kpis.some(kpi => kpi.kpi_name.toLowerCase() == value.toLowerCase());
        if (kpiExists) {
            alert('Name already exists');
        } else {
            setCustomKpiData(prevData => {
                const newTeamData = [...(prevData[teamId] || [])];
                newTeamData[index] = { ...newTeamData[index], [field]: value };
                const teamOpportunity = teamData[teamId]?.opportunity || 0;
                const weightingValue = parseFloat(newTeamData[index].Custom_Weighting) || 0;
                const calculatedOpportunity = (weightingValue / 100) * teamOpportunity;
                newTeamData[index].Custom_Opportunity = calculatedOpportunity

                if (field == 'Custom_Gatekeeper') {
                    if (value && !gatekeeperSet[teamId]) {
                        setGatekeeperSet(prev => ({ ...prev, [teamId]: true }));
                    } else if (!value && gatekeeperSet[teamId]) {
                        setGatekeeperSet(prev => ({ ...prev, [teamId]: false }));
                    }
                }

                return { ...prevData, [teamId]: newTeamData };
            });
        }
    };


    useEffect(() => {
        console.log("Updated customKpiData:", customKpiData);
    }, [customKpiData]);
    const handleCustomKpiChange = (index, field, value) => {
        setSelectedRow(prevState => {
            const newCustomKpiData = [...prevState.kpi_data.customKpiData];
            if (field == 'Custom_KPI_ID') {
                const selectedKpi = kpis.find(kpi => kpi.id.toString() == value);
                newCustomKpiData[index] = {
                    ...newCustomKpiData[index],
                    Custom_KPI_ID: value,
                    Custom_KPI_Name: selectedKpi ? selectedKpi.kpi_name : ''
                };
            } else {
                newCustomKpiData[index] = {
                    ...newCustomKpiData[index],
                    [field]: value
                };
            }
            return {
                ...prevState,
                kpi_data: {
                    ...prevState.kpi_data,
                    customKpiData: newCustomKpiData
                }
            };
        });
    };
    useEffect(() => {
        const fetchKpis = async () => {
            try {
                const response = await axios.get('http://crmapi.devcir.co/api/kpi_info');
                setKpis(response.data);
            } catch (error) {
                console.error('Error fetching KPIs:', error);
            }
        };
        fetchKpis();
        console.log("Dial Selected Value: ",selectedDialOptions)
    }, []);
    
    const postKpiInfo = async (kpiName) => {
        try {
            const response = await axios.post('http://crmapi.devcir.co/api/kpi_info', {
                kpi_name: kpiName,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
            console.log(`KPI name ${kpiName} saved successfully.`);
            return response.data.id;
        } catch (error) {
            console.error(`Error saving KPI name ${kpiName}:`, error);
            return null;
        }
    };
    const handleSave = async (teamId) => {
        const regularKpiWeightings = (teamKpiData[teamId] || [])
            .map(kpi => parseFloat(kpi.weighting) || 0);
        const customKpiWeightings = (customKpiData[teamId] || [])
            .map(kpi => parseFloat(kpi.Custom_Weighting) || 0);
        const sumOfWeights = [...regularKpiWeightings, ...customKpiWeightings]
            .reduce((sum, weight) => sum + weight, 0);
        if (sumOfWeights > 100) {
            alert("The sum of weightings is greater than 100. Please adjust your weightings.");
            return;
        }
        const regularKpiCount = teamKpiData[teamId]?.length || 0;
        const customKpiCount = customKpiData[teamId]?.length || 0;
        let savedTeamData = {
            id: teamId,
            regularKpiCount: regularKpiCount,
            customKpiCount: customKpiCount,
            TotalCount: regularKpiCount + customKpiCount,
            kpiData: teamKpiData[teamId] || [],
            customKpiData: customKpiData[teamId] || [],
            teamInfo: {
                month: teamData[teamId]?.month || '',
                frequency: teamData[teamId]?.frequency || '',
                currency: teamData[teamId]?.currency || '$',
                opportunity: teamData[teamId]?.opportunity || ''
            },
            sumOfWeights: sumOfWeights,
        };
        for (let i = 0; i < savedTeamData.customKpiData.length; i++) {
            const kpi = savedTeamData.customKpiData[i];
            const newKpiId = await postKpiInfo(kpi.Custom_KPI_Name);
            if (newKpiId) {
                savedTeamData.customKpiData[i].Custom_KPI_ID = newKpiId;
            }
        }
        console.log(`Count of regular KPIs added: ${regularKpiCount}`);
        console.log(`Count of custom KPIs added: ${customKpiCount}`);
        console.log(JSON.stringify(savedTeamData, null, 2));
        alert("Data saved successfully. Sum of weightings: " + sumOfWeights);
        // Prepare the data to be sent to the API
        const dataToPost = {
            kpi_data: JSON.stringify(savedTeamData),
            commission: savedTeamData.teamInfo.opportunity
        };
        const TotalKpiCount = savedTeamData.regularKpiCount + savedTeamData.customKpiCount;
        const dataToPostToTeams = {
            kpi_count: TotalKpiCount
        };
        try {
            const response = await fetch(`http://crmapi.devcir.co/api/teams/${teamId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataToPostToTeams)
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const responseData = await response.json();
            console.log('Response from API:', responseData);
            // Show success alert
            alert("Data Updated successfully In Teams!");
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            alert("There was an error posting the data.");
        }
        try {
            const response = await fetch(`http://crmapi.devcir.co/api/sales-agents/team/${teamId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataToPost)
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const responseData = await response.json();
            console.log('Response from API:', responseData);
            // Show success alert
            alert("Data posted successfully!");
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            alert("There was an error posting the data.");
        }
    };
    const handleSelectChange = (teamId, field, value) => {
        console.log(`Updating ${field} for team ${teamId} to ${value}`);
        setTeamData(prevData => {
            const newData = {
                ...prevData,
                [teamId]: {
                    ...(prevData[teamId] || {}),
                    [field]: value
                }
            };
            console.log('Updated teamData:', newData);
            if (field == 'opportunity') {
                setCustomKpiData(prevCustomData => {
                    const newCustomData = { ...prevCustomData };
                    if (newCustomData[teamId]) {
                        newCustomData[teamId] = newCustomData[teamId].map(kpi => {
                            const weightingValue = parseFloat(kpi.Custom_Weighting) || 0;
                            const calculatedOpportunity = (weightingValue / 100) * parseFloat(value);
                            return {
                                ...kpi,
                                Custom_Opportunity: calculatedOpportunity
                            };
                        });
                    }
                    return newCustomData;
                });
            }
            return newData;
        });
    };
    const handleSelectChange1 = (teamId, field, value) => {
        if (!/^[\d\s]*$/.test(value)) {
            alert("Opportunity can contain Number Only");
            return;
        }
        console.log(`Updating ${field} for team ${teamId} to ${value}`);
        setTeamData(prevData => {
            const newData = {
                ...prevData,
                [teamId]: {
                    ...(prevData[teamId] || {}),
                    [field]: value
                }
            };
            console.log('Updated teamData:', newData);
            if (field == 'opportunity') {
                setCustomKpiData(prevCustomData => {
                    const newCustomData = { ...prevCustomData };
                    if (newCustomData[teamId]) {
                        newCustomData[teamId] = newCustomData[teamId].map(kpi => {
                            const weightingValue = parseFloat(kpi.Custom_Weighting) || 0;
                            const calculatedOpportunity = (weightingValue / 100) * parseFloat(value);
                            return {
                                ...kpi,
                                Custom_Opportunity: calculatedOpportunity
                            };
                        });
                    }
                    return newCustomData;
                });
            }
            return newData;
        });
    };
    const handleCampaignClick = (campaign) => {
        console.log("The id of the campaign is: ", campaign.id);
        console.log("The team id associated with the campaign is:", campaign.team_id);
        setSelectedCampaign(campaign);
        const filtered = teams.filter(team => team.campaign == campaign.id);
        setFilteredTeams(filtered);
    };


    const handleInputChange = (teamId, index, field, value) => {
        setTeamKpiData(prevData => {
            const newTeamData = [...(prevData[teamId] || [])];
            newTeamData[index] = { ...newTeamData[index], [field]: value };

            if (field == 'gatekeeper') {
                if (value && !gatekeeperSet[teamId]) {
                    setGatekeeperSet(prev => ({ ...prev, [teamId]: true }));
                } else if (!value && gatekeeperSet[teamId]) {
                    setGatekeeperSet(prev => ({ ...prev, [teamId]: false }));
                }
            }

            if (field == 'weighting') {
                const teamOpportunity = teamData[teamId]?.opportunity || 0;
                const weightingValue = parseFloat(value) || 0;
                const calculatedOpportunity = (weightingValue / 100) * teamOpportunity;
                newTeamData[index].opportunity = calculatedOpportunity
            }
            return { ...prevData, [teamId]: newTeamData };
        });
    };


    const handleAddCustomKPI = (teamId) => {
        const currentTeamKpis = teamKpiData[teamId] || [];
        const opportunity = teamData[teamId]?.opportunity || "";
        if (opportunity.trim() == "") {
            alert("Opportunity Field can not be null !!");
            return;
        }
        // Check if all available KPIs have been added
        const unusedKpis = kpis.filter(kpi =>
            !currentTeamKpis.some(teamKpi => teamKpi.kpi_Name_ID == kpi.id.toString())
        );
        if (unusedKpis.length > 0) {
            const nextKpi = unusedKpis[0];
            setTeamKpiData(prevData => {
                const newData = {
                    ...prevData,
                    [teamId]: [
                        ...currentTeamKpis,
                        {
                            kpi_Name_ID: "",
                            kpi_Name: nextKpi.kpi_name,
                            target: "",
                            weighting: "",
                            opportunity: "",
                            gatekeeper: "",
                            team_id: teamId,
                        }
                    ]
                };
                return newData;
            });
            setKpisInTable(prevCount => prevCount + 1);
            setKpiTableVisible(prevState => ({
                ...prevState,
                [teamId]: true
            }));
        } else {
            console.log("Maximum number of KPIs reached for this team");
            alert("All available KPIs have been added.");
        }
    };


    const handleAddCustomKpiRow = (teamId) => {
        const opportunity = teamData[teamId]?.opportunity || "";
        if (opportunity.trim() == "") {
            alert("Opportunity can not be null");
            return;
        }
        setCustomKpiData(prevData => ({
            ...prevData,
            [teamId]: [
                ...(prevData[teamId] || []),
                {
                    Custom_KPI_Name: "",
                    Custom_Target: "",
                    Custom_Weighting: "",
                    Custom_Opportunity: 0,
                    Custom_Gatekeeper: "",
                    team_id: teamId,
                }
            ]
        }));
        setKpisInTable(prevCount => prevCount + 1);
        setKpiTableVisible(prevState => ({
            ...prevState,
            [teamId]: true
        }));
    };
    // ------------------------------ UseEffect -------------------------------------//
    useEffect(() => {
        const fetchData = async () => {
            try {
                const campaignResponse = await axios.get('http://crmapi.devcir.co/api/campaigns');
                const teamResponse = await axios.get('http://crmapi.devcir.co/api/teams');
                setCampaigns(campaignResponse.data);
                setTeams(teamResponse.data);
                if (campaignResponse.data.length > 0) {
                    setSelectedCampaign(campaignResponse.data[0]);
                    const initialFilteredTeams = teamResponse.data.filter(team => team.campaign == campaignResponse.data[0].id);
                    setFilteredTeams(initialFilteredTeams);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);
    useEffect(() => {
        console.log("Value in Opportunity: ", opportunity_main);
    }, [kpiData]);
    useEffect(() => {
        setTeamKpiData(prevData => {
            const newData = { ...prevData };
            Object.keys(newData).forEach(teamId => {
                const teamOpportunity = teamData[teamId]?.opportunity || 0;
                newData[teamId] = newData[teamId].map(kpi => ({
                    ...kpi,
                    opportunity: ((parseFloat(kpi.weighting) || 0) / 100 * teamOpportunity).toFixed(2)
                }));
            });
            return newData;
        });
    }, [teamData]);
    useEffect(() => {
        axios.get('http://crmapi.devcir.co/api/kpi_info')
            .then(response => {
                const kpis = response.data;
                setKpis(kpis);
                setCountData(kpis.length);
                console.log('Number of KPIs:', kpis.length);
                console.log('info KPIs :', kpis);
            })
            .catch(error => {
                console.error('There was an error fetching the KPI data!', error);
            });
    }, []);
    const handleTeamClick = (team) => {
        setSelectedTeam(team);
    };


    const handleKpiChange = (event, teamId, index) => {
        
        const selectedId = event.target.value;
        const selectedKpi = kpis.find(kpi => kpi.id.toString() == selectedId);
        console.log("Selected KPI:", selectedKpi);
        
        setTeamKpiData(prevData => {
            const newTeamData = [...(prevData[teamId] || [])];
            const oldKpiId = newTeamData[index]?.kpi_Name_ID;
            newTeamData[index] = {
                ...newTeamData[index],
                kpi_Name_ID: selectedId,
                kpi_Name: selectedKpi ? selectedKpi.kpi_name : ''
            };
            console.log("Updated KPI data for team:", teamId, "index:", index, "new data:", newTeamData[index]);
            setSelectedKpis(prevSelected => {
                const newSelected = { ...prevSelected };
                if (!newSelected[teamId]) newSelected[teamId] = {};
                if (oldKpiId) {
                    delete newSelected[teamId][oldKpiId];
                }
                if (selectedId) {
                    newSelected[teamId][selectedId] = true;
                }
                return newSelected;
            });
    
            // Update kpisWithSelectionBox state
            setKpisWithSelectionBox(prevState => ({
                ...prevState,
                [`${teamId}-${index}`]: selectedId == '4' // '4' is the id for Dials KPI
            }));
    
            return { ...prevData, [teamId]: newTeamData };
        });
    };


    const handle_Add_KPI_Weighting_Change = (teamId, index, field, value) => {
        const digitSpaceBackspaceRegex = /^[0-9\s]*$/;
        if (!digitSpaceBackspaceRegex.test(value)) {
            alert("Weighting can contain numbers only !!");
            return;
        }
        if (field == 'weighting' && (parseFloat(value) < 1 || parseFloat(value) > 100)) {
            alert("Weightage should always be between 1 and 100 !!");
            return;
        }
        setTeamKpiData(prevData => {
            const newTeamData = [...(prevData[teamId] || [])];
            newTeamData[index] = { ...newTeamData[index], [field]: value };
            if (field == 'weighting') {
                const teamOpportunity = teamData[teamId]?.opportunity || 0;
                const weightingValue = parseFloat(value) || 0;
                const calculatedOpportunity = (weightingValue / 100) * teamOpportunity;
                newTeamData[index].opportunity = calculatedOpportunity
            }
            return { ...prevData, [teamId]: newTeamData };
        });
    };
    const handle_Custom_KPI_Weighting = (teamId, index, field, value) => {
        const digitOnlyRegex = /^[0-9\s]*$/;
        if (!digitOnlyRegex.test(value)) {
            alert("Weighting can contain numbers only !!");
            return;
        }
        if (parseFloat(value) < 1 || parseFloat(value) > 100) {
            alert("Weightage should always be between 1 and 100 !!");
            return;
        }
        setCustomKpiData(prevData => {
            const newTeamData = [...(prevData[teamId] || [])];
            newTeamData[index] = { ...newTeamData[index], [field]: value };
            const teamOpportunity = teamData[teamId]?.opportunity || 0;
            const weightingValue = parseFloat(value) || 0;
            const calculatedOpportunity = (weightingValue / 100) * teamOpportunity;
            newTeamData[index].Custom_Opportunity = calculatedOpportunity
            return { ...prevData, [teamId]: newTeamData };
        });
    };
    useEffect(() => {
        console.log("Updated teamKpiData:", teamKpiData);
    }, [teamKpiData]);
    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const response = await fetch('http://crmapi.devcir.co/api/teams');
                const data = await response.json();
                const activeTeams = data.filter(team => team.status == 'active');
                setTeams(activeTeams);
                console.log("teams: ", teams);
            } catch (error) {
                console.error('Error fetching teams:', error);
            }
        };
        fetchTeams();
    }, [isCreated]);
    useEffect(() => {
        setCustomKpiData(prevData => {
            const newData = { ...prevData };
            Object.keys(newData).forEach(teamId => {
                const teamOpportunity = teamData[teamId]?.opportunity || 0;
                newData[teamId] = newData[teamId].map(kpi => {
                    const weightingValue = parseFloat(kpi.Custom_Weighting) || 0;
                    const calculatedOpportunity = (weightingValue / 100) * teamOpportunity;
                    return {
                        ...kpi,
                        Custom_Opportunity: calculatedOpportunity
                    };
                });
            });
            return newData;
        });
    }, [teamData]);
    const handleUpdate = (team) => {
        const parsedKpiData = JSON.parse(team.kpi_data);
        setSelectedRow({ ...team, kpi_data: parsedKpiData });
        console.log("Selected row", team)
    };
    //-------------------------------------------------------------------------------------------------//
    const [selectedRow, setSelectedRow] = useState(null);
    const handleSaveKpi = async (updatedTeam, team) => {
        console.log('Saved data:', updatedTeam);
        const teamData = JSON.parse(team.kpi_data)
        const dataToPost = {
            kpi_data: JSON.stringify(updatedTeam.kpi_data),
        };
        try {
            const response = await fetch(`http://crmapi.devcir.co/api/sales_agents_update/${updatedTeam.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataToPost)
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const responseData = await response.json();
            console.log('Response from API:', responseData);
            // Show success alert
            alert("Data posted successfully!");
            setSelectedRow(null);
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            alert("There was an error posting the data.");
        }
    };
    const [demoData, setDemoData] = useState([]);
 
    const handleStoreCSV = async () => {
        try {
            const response = await axios.get('http://crmapi.devcir.co/api/sales_agents');
            const salesAgents = response.data;
            const headers = [
                "Name",
                "Surname",
                "Start Date",
                "Campaign",
                "Team",
                "Team Leader",
                "KPI Count",
                "Commission",
                "Target",
                "Frequency"
            ];
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Sales Agents');
            // Add headers
            worksheet.addRow(headers);
            // Style the header row
            worksheet.getRow(1).font = { bold: true };
            // Add data
            salesAgents.forEach(agent => {
                const kpiData = JSON.parse(agent.kpi_data);
                const totalKpiCount = kpiData.TotalCount;
                worksheet.addRow([
                    agent.name,
                    agent.surname,
                    agent.start_date,
                    agent.campaign_detail.name,
                    agent.team.team_name,
                    `${agent.leader.name} ${agent.leader.surname}`,
                    totalKpiCount,
                    agent.commission,
                    agent.target,
                    agent.frequency
                ]);
            });
            // Generate buffer
            const buffer = await workbook.xlsx.writeBuffer();
            // Create blob and save file
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, 'Sales_Agents_Data.xlsx');
        } catch (error) {
            console.error('Error fetching or creating Excel:', error);
        }
    };


    //-------------------------------------- Deleting ----------------------------------------------//



    const handleDelete = async (team) => {
        const deletedTeam = team;
        console.log(`delete team = ${deletedTeam}`)
        try {
            const response = await fetch(`http://crmapi.devcir.co/api/sales_agents_delete/${deletedTeam}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete');
            }

            // Handle successful deletion
            toast.success('Item deleted successfully!', {
                position: "bottom-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
            window.location.reload()

        } catch (err) {
            setError(err.message);
        }
    }




    const renderTable = () => {
        useEffect(() => {
            const fetchData = async () => {
                try {
                    const response = await fetch('http://crmapi.devcir.co/api/sales_agents');
                    const data = await response.json();
                    console.log(data);
                    setDemoData(data);
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            };
            fetchData();
        }, []);
        const filteredData = demoData.filter(team => {
            const teamStartDate = new Date(team.start_date);
            const teamMonth = teamStartDate.toLocaleString('default', { month: 'short', year: 'numeric' });
            const monthMatch = selectedMonth == 'All Agents' || teamMonth == selectedMonth;
            const teamMatch = selectedTeamName == 'All Teams' || team.team.team_name == selectedTeamName;
            return monthMatch && teamMatch;
        });
        const indexOfLastAgent = currentPage * agentsPerPage;
        const indexOfFirstAgent = indexOfLastAgent - agentsPerPage;
        const currentAgents = filteredData.slice(indexOfFirstAgent, indexOfLastAgent);
        const paginate = (pageNumber) => setCurrentPage(pageNumber);
        return (
            <>
                <h1 className='font-[500] leading-[33px] text-[22px] text-[#269F8B] flex justify-between items-center'>
                    <div className='flex items-center w-1/2 '>
                        Current Month
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className='[box-shadow:0px_4px_4px_0px_#40908417] cursor-pointer w-[26%] ml-6 rounded-[6px] outline-none focus:outline-none bg-white p-2 text-[15px] font-[500] border-none h-[45px]  text-center'
                        >
                            {monthOptions.map((option, index) => (
                                <option key={index} value={option} >{option}</option>
                            ))}
                        </select>
                    </div>
                    <button onClick={handleStoreCSV} className='bg-themeGreen w-[150px] p-2 h-full rounded-[10px] text-white tracking-[1%] font-[500] text-[15px]'>
                        Export Agents   <FontAwesomeIcon icon={faDownload} className='ml-2' />
                    </button>
                </h1>
                <div className='flex flex-wrap items-center gap-[10px] justify-between lg:justify-start'>
                    <div className='cursor-pointer' onClick={() => setSelectedTeamName('All Teams')}>
                        <p className={`w-[100px] h-[34px] flex items-center justify-center text-[14px] leading-[21px] rounded-[10px] ${selectedTeamName == 'All Teams' ? "bg-themeGreen text-white font-[600]" : "bg-lGreen text-black font-[400]"}`}>All Teams</p>
                    </div>
                    {[...new Set(teams.map(team => team.team_name))].map((teamName, index) => (
                        <div key={index} className='cursor-pointer' onClick={() => setSelectedTeamName(teamName)}>
                            <p className={`${selectedTeamName == teamName ? "bg-themeGreen text-white font-[600]" : "bg-lGreen text-black font-[400]"} w-[100px] h-[34px] flex items-center justify-center text-[14px] leading-[21px] rounded-[10px]`}>{teamName}</p>
                        </div>
                    ))}
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-[14px] bg-white">
                        <thead className="text-themeGreen h-[30px]">
                            <tr className="flex flex-row items-center justify-between w-full text-center custom flex-nowrap">
                                <th className="px-[10px] font-[500] w-[42px]"></th>
                                <th className="px-[10px] font-[500] w-[84px]">Name</th>
                                <th className="px-[10px] font-[500] w-[84px]">Surname</th>
                                <th className="px-[5px] font-[500]">Campaign</th>
                                <th className="px-[10px] font-[500] w-[84px]">Team</th>
                                <th className="font-[500] w-[104px]">Team Leader</th>
                                <th className="font-[500] w-[84px]">Commission</th>
                                <th className="font-[500] w-[44px]">KPIs</th>
                                <th className="px-[10px] font-[500] w-[84px]">Gatekeeper</th>
                                <th className="px-[10px] font-[500] w-[71px]"></th>
                            </tr>
                        </thead>
                        <tbody className='font-[400] bg-white'>
                            {/* {filteredData.map((team, index) => { */}
                            {currentAgents.map((team, index) => {
                                console.log("Data to be Parsed : ", team)
                                const parsedKpiData = team.kpi_data ? JSON.parse(team.kpi_data) : "";
                                console.log("-------------", parsedKpiData)
                                console.log("----- Selected Dial KPI Value-----",selectedDialOptions)
                                let hasGatekeeperValue = false;
                                if (parsedKpiData) {
                                    const hasGatekeeperValueInKpiData = parsedKpiData.kpiData && parsedKpiData.kpiData.some(kpi => kpi.gatekeeper);
                                    const hasGatekeeperValueInCustomKpiData = parsedKpiData.customKpiData && parsedKpiData.customKpiData.some(kpi => kpi.Custom_Gatekeeper);
                                    hasGatekeeperValue = hasGatekeeperValueInKpiData || hasGatekeeperValueInCustomKpiData;
                                }
                                return (
                                    <React.Fragment key={index}>
                                        <tr className="bg-[#F8FEFD] my-[8px] text-center custom w-full flex flex-row flex-nowrap justify-between items-center">
                                            <td className="px-[10px]">
                                                <img src={team.image_path} className='w-[40px] h-[40px] rounded-full m-auto' alt="" />
                                            </td>
                                            <td className="px-[10px] w-[91px]">
                                                <p>{team.name}</p>
                                            </td>
                                            <td className="px-[10px] w-[91px]">
                                                <p>{team.surname}</p>
                                            </td>
                                            <td className="px-[10px] w-[91px]">
                                                <p>{team.campaign_detail.name}</p>
                                            </td>
                                            <td className="px-[10px] w-[91px]">
                                                <p>{team.team.team_name}</p>
                                            </td>
                                            <td className="px-[10px] w-[91px]">
                                                <p>{team.leader.name}</p>
                                            </td>
                                            <td className="px-[10px] w-[91px]">
                                                <p>{`${parsedKpiData.teamInfo ? parsedKpiData.teamInfo.currency : ""} ${team.commission}`}</p>
                                            </td>
                                            <td className="w-[55px]">
                                                <p>{parsedKpiData ? parsedKpiData.TotalCount : 0}</p>
                                            </td>
                                            <td className="px-[10px] w-[91px]">
                                                <p>{hasGatekeeperValue ? 'Yes' : 'No'}</p>
                                            </td>
                                            {/* <td className="px-[10px] py-[10px] w-[76px]">
                                                <span className='mx-1 cursor-pointer' onClick={() => handleUpdate(team)}><img src="../images/edit.png" className='inline h-[18px] w-[18px]' alt="" /></span>
                                                <span className='cursor-pointer' onClick={() => handleDelete(team)}><img src="../images/delete.png" className='inline h-[18px] w-[18px]' alt="" /></span>
                                            </td> */}


                                          <td className="px-[10px] py-[10px] w-[76px]">
                                                <span className='mx-1 cursor-pointer' onClick={() => handleUpdate(team)}><img src="../images/edit.png" className='inline h-[18px] w-[18px]' alt="" /></span>
                                                <span className='cursor-pointer' onClick={() => {
                                                    const isConfirmed = window.confirm("Are you sure you want to Delete ?");
                                                    if (isConfirmed) {
                                                        handleDelete(team.id)
                                                    }
                                                }}><img src="../images/delete.png" className='inline h-[18px] w-[18px]' alt="" /></span>
                                               </td>
                                               
                                               
                                        </tr>
                                        {selectedRow && selectedRow.id == team.id && (
                                            <tr className="w-full">
                                                <td colSpan="10">
                                                    <div className="p-6 bg-white rounded-lg shadow-lg">
                                                        <h2 className="mb-4 text-lg font-bold">Update Data for {selectedRow.name}</h2>
                                                        <form>
                                                            {selectedRow.kpi_data && (
                                                                <>
                                                                    <h3 className="mt-4 font-bold">KPI Data</h3>
                                                                    {selectedRow.kpi_data.kpiData.map((customKpi, index) => (
                                                                        <div key={index} className="grid grid-cols-5 gap-4 mt-4">
                                                                            <div className='flex flex-col'>
                                                                                <label className='ml-10 text-xs font-bold'>KPI</label>
                                                                                <select
                                                                                    className={`bg-[#E9ECEB] placeholder-[#8fa59c] text-center border-none w-[119px] h-[30px] p-[3px] rounded-[6px] text-[10px] font-medium leading-[12px]`}
                                                                                    value={customKpi.kpi_Name_ID || ""}
                                                                                    onChange={(e) => {
                                                                                        const selectedOption = e.target.options[e.target.selectedIndex];
                                                                                        const selectedKpiName = selectedOption.text;
                                                                                        const selectedKpiId = selectedOption.value;
                                                                                        const updatedCustomKpiData = [...selectedRow.kpi_data.kpiData];
                                                                                        updatedCustomKpiData[index].kpi_Name = selectedKpiName;
                                                                                        updatedCustomKpiData[index].kpi_Name_ID = selectedKpiId;
                                                                                        setSelectedRow({
                                                                                            ...selectedRow,
                                                                                            kpi_data: {
                                                                                                ...selectedRow.kpi_data,
                                                                                                kpiData: updatedCustomKpiData
                                                                                            }
                                                                                        });
                                                                                    }}
                                                                                >
                                                                                    <option value="">Select KPI</option>
                                                                                    {kpis
                                                                                        .filter(
                                                                                            (kpiOption) =>
                                                                                                !selectedKpis[team.id]?.[kpiOption.id] ||
                                                                                                kpiOption.id.toString() == customKpi.kpi_Name_ID
                                                                                        )
                                                                                        .map((kpiOption) => (
                                                                                            <option key={kpiOption.id} value={kpiOption.id.toString()}>
                                                                                                {kpiOption.kpi_name}
                                                                                            </option>
                                                                                        ))}
                                                                                </select>
                                                                            </div>
                                                                            <div className='flex flex-col'>
                                                                                <label className='ml-8 text-xs font-bold'>Target</label>
                                                                                <input
                                                                                    type="number"
                                                                                    value={customKpi.target}
                                                                                    onChange={(e) => {
                                                                                        const updatedCustomKpiData = [...selectedRow.kpi_data.kpiData];
                                                                                        updatedCustomKpiData[index].target = e.target.value;
                                                                                        setSelectedRow({
                                                                                            ...selectedRow,
                                                                                            kpi_data: {
                                                                                                ...selectedRow.kpi_data,
                                                                                                kpiData: updatedCustomKpiData
                                                                                            }
                                                                                        });
                                                                                    }}
                                                                                    className="bg-[#E9ECEB] placeholder-[#8fa59c] text-center border-none w-[109px] h-[30px] p-[10px] rounded-[6px] text-[10px] font-medium leading-[15px]"
                                                                                />
                                                                            </div>
                                                                            <div className='flex flex-col'>
                                                                                <label className='ml-6 text-xs font-bold'>Weighting</label>
                                                                                <input
                                                                                    type="number"
                                                                                    value={customKpi.weighting}
                                                                                    onChange={(e) => {
                                                                                        const newValue = e.target.value;
                                                                                        if (newValue > 100) {
                                                                                            alert("Weightage should always be between 1 and 100 !!");
                                                                                            return;
                                                                                        }
                                                                                        const updatedCustomKpiData = [...selectedRow.kpi_data.kpiData];
                                                                                        updatedCustomKpiData[index].weighting = newValue;
                                                                                        setSelectedRow({
                                                                                            ...selectedRow,
                                                                                            kpi_data: {
                                                                                                ...selectedRow.kpi_data,
                                                                                                kpiData: updatedCustomKpiData
                                                                                            }
                                                                                        });
                                                                                    }}
                                                                                    className="bg-[#E9ECEB] placeholder-[#8fa59c] text-center border-none w-[109px] h-[30px] p-[10px] rounded-[6px] text-[10px] font-medium leading-[15px]"
                                                                                />
                                                                            </div>
                                                                            <div className='flex flex-col'>
                                                                                <label className='ml-3 text-xs font-bold'>Opportunity</label>
                                                                                <div className="relative w-[109px] h-[30px] bg-[#E9ECEB] rounded-[6px] text-center">
                                                                                    <span className="absolute left-7 top-1/2 transform -translate-y-1/2 text-[10px] font-medium leading-[15px] text-[#8fa59c]">
                                                                                        {selectedRow.kpi_data.teamInfo.currency || ""}
                                                                                    </span>
                                                                                    <input
                                                                                        type="text"
                                                                                        className="w-full h-full pl-10 pr-2 text-center bg-transparent border-none placeholder-[#8fa59c] text-[10px] font-medium leading-[15px]"
                                                                                        readOnly
                                                                                        value={(parseFloat(customKpi.weighting / 100) * (team.commission)).toFixed(2)}
                                                                                        onChange={(e) => {
                                                                                            const updatedCustomKpiData = [...selectedRow.kpi_data.kpiData];
                                                                                            updatedCustomKpiData[index].opportunity = e.target.value;
                                                                                            setSelectedRow({
                                                                                                ...selectedRow,
                                                                                                kpi_data: {
                                                                                                    ...selectedRow.kpi_data,
                                                                                                    kpiData: updatedCustomKpiData
                                                                                                }
                                                                                            });
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                            <div className='flex flex-col'>
                                                                                <label className='ml-4 text-xs font-bold'>Gatekeeper</label>
                                                                                <input
                                                                                    type="text"
                                                                                    value={customKpi.gatekeeper}
                                                                                    onChange={(e) => {
                                                                                        const updatedCustomKpiData = [...selectedRow.kpi_data.kpiData];
                                                                                        updatedCustomKpiData[index].gatekeeper = e.target.value;
                                                                                        setSelectedRow({
                                                                                            ...selectedRow,
                                                                                            kpi_data: {
                                                                                                ...selectedRow.kpi_data,
                                                                                                kpiData: updatedCustomKpiData
                                                                                            }
                                                                                        });
                                                                                    }}
                                                                                    className="bg-[#E9ECEB] placeholder-[#8fa59c] text-center border-none w-[109px] h-[30px] p-[10px] rounded-[6px] text-[10px] font-medium leading-[15px]"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                    {selectedRow.kpi_data.customKpiData.map((customKpi, index) => (
                                                                        <div key={index} className="grid grid-cols-5 gap-4 mt-4">
                                                                            <div className='flex flex-col'>
                                                                                <label className='text-[10px] font-bold ml-2'>Custom KPI Name</label>
                                                                                <select
                                                                                    value={customKpi.Custom_KPI_ID || ''}
                                                                                    onChange={(e) => handleCustomKpiChange(index, 'Custom_KPI_ID', e.target.value)}
                                                                                    className="bg-[#E9ECEB] placeholder-[#8fa59c] text-center border-none w-[119px] h-[30px] p-[10px] rounded-[6px] text-[10px] font-medium leading-[10px]"
                                                                                >
                                                                                    <option value="">Select KPI</option>
                                                                                    {kpis.map((kpi) => (
                                                                                        <option key={kpi.id} value={kpi.id}>
                                                                                            {kpi.kpi_name}
                                                                                        </option>
                                                                                    ))}
                                                                                </select>
                                                                            </div>
                                                                            <div className='flex flex-col'>
                                                                                <label className='text-[10px] font-bold ml-3'>Custom Target</label>
                                                                                <input
                                                                                    type="number"
                                                                                    value={customKpi.Custom_Target}
                                                                                    onChange={(e) => {
                                                                                        const updatedCustomKpiData = [...selectedRow.kpi_data.customKpiData];
                                                                                        updatedCustomKpiData[index].Custom_Target = e.target.value;
                                                                                        setSelectedRow({
                                                                                            ...selectedRow,
                                                                                            kpi_data: {
                                                                                                ...selectedRow.kpi_data,
                                                                                                customKpiData: updatedCustomKpiData
                                                                                            }
                                                                                        });
                                                                                    }}
                                                                                    className="bg-[#E9ECEB] placeholder-[#8fa59c] text-center border-none w-[109px] h-[30px] p-[10px] rounded-[6px] text-[10px] font-medium leading-[15px]"
                                                                                />
                                                                            </div>
                                                                            <div className='flex flex-col'>
                                                                                <label className='text-[10px] font-bold ml-1'>Custom Weighting</label>
                                                                                <input
                                                                                    type="number"
                                                                                    value={customKpi.Custom_Weighting}
                                                                                    onChange={(e) => {
                                                                                        const value = parseInt(e.target.value);
                                                                                        if (value > 100) {
                                                                                            alert('Weightage should always be between 1 and 100 !!');
                                                                                            return;
                                                                                        }
                                                                                        const updatedCustomKpiData = [...selectedRow.kpi_data.customKpiData];
                                                                                        updatedCustomKpiData[index].Custom_Weighting = value;
                                                                                        setSelectedRow({
                                                                                            ...selectedRow,
                                                                                            kpi_data: {
                                                                                                ...selectedRow.kpi_data,
                                                                                                customKpiData: updatedCustomKpiData
                                                                                            }
                                                                                        });
                                                                                    }}
                                                                                    className="bg-[#E9ECEB] placeholder-[#8fa59c] text-center border-none w-[109px] h-[30px] p-[10px] rounded-[6px] text-[10px] font-medium leading-[15px]"
                                                                                />
                                                                            </div>
                                                                            <div className='flex flex-col'>
                                                                                <label className='text-[10px] font-bold ml-5'>Opportunity</label>
                                                                                <div className="relative w-[109px] h-[30px] bg-[#E9ECEB] rounded-[6px] text-center">
                                                                                    <span className="absolute left-7 top-1/2 transform -translate-y-1/2 text-[10px] font-medium leading-[15px] text-[#8fa59c]">
                                                                                        {selectedRow.kpi_data.teamInfo.currency || ""}
                                                                                    </span>
                                                                                    <input
                                                                                        type="text"
                                                                                        className="w-full h-full pl-10 pr-2 text-center bg-transparent border-none placeholder-[#8fa59c] text-[10px] font-medium leading-[15px]"
                                                                                        readOnly
                                                                                        value={parseFloat((customKpi.Custom_Weighting / 100) * (team.commission)).toFixed(2)}
                                                                                        onChange={(e) => {
                                                                                            const updatedCustomKpiData = [...selectedRow.kpi_data.customKpiData];
                                                                                            updatedCustomKpiData[index].Custom_Opportunity = e.target.value;
                                                                                            setSelectedRow({
                                                                                                ...selectedRow,
                                                                                                kpi_data: {
                                                                                                    ...selectedRow.kpi_data,
                                                                                                    customKpiData: updatedCustomKpiData
                                                                                                }
                                                                                            });
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                            <div className='flex flex-col'>
                                                                                <label className='text-[10px] font-bold'>Custom Gatekeeper</label>
                                                                                <input
                                                                                    type="text"
                                                                                    value={customKpi.Custom_Gatekeeper}
                                                                                    onChange={(e) => {
                                                                                        const updatedCustomKpiData = [...selectedRow.kpi_data.customKpiData];
                                                                                        updatedCustomKpiData[index].Custom_Gatekeeper = e.target.value;
                                                                                        setSelectedRow({
                                                                                            ...selectedRow,
                                                                                            kpi_data: {
                                                                                                ...selectedRow.kpi_data,
                                                                                                customKpiData: updatedCustomKpiData
                                                                                            }
                                                                                        });
                                                                                    }}
                                                                                    className="bg-[#E9ECEB] placeholder-[#8fa59c] text-center border-none w-[109px] h-[30px] p-[10px] rounded-[6px] text-[10px] font-medium leading-[15px]"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </>
                                                            )}
                                                            <div className="flex justify-end mt-4">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setSelectedRow(null)}
                                                                    className="px-4 py-2 mr-2 text-white bg-red-500 rounded-lg"
                                                                >
                                                                    Cancel
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleSaveKpi(selectedRow, team)}
                                                                    className="px-4 py-2 text-white bg-green-500 rounded-lg"
                                                                >
                                                                    Save
                                                                </button>
                                                            </div>
                                                        </form>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-end mt-4">
                    {Array.from({ length: Math.ceil(filteredData.length / agentsPerPage) }, (_, i) => (
                        <button
                            key={i}
                            onClick={() => paginate(i + 1)}
                            className={`px-4 py-2 mx-1 text-sm font-medium ${currentPage == i + 1 ? 'bg-[#1E8675] text-white ' : 'bg-[#F8FDFC] text-[#072D20]'
                                } rounded-md`}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage == 1}
                        className="px-3 py-1 mr-2 text-sm font-medium text-[#072D20] rounded-md bg-[#F8FDFC]"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredData.length / agentsPerPage)))}
                        disabled={currentPage == Math.ceil(filteredData.length / agentsPerPage)}
                        className="px-3 py-1 ml-2 text-sm font-medium text-[#072D20] rounded-md bg-[#F8FDFC]"
                    >
                        Next
                    </button>
                </div>
            </>
        );
    };

    

// ---------------------------------------------- Select Boxes Dial -------------------------------------//

const [kpisWithSelectionBox, setKpisWithSelectionBox] = useState({});
// const [selectedDialOption, setSelectedDialOption] = useState('');
const [selectedDialOptions, setSelectedDialOptions] = useState({});

const handleDialsValueChange = (teamId, index, value) => {
    setSelectedDialOptions(prev => ({
      ...prev,
      [`${teamId}-${index}`]: value
    }));
  };

    
    return (
        <div className='mx-2'>
            <Navbar />
            <div className='flex gap-3'>
                <SideBar />
                <div className='w-full mt-8 md:ml-12 mr-5 flex flex-col gap-[32px] mb-4'>
                    <h1 className='text-[28px] leading-[42px] text-[#555555] font-[500] -mb-6'>Commission</h1>
                    <div className='flex flex-col w-full gap-6 p-8 pb-12 card' id='currentTeamLeaders'>
                        {renderTable()}
                    </div>
                    <div className='flex flex-col w-full gap-6 p-8 pb-12 card'>
                        <div>
                            <h1 className='font-[500] leading-[33px] text-[22px] text-[#269F8B]'>Targets and Commission <span className='font-[600] text-[14px] leading-[21px] text-[#666666] ml-[14px]'>Sales Agent</span> </h1>
                            <div className='flex flex-row flex-wrap justify-end w-full'>
                                {campaigns.map((campaign, index) => (
                                    <img
                                        src={campaign.company_logo}
                                        key={index}
                                        className={`${campaign == selectedCampaign ? "" : "opacity-40"} w-[40px] h-[40px] mx-3 cursor-pointer`}
                                        onClick={() => handleCampaignClick(campaign)}
                                    />
                                ))}
                            </div>
                        </div>
                        {filteredTeams.map((team, index) => (
                            <div key={index} onClick={() => handleTeamClick(team)} >
                                <div className='flex items-center justify-between w-full'>
                                    <div className='h-[110px] gap-[26px] flex  justify-between items-center'>
                                        <div className='w-[142px] h-[82px] mt-[26px]'>
                                            <label htmlFor={`team-${index}`} className='text-[14px] font-normal leading-[21px] text-left'>Team</label>
                                            <div className="border-[1px] border-lGreen rounded-[6px] bg-white p-2 text-[14px] font-[500] h-[45px] flex items-center">
                                                <input
                                                    type="text"
                                                    id={`team-${index}`}
                                                    value={team.team_name}
                                                    readOnly
                                                    className="[box-shadow:0px_4px_4px_0px_#40908417] cursor-pointer w-full rounded-[6px] bg-white p-2 text-[14px] font-[500] border-none h-[45px]"
                                                />
                                            </div>
                                        </div>
                                        <div className='w-[156px] h-[82px] mt-6'>
                                            <label htmlFor="month" className='text-[14px] font-normal leading-[21px] text-left'>Month</label>
                                            <select
                                                id="month"
                                                value={teamData[team.id]?.month || ""}
                                                onChange={(e) => handleSelectChange(team.id, 'month', e.target.value)}
                                                className="[box-shadow:0px_4px_4px_0px_#40908417] cursor-pointer w-full rounded-[6px] bg-white p-2 text-[14px] font-[500] border-none h-[45px]"
                                            >
                                                <option value="">Select a month</option>
                                                <option value="January">January</option>
                                                <option value="February">February</option>
                                                <option value="March">March</option>
                                                <option value="April">April</option>
                                                <option value="May">May</option>
                                                <option value="June">June</option>
                                                <option value="July">July</option>
                                                <option value="August">August</option>
                                                <option value="September">September</option>
                                                <option value="October">October</option>
                                                <option value="November">November</option>
                                                <option value="December">December</option>
                                            </select>
                                        </div>
                                        <div className='w-[170px] h-[82px] flex-col flex mt-[30px]'>
                                            <label htmlFor="frequency" className='text-[14px] font-normal leading-[21px] text-left'>Frequency</label>
                                            <select
                                                id="frequency"
                                                className="[box-shadow:0px_4px_4px_0px_#40908417] cursor-pointer w-full rounded-[6px] bg-white p-2 text-[14px]  font-[500] border-none h-[45px]"
                                                value={teamData[team.id]?.frequency || ""}
                                                onChange={(e) => handleSelectChange(team.id, 'frequency', e.target.value)}
                                            >
                                                <option value="" disabled>
                                                    Select Frequency
                                                </option>
                                                <option value="Weekly">
                                                    Weekly
                                                </option>
                                                <option value="Monthly">
                                                    Monthly
                                                </option>
                                                <option value="Quarterly">
                                                    Quarterly
                                                </option>
                                            </select>
                                        </div>
                                        <div className='relative w-[144px]  h-[82px] flex-col flex mt-[30px]'>
                                            <label htmlFor="Opportunity" className='text-[14px] font-normal leading-[21px] text-left'>Opportunity</label>
                                            <select
                                                className='absolute  mt-[23px] left-0 bg-transparent border-none  text-[14px] font-[500] h-[45px] cursor-pointer'
                                                value={teamData[team.id]?.currency || ""}
                                                onChange={(e) => handleSelectChange(team.id, 'currency', e.target.value)}
                                                style={{ appearance: 'none' }}
                                            >
                                                {currencies.map((cur) => (
                                                    <option key={cur} value={cur}>
                                                        {cur}
                                                    </option>
                                                ))}
                                            </select>
                                            <input type="text"
                                                id='Opportunity'
                                                className='w-full bg-[#F5FBFA] rounded-[6px] pl-16 placeholder:pl-2 p-2 text-[14px] placeholder-[#8fa59c] font-[500] border-none h-[45px]'
                                                placeholder='1000'
                                                value={teamData[team.id]?.opportunity || ""}
                                                onChange={(e) => handleSelectChange1(team.id, 'opportunity', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className='w-[261px] h-[36px] flex justify-between'>
                                        <button className='bg-themeGreen w-[106px] h-full rounded-[10px] text-white tracking-[1%] font-[500] text-[16px]' onClick={() => handleSave(team.id)}>
                                            Save
                                        </button>
                                    </div>
                                </div>
                                {kpiTableVisible[team.id] && kpisInTable > 0 && (
                                    <div className='pb-4 mt-4 [box-shadow:0px_4px_4px_0px_#40908417] rounded-[10px] '>
                                        <table className="table w-full">
                                            <thead>
                                                <tr className='text-xs '>
                                                    <th className="p-2 border-b-2 border-r-2 border-[#dbd9d9] border-dashed text-[#1E8675] text-md font-semibold">KPI</th>
                                                    <th className="p-2 border-b-2 border-r-2 border-[#dbd9d9] border-dashed text-[#1E8675] text-md font-semibold ">Target</th>
                                                    <th className="p-2 border-b-2 border-r-2 border-[#dbd9d9] border-dashed text-[#1E8675] text-md font-semibold">Weighting</th>
                                                    <th className="p-2 border-b-2 border-r-2 border-[#dbd9d9] border-dashed text-[#1E8675] text-md font-semibold">Opportunity</th>
                                                    <th className="p-2 border-b-2 border-[#dbd9d9] border-dashed text-[#1E8675] text-md font-semibold">Gatekeeper</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {teamKpiData[team.id] && teamKpiData[team.id].map((kpi, index) => (
                                                  
                                                  <tr key={index} className='text-center '>
                                                    
                                                 <td className='pt-4 border-r-2 border-[#dbd9d9] border-dashed'>
                                                    <div className="flex items-center justify-center">
                                                        {/* <select
                                                            className={`bg-[#E9ECEB] placeholder-[#8fa59c] justify-center text-center border-none w-[109px] h-[30px] p-[3px] rounded-[6px] text-[10px] font-medium leading-[15px] mr-2`}
                                                            value={kpi.kpi_Name_ID || ''}
                                                            onChange={(event) => handleKpiChange(event, team.id, index)}
                                                        >
                                                            <option value="">Select KPI</option>
                                                            {kpis
                                                                .filter(kpiOption => !selectedKpis[team.id]?.[kpiOption.id] || kpiOption.id.toString() == kpi.kpi_Name_ID)
                                                                .map((kpiOption) => (
                                                                    <option key={kpiOption.id} value={kpiOption.id.toString()}>
                                                                        {kpiOption.kpi_name}
                                                                    </option>
                                                                ))}
                                                        </select> */}



<select 
  className={`bg-[#E9ECEB] placeholder-[#8fa59c] justify-center text-center border-none w-[109px] h-[30px] p-[3px] rounded-[6px] text-[10px] font-medium leading-[15px] mr-2`} 
  value={kpi.kpi_Name_ID || ''} 
  onChange={(event) => handleKpiChange(event, team.id, index)}
>
  <option value="">Select KPI</option>
  {kpis
    .filter(kpiOption => !selectedKpis[team.id]?.[kpiOption.id] || kpiOption.id.toString() == kpi.kpi_Name_ID)
    .map((kpiOption) => (
      <option key={kpiOption.id} value={kpiOption.id.toString()}>
        {kpiOption.kpi_name}
      </option>
    ))
  }
</select>
                                                
                                            
                                                         {kpisWithSelectionBox[`${team.id}-${index}`] && (
                                                        <select
                                                          className="bg-[#E9ECEB] placeholder-[#8fa59c] text-center border-none w-[120px] h-[30px] rounded-[6px] text-[10px] font-medium leading-[15px] "
                                                          value={selectedDialOptions[`${team.id}-${index}`] || ""}
                                                          onChange={(e) => handleDialsValueChange(team.id, index, e.target.value)}
                                                        >
                                                          <option value="" disabled>Select value</option> 
                                                          <option value="Day">Day</option>
                                                          <option value="Week">Week</option>
                                                          <option value="Month">Month</option>
                                                        </select>
                                                      )}
                                                    </div>
                                                </td>
                                                        <td className='pt-4 border-r-2 border-[#dbd9d9] border-dashed'>
                                                            <input
                                                                type="text"
                                                                className={`bg-[#E9ECEB] placeholder-[#8fa59c] text-center border-none w-[109px] h-[30px] p-[10px] rounded-[6px] text-[10px] font-medium leading-[15px]`}
                                                                value={kpi.target}
                                                                placeholder="Enter Target"
                                                                onChange={(e) => handleInputChange(team.id, index, 'target', e.target.value)}
                                                            />
                                                          
                                                          {kpisWithSelectionBox[`${team.id}-${index}`] && selectedDialOptions[`${team.id}-${index}`] && (
                                                             <span className="ml-2 text-[10px] font-medium">
                                                               / {selectedDialOptions[`${team.id}-${index}`]}
                                                             </span>
                                                           )}
                                                          
                                                        </td>
                                                        <td className='border-r-2 pt-4 border-[#dbd9d9] border-dashed'>
                                                            <div className="relative">
                                                                <input
                                                                    type="text"
                                                                    className={`bg-[#E9ECEB] placeholder-[#8fa59c] text-center border-none w-[109px] h-[30px] p-[10px] rounded-[6px] text-[10px] font-medium leading-[15px]`}
                                                                    value={kpi.weighting}
                                                                    placeholder="Enter Weighting"
                                                                    onChange={(event) => handle_Add_KPI_Weighting_Change(selectedTeam.id, index, 'weighting', event.target.value)}
                                                                />
                                                                {kpi.weighting && (
                                                                    <span className="absolute right-[90px] top-1/2 transform -translate-y-1/2 text-[#8fa59c] text-[10px] font-medium pointer-events-none">%</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className='pt-4 border-r-2 border-[#dbd9d9] border-dashed '>
                                                            <input
                                                                type="text"
                                                                className={`bg-[#E9ECEB] placeholder-[#8fa59c] text-center border-none w-[109px] h-[30px] p-[10px] rounded-[6px] text-[10px] font-medium leading-[15px]`}
                                                                placeholder="Enter Opportunity"
                                                                onChange={(e) => handleInputChange(team.id, index, 'opportunity', e.target.value)}
                                                                readOnly
                                                                // value={parseFloat(((kpi.weighting / 100) * (teamData[team.id]?.opportunity || 0)).toFixed(2))}
                                                                value={`${teamData[team.id]?.currency || "$"} ${parseFloat(((kpi.weighting / 100) * (teamData[team.id]?.opportunity || 0)).toFixed(2))}`}
                                                            />
                                                        </td>
                                                        <td className='pt-4'>
                                                            <input
                                                                type="text"
                                                                className={`bg-[#E9ECEB] placeholder-[#8fa59c] text-center border-none w-[109px] h-[30px] p-[10px] rounded-[6px] text-[10px] font-medium leading-[15px]`}
                                                                value={kpi.gatekeeper}
                                                                onChange={(e) => handleInputChange(team.id, index, 'gatekeeper', e.target.value)}
                                                                placeholder='N/A'
                                                                disabled={gatekeeperSet[team.id] && !kpi.gatekeeper}
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}


{/* {kpisWithSelectionBox[`${team.id}-${index}`] && (
                <tr>
                    <td colSpan="5" className="pt-2 text-center">
                        <select className="bg-[#E9ECEB] placeholder-[#8fa59c] text-center border-none w-[109px] h-[30px] p-[3px] rounded-[6px] text-[10px] font-medium leading-[15px]">
                            <option>Day</option>
                            <option>Hour</option>
                            <option>Week</option>
                        </select>
                    </td>
                </tr>
            )} */}

                                                
                                                {customKpiData[team.id] && customKpiData[team.id].map((customKpi, index) => (
                                                    <tr key={`custom-${team.id}-${index}`} className='text-center'>
                                                        <td className='pt-4 border-r-2 border-[#dbd9d9] border-dashed '>
                                                            <input
                                                                type="text"
                                                                className={`bg-[#E9ECEB] placeholder-[#8fa59c] text-center border-none w-[109px] h-[30px] p-[10px] rounded-[6px] text-[10px] font-medium leading-[15px]`}
                                                                value={customKpi.Custom_KPI_Name}
                                                                placeholder="Custom KPI Name"
                                                                onChange={(e) => handleCustomKpiInputChange(team.id, index, 'Custom_KPI_Name', e.target.value)}
                                                            />
                                                        </td>
                                                        <td className='pt-4 border-r-2 border-[#dbd9d9] border-dashed'>
                                                            <input
                                                                type="text"
                                                                className={`bg-[#E9ECEB] placeholder-[#8fa59c] text-center border-none w-[109px] h-[30px] p-[10px] rounded-[6px] text-[10px] font-medium leading-[15px]`}
                                                                value={customKpi.Custom_Target}
                                                                placeholder="Custom Target"
                                                                onChange={(e) => handleCustomKpiInputChange(team.id, index, 'Custom_Target', e.target.value)}
                                                            />
                                                        </td>
                                                        <td className='pt-4 border-r-2 border-[#dbd9d9] border-dashed'>
                                                            <div className="relative">
                                                                <input
                                                                    type="text"
                                                                    className={`bg-[#E9ECEB] placeholder-[#8fa59c] text-center border-none w-[109px] h-[30px] p-[7px] rounded-[6px] text-[10px] font-medium leading-[15px]`}
                                                                    value={customKpi.Custom_Weighting}
                                                                    placeholder="Custom Weighting"
                                                                    onChange={(e) => handle_Custom_KPI_Weighting(team.id, index, 'Custom_Weighting', e.target.value)}
                                                                />
                                                                {customKpi.Custom_Weighting && (
                                                                    <span className="absolute right-[90px] top-1/2 transform -translate-y-1/2 text-[#8fa59c] text-[10px] font-medium pointer-events-none">%</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className='pt-4 border-r-2 border-[#dbd9d9] border-dashed'>
                                                            <input
                                                                type="text"
                                                                className={`bg-[#E9ECEB] placeholder-[#8fa59c] text-center border-none w-[109px] h-[30px] p-[10px] rounded-[6px] text-[10px] font-medium leading-[15px]`}
                                                                value={`${teamData[team.id]?.currency || "$"} ${customKpi.Custom_Opportunity}`}
                                                                placeholder="Custom Opportunity"
                                                                readOnly
                                                            />
                                                        </td>
                                                        <td className='pt-4'>
                                                            <input
                                                                type="text"
                                                                className={`bg-[#E9ECEB] placeholder-[#8fa59c] text-center border-none w-[109px] h-[30px] p-[10px] rounded-[6px] text-[10px] font-medium leading-[15px]`}
                                                                value={customKpi.Custom_Gatekeeper}
                                                                placeholder="Custom Gatekeeper"
                                                                onChange={(e) => handleCustomKpiInputChange(team.id, index, 'Custom_Gatekeeper', e.target.value)}
                                                                disabled={gatekeeperSet[team.id] && !customKpi.Custom_Gatekeeper}
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                                <div className='flex justify-end w-full mt-6'>
                                    <button
                                        className=' tracking-[1%] [box-shadow:0px_4px_4px_0px_#40908417] bg-white flex justify-center items-center h-[50px] w-[157px] rounded-[10px] gap-[10px] text-black font-[600] text-[14px]'
                                        onClick={() => handleAddCustomKPI(team.id)}
                                    >
                                        <Plus className='text-[#1E8675]' /> Add KPI
                                    </button>
                                    <button
                                        className='tracking-[1%] [box-shadow:0px_4px_4px_0px_#40908417] bg-white text-black flex justify-center items-center h-[50px] w-[200px] rounded-[10px] gap-[10px]  font-[600] text-[14px] ml-4'
                                        onClick={() => handleAddCustomKpiRow(team.id)}
                                    >
                                        <img src={logo} className='w-6 h-6' />Add Custom KPI
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};
export default Commission;