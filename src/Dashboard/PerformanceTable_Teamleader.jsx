import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import RevenueTable_TeamLeader from './RevenueTable_TeamLeader';
import UnitsTable from './UnitsTable';
import ConversionTable from './ConversionTable';
import DialsTable from './DialsTable';
import ProductivityTable from './ProductivityTable';

const PerformanceTable_Teamleader = () => {
    const [teamLeader, setTeamLeader] = useState(null);
    const [kpiData, setKpiData] = useState(null);
    const [aggregatedSums, setAggregatedSums] = useState([]);
    const [view, setView] = useState('all');
    const [currentPage, setCurrentPage] = useState(0);
    const [allTargets, setAllTargets] = useState(localStorage.getItem('TotalTargetAgents')?.split(',') || []);
    const kpis = [
        { id: 'revenue1', label: 'Average Monthly Revenue', tableType: 'revenue' },
        { id: 'revenue2', label: 'Total Revenue', tableType: 'totalrevenue' },
        { id: 'call-volume', label: 'Call Volume', tableType: 'units' },
        { id: 'sales-volume', label: 'Sales Volume', tableType: 'unitsSales' },
        { id: 'conversion', label: 'Conversion', tableType: 'conversion' },
        { id: 'handling-time', label: 'Average Handling Time', tableType: 'dials' },
        { id: 'product1', label: 'Attachment Rate Product 1', tableType: 'productivity' },
        { id: 'product2', label: 'Attachment Rate Product 2', tableType: 'productivity' },
        { id: 'product3', label: 'Attachment Rate Product 3', tableType: 'productivity' },
        { id: 'product4', label: 'Attachment Rate Product 4', tableType: 'productivity' },
        { id: 'qa', label: 'QA', tableType: 'productivity' }
    ];

    const itemsPerPage = 3;
    const totalPages = Math.ceil(kpis.length / itemsPerPage);

    useEffect(() => {
        const checkLocalStorage = () => {
            return localStorage.getItem("TeamId") !== null;
        };

        const waitForTeamId = () => {
            const interval = setInterval(() => {
                if (checkLocalStorage()) {
                    clearInterval(interval);
                    const id = localStorage.getItem("TeamId");
                    fetch(`http://127.0.0.1:8000/api/team_leader/by_team/${id}`)
                        .then(res => res.json())
                        .then(data => {
                            setTeamLeader(data.team_and_team_leader);
                            setKpiData(JSON.parse(data.team_and_team_leader.kpi_data));
                            console.log("Performance: ", JSON.parse(data.team_and_team_leader.kpi_data));
                        })
                        .catch(err => console.error(err));
                }
            }, 1000); // Check every second

            return () => clearInterval(interval); // Cleanup on unmount
        };

        waitForTeamId();
    }, []);

    useEffect(() => {
        const calculateAggregatedSums = () => {
            const aggregatedData = JSON.parse(localStorage.getItem('TeamLeader Actual')) || [];
            const sums = [];
            aggregatedData.forEach(agent => {
                const values = agent.aggregatedValues || [];
                values.forEach((value, index) => {
                    const numValue = Number(value) || 0;
                    sums[index] = (sums[index] || 0) + numValue;
                });
            });
            setAggregatedSums(sums);
        };
        setAllTargets(localStorage.getItem('TotalTargetAgents')?.split(',') || []);
        console.log('Target: ', allTargets)
        calculateAggregatedSums();
    }, []);

    useEffect(() => {
        const checkLocalStorage = () => {
            const targets = localStorage.getItem('TotalTargetAgents');
            if (targets) {
                setAllTargets(targets.split(','));
                return true;
            }
            return false;
        };

        const waitForTargets = () => {
            const interval = setInterval(() => {
                if (checkLocalStorage()) {
                    clearInterval(interval);
                    calculateAggregatedSums();
                }
            }, 1000); 

            return () => clearInterval(interval); // Cleanup on unmount
        };

        waitForTargets();
    }, []);

    const handleViewChange = (kpiId) => {
        if (kpiId === 'all') {
            setView('all');
            return;
        }

        const selectedKpi = kpis.find(kpi => kpi.id === kpiId);
        if (selectedKpi) {
            setView(selectedKpi.tableType);
        }
    };

    const handleNext = () => {
        setCurrentPage((prev) => (prev + 1) % totalPages);
    };

    const handlePrev = () => {
        setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
    };

    const getCurrentKpis = () => {
        const startIndex = currentPage * itemsPerPage;
        return kpis.slice(startIndex, startIndex + itemsPerPage);
    };

    // const getPercentColor = (percent) => {
    //     if (percent >= 100) return 'bg-green-100 rounded-full';
    //     if (percent >= 90) return 'bg-yellow-100 rounded-full';
    //     return 'bg-red-100 rounded-full';
    // };

    const getPercentColor = (percent) => {
        const numPercent = parseInt(percent);
        if (isNaN(numPercent)) return 'bg-[#fff1f0] text-[#EC706F]';
        if (numPercent >= 100) return 'bg-[#effff4] text-[#269F8B]';
        if (numPercent >= 80) return 'bg-[#fffdd4] text-[#A9A548]';
        return 'bg-red-200 text-red-800';
    };

    useEffect(() => {
        const handleStorageChange = (event) => {
            if (event.key === 'TeamLeader Actual' || 'TotalTargetAgents') {
                const aggregatedData = JSON.parse(localStorage.getItem('TeamLeader Actual')) || [];
                const sums = [];
                aggregatedData.forEach(agent => {
                    const values = agent.aggregatedValues || [];
                    values.forEach((value, index) => {
                        const numValue = Number(value) || 0;
                        sums[index] = (sums[index] || 0) + numValue;
                    });
                });
                setAggregatedSums(sums);
                setAllTargets(localStorage.getItem('TotalTargetAgents')?.split(',') || []);
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const getFormattedValue = (kpi, value) => {
        switch (kpi) {
            case 'Average Monthy Revenue':
                return `$${value}`;
            case 'Total Revenue':
                return `$${value}`;
            case 'Conversion':
            case 'Attachment rate product 1':
                return `${value}%`;
            case 'Attachment rate product 2':
                return `${value}%`;
            case 'Attachment rate product 3':
                return `${value}%`;
            case 'Attachment rate product 4':
                return `${value}%`;
            case 'Average handling time':
                return `${value} min`;
            case 'Call volume':
                return `${value}`;
            case 'Sales Volume':
                return value;
            case 'QA':
                return `${value}%`
            default:
                return `${value}%`;
        }
    };

    return (
        <div className="w-auto mt-8 p-4 flex flex-col gap-[32px] mb-4">
            <div className="flex flex-col w-auto gap-6 p-8 pb-12 card">
                <div className="flex items-center justify-between w-full">
                    <h1 className="font-[500] leading-[33px] text-[22px] text-[#269F8B]">
                        Campaign Performance
                    </h1>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrev}
                            className={`p-2 text-[#269F8B] hover:bg-gray-100 hover:text-[#269F8B] hover:shadow-lg rounded ${currentPage === 0 ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            disabled={currentPage === 0}
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className="flex">
                            <button
                                className={`px-6 py-1 text-sm font-medium ${view === 'all'
                                    ? 'text-[#269F8B] shadow-lg'
                                    : 'text-[#ABABAB] hover:text-[#269F8B] hover:shadow-lg'
                                    } border border-gray-300 bg-white rounded-l transition-all duration-200`}
                                onClick={() => handleViewChange('all')}
                            >
                                All
                            </button>

                            {getCurrentKpis().map((kpi) => (
                                <button
                                    key={kpi.id}
                                    className={`px-3 py-1 text-sm font-medium ${view === kpi.tableType
                                        ? 'text-[#269F8B] shadow-lg'
                                        : 'text-[#ABABAB] hover:text-[#269F8B] hover:shadow-lg'
                                        } border-t border-b border-r border-gray-300 bg-white whitespace-nowrap transition-all duration-200`}
                                    onClick={() => handleViewChange(kpi.id)}
                                >
                                    {kpi.label}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={handleNext}
                            className={`p-2 text-[#269F8B] hover:bg-gray-100 hover:text-[#269F8B] hover:shadow-lg rounded ${currentPage === totalPages - 1 ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            disabled={currentPage === totalPages - 1}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col w-auto gap-6 p-8 pb-12 card">
                    {view === 'all' && (
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-sm font-medium text-gray-500">
                                    <th className="pb-2 text-[#269F8B]">KPIs</th>
                                    <th className="pb-2 text-[#269F8B] text-center">Target</th>
                                    <th className="pb-2 text-[#269F8B] text-center">Actual</th>
                                    <th className="pb-2 text-[#269F8B] text-center">% to Target</th>
                                    <th className="pb-2 text-[#269F8B] text-center">Commission</th>
                                    <th className="pb-2 text-[#269F8B] text-center">Gatekeeper</th>
                                    <th className="pb-2 text-[#269F8B] text-center">Gatekeeper Target</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teamLeader && kpiData ? (
                                    kpiData.kpiData.map((kpi, index) => {
                                        const actual = aggregatedSums[index] || 0;
                                        const target = allTargets[index] || 1;
                                        const percentage = ((actual / target) * 100).toFixed(1);
                                        return (
                                            <tr key={index} className="text-sm">
                                                <td className="py-2 text-[#269F8B] font-medium">{kpi.kpi_Name}</td>
                                                <td className="py-2 text-center">{getFormattedValue(kpi.kpi_Name, target)}</td>
                                                {/* <td className="py-2 text-center">{aggregatedSums[index]?.toFixed(2)}</td> */}
                                                <td className="py-2 text-center">{getFormattedValue(kpi.kpi_Name, aggregatedSums[index]?.toFixed(2))}</td>
                                                <td className="py-2 px text-center">
                                                    <span
                                                        className={`inline-block px-2 py-1 w-24 text-center ${getPercentColor(
                                                            percentage
                                                        )}`}
                                                        style={{ minWidth: '2rem' }}
                                                    >
                                                        {percentage}&nbsp;&nbsp;%
                                                    </span>
                                                </td>
                                                <td className="py-2 text-center">
                                                    {kpiData.teamInfo.currency}{kpi.opportunity.toFixed(1)}
                                                </td>
                                                <td className={`py-2 text-center ${kpi.gatekeeper ? 'text-black' : 'bg-gray-100'}`}>
                                                    {kpi.gatekeeper ? 'Yes' : 'N/A'}
                                                </td>
                                                <td className="py-2 text-center">
                                                    <span className={`inline-block ${!kpi.gatekeeper ? 'bg-gray-100 w-12' : ''}`}>
                                                        {kpi.gatekeeper || '-'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4 text-gray-500">
                                            Loading KPI data...
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                    {view === 'revenue' && <RevenueTable_TeamLeader barIndex = {0}/>}
                    {view === 'totalrevenue' && <RevenueTable_TeamLeader barIndex = {1}/>}
                    {view === 'units' && <RevenueTable_TeamLeader barIndex = {2}/>}
                    {view === 'unitsSales' && <RevenueTable_TeamLeader barIndex = {3}/>}
                    {/* {view === 'units' && <UnitsTable />}
                    {view === 'conversion' && <ConversionTable />}
                    {view === 'dials' && <DialsTable />}
                    {view === 'productivity' && <ProductivityTable />} */}
                </div>
            </div>
        </div>

    );
};

export default PerformanceTable_Teamleader;