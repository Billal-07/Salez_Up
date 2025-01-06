import React from 'react';
import Navbar from '../components/Navbar';
import SideBar from '../components/SideBar';
import PerformanceTable from './PerformanceTable';
import Intro from './Intro'
import My_Commission from './ContestSummary'
import ContestSummary from './ContestSummary';

const SalesAgent_Main_dashboard = () => {

    return (
        <div className='mx-2'>
            <Navbar />
            <div className='w-full flex flex-row gap-3'>
                <div className="w-[22%]">
                    <SideBar />
                </div>
                <div className="w-[78%] flex flex-col overflow-hidden">
                    <Intro />
                    <My_Commission />
                    <ContestSummary />
                    <PerformanceTable />

                </div>

            </div >
        </div >
    );
};


export default SalesAgent_Main_dashboard;