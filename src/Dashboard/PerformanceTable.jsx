import React, { useState, useEffect } from 'react';
import 'react-circular-progressbar/dist/styles.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRotateRight } from '@fortawesome/free-solid-svg-icons';
import RevenueTable from './RevenueTable';
import { toast } from 'react-toastify';
import UnitsTable from './UnitsTable';
import ConversionTable from './ConversionTable';
import DialsTable from './DialsTable';
import ProductivityTable from './ProductivityTable';

const PerformanceTable = () => {
    const [performanceData, setPerformanceData] = useState([]);
    const [localStorageData, setLocalStorageData] = useState([]);
    const [currentDataIndex, setCurrentDataIndex] = useState(0);
    const [view, setView] = useState('all');


    // Function to fetch data from localStorage
    const fetchLocal = () => {
        const extractedTableData = localStorage.getItem('tableData1');
        if (extractedTableData) {
            const parsedData = JSON.parse(extractedTableData);
            setLocalStorageData(parsedData);
            console.log("Data fetched from localStorage:", parsedData);
        }
    };


    // Use useEffect to set up the listener on mount
    useEffect(() => {
        fetchLocal();
        const handleStorageChange = (event) => {
            if (event.key === 'tableData1') {
                fetchLocal(); // Fetch updated data when localStorage changes
            }
        };
        window.addEventListener('storage', handleStorageChange);
        // Clean up the event listener on unmount
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    useEffect(() => {
        const fetchSalesAgent = async () => {
            const id = localStorage.getItem('id');
            fetchLocal()
            try {
                const agentsResponse = await fetch(`http://127.0.0.1:8000/api/sales_agents/${id}`);
                if (!agentsResponse.ok) {
                    throw new Error(`Failed to fetch sales agent`);
                }
                const agentsData = await agentsResponse.json();
                console.log("Selected Agent Data: ", agentsData)
                // Parse the KPI data from the first agent
                const firstAgent = agentsData;
                console.log("First Agent: ", firstAgent)
                if (firstAgent) {
                    const kpiDataParsed = JSON.parse(firstAgent.kpi_data);
                    console.log("Data is here: ", kpiDataParsed)

                    const transformedKpiData = kpiDataParsed.kpiData.map(kpi => ({
                        kpi: kpi.kpi_Name,
                        target: kpi.target,
                        actual: '-',
                        percentToTarget: '-',
                        currency: kpiDataParsed.teamInfo.currency,
                        commission: kpi.opportunity.toFixed(2),
                        gatekeeper: kpi.gatekeeperTarget !== '-' && kpi.gatekeeperTarget !== 'N/A' ? 'YES' : 'N/A',
                        gatekeeperTarget: kpi.gatekeeper || '-',
                    }));
                    console.log("----Transformed Data---", transformedKpiData)
                    console.log("kpi datatata: ", kpiDataParsed);
                    setPerformanceData(transformedKpiData);
                    // Settng Index to Initial VALUE 0
                    setCurrentDataIndex(0);
                }
                else {
                    console.log("Error nhi hai data hi nhi hai")
                }
            } catch (error) {
                toast.error("Error Fetching Sales Agent Data")
            }
        }

        fetchSalesAgent()
    }, []);


    const handleReload = () => {
        console.log("Reloaded Local")
        fetchLocal()
    }

    const getPercentColor = (percent) => {
        const numPercent = parseInt(percent);
        if (isNaN(numPercent)) return 'bg-[#fff1f0] text-[#EC706F]';
        if (numPercent >= 100) return 'bg-[#effff4] text-[#269F8B]';
        if (numPercent >= 80) return 'bg-[#fffdd4] text-[#A9A548]';
        return 'bg-red-200 text-red-800';
    };

    const handleViewChange = (newView) => {
        setView(newView);
    };

    return (
        <div className='mx-2 w-full'>
            <div className='flex gap-3'>
                <div className='w-full mt-8 md:ml-12 mr-5 flex flex-col gap-[32px] mb-4'>
                    <div className='flex flex-col w-full gap-6 p-8 pb-12 card white'>
                        <div className='flex flex-col'>
                            <div className='flex justify-between items-center mb-4'>
                                <h1 className='font-[500] leading-[33px] text-[22px] text-[#269F8B]'>Campaign Performance</h1>
                                <div className="flex">
                                    <button
                                        className={`px-6 py-1 text-sm font-medium ${view === 'all' ? 'text-[#269F8B] shadow-lg' : 'text-[#ABABAB]'
                                            } border border-gray-300 bg-white rounded-l`}
                                        onClick={() => handleViewChange('all')}
                                    >
                                        All
                                    </button>
                                    <button
                                        className={`px-3 py-1 text-sm font-medium ${view === 'revenue' ? 'text-[#269F8B] shadow-lg' : 'text-[#ABABAB]'
                                            } border-t border-b border-r border-gray-300 bg-white`}
                                        onClick={() => handleViewChange('revenue')}
                                    >
                                        Revenue
                                    </button>
                                    <button
                                        className={`px-3 py-1 text-sm font-medium ${view === 'units' ? 'text-[#269F8B] shadow-lg' : 'text-[#ABABAB]'
                                            } border-t border-b border-r border-gray-300 bg-white`}
                                        onClick={() => handleViewChange('units')}
                                    >
                                        Units
                                    </button>
                                    <button
                                        className={`px-3 py-1 text-sm font-medium ${view === 'conversion' ? 'text-[#269F8B] shadow-lg' : 'text-[#ABABAB]'
                                            } border-t border-b border-r border-gray-300 bg-white`}
                                        onClick={() => handleViewChange('conversion')}
                                    >
                                        Conversion
                                    </button>
                                    <button
                                        className={`px-3 py-1 text-sm font-medium ${view === 'dials' ? 'text-[#269F8B] shadow-lg' : 'text-[#ABABAB]'
                                            } border-t border-b border-r border-gray-300 bg-white`}
                                        onClick={() => handleViewChange('dials')}
                                    >
                                        Dials
                                    </button>
                                    <button
                                        className={`px-3 py-1 text-sm font-medium ${view === 'productivity' ? 'text-[#269F8B] shadow-lg' : 'text-[#ABABAB]'
                                            } border-t border-b border-r border-gray-300 bg-white`}
                                        onClick={() => handleViewChange('productivity')}
                                    >
                                        Productivity
                                    </button>
                                </div>

                            </div>
                            {/* Loader */}
                            {view === 'all' && (
                                <div className='flex justify-end'>
                                    <div>
                                        <FontAwesomeIcon icon={faArrowRotateRight} onClick={handleReload} className='text-2xl mt-[-6px] text-themeGreen pt-4 hover:cursor-pointer hover:transition-all hover:scale-110 hover:duration-300' />
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Performance Table */}
                        {view === 'all' && (
                            <div className='bg-white rounded-lg shadow-sm overflow-hidden border-2 border-gray-100'>
                                <div className='p-6'>
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
                                                performanceData.map((row, index) => {
                                                    // Calculate actual value based on KPI type
                                                    let actualValue = '-';
                                                    if (localStorageData.length > 0) {
                                                        if (row.kpi === 'Conversion') {
                                                            // Find Sales Volume and Call Volume values
                                                            const salesVolumeIndex = performanceData.findIndex(item => item.kpi === 'Sales Volume');
                                                            const callVolumeIndex = performanceData.findIndex(item => item.kpi === 'Call volume');

                                                            if (salesVolumeIndex !== -1 && callVolumeIndex !== -1) {
                                                                const salesVolume = localStorageData.slice(currentDataIndex).reduce(
                                                                    (total, data) => total + parseFloat(data.values[salesVolumeIndex] || 0),
                                                                    0
                                                                );
                                                                const callVolume = localStorageData.slice(currentDataIndex).reduce(
                                                                    (total, data) => total + parseFloat(data.values[callVolumeIndex] || 0),
                                                                    0
                                                                );

                                                                actualValue = callVolume > 0 ?
                                                                    (salesVolume / callVolume * 100).toFixed(1) : '0.0';
                                                            }
                                                        } else {
                                                            actualValue = localStorageData.slice(currentDataIndex).reduce(
                                                                (total, data) => total + parseFloat(data.values[index] || 0),
                                                                0
                                                            ).toFixed(1);
                                                        }
                                                    }

                                                    // Calculate percentage to target
                                                    let percentToTarget = '-';
                                                    if (actualValue !== '-' && row.target !== '-') {
                                                        percentToTarget = ((parseFloat(actualValue) / parseFloat(row.target)) * 100).toFixed(2);
                                                    }

                                                    return (
                                                        <tr key={index} className='text-sm'>
                                                            <td className='py-2 text-[#269F8B] font-medium'>{row.kpi}</td>
                                                            <td className='py-2 text-center'>{row.target}</td>
                                                            <td className="py-2 text-center">{actualValue}</td>
                                                            <td className='py-2 text-center'>
                                                                <span className={`px-6 py-1 ${getPercentColor(percentToTarget)}`}>
                                                                    {percentToTarget}&nbsp;&nbsp;%
                                                                </span>
                                                            </td>
                                                            <td className='py-2 text-center'>{row.currency}{row.commission}</td>
                                                            <td
                                                                className={`px-6 py-1 text-center ${row.gatekeeperTarget !== '-' && row.gatekeeperTarget !== 'N/A'
                                                                    ? 'text-black'
                                                                    : 'bg-gray-100'
                                                                    }`}
                                                            >
                                                                {row.gatekeeperTarget !== '-' && row.gatekeeperTarget !== 'N/A'
                                                                    ? 'YES'
                                                                    : 'N/A'}
                                                            </td>
                                                            <td className={`px-6 py-1 text-center`}>
                                                                <span className={`inline-block ${row.gatekeeperTarget == '-' ? 'bg-gray-100 w-12' : ''}`}>
                                                                    {row.gatekeeperTarget}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
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
                        )}
                        {view === 'revenue' && <RevenueTable />}
                        {view === 'units' && <UnitsTable />}
                        {view === 'conversion' && <ConversionTable />}
                        {view === 'dials' && <DialsTable />}
                        {view === 'productivity' && <ProductivityTable />}
                    </div >
                </div >
            </div >
        </div >
    );
};

export default PerformanceTable
