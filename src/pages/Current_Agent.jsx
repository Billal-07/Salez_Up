import React, { useEffect, useState } from 'react';
import './OrgChartAgent.css';


const Current_Agent = () => {
  const [categories, setCategories] = useState([]);
  const [salesAgents, setSalesAgents] = useState([]);


  useEffect(() => {
    const fetchSalesAgents = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/sales_agents');
        const data = await response.json();
        setSalesAgents(data);
      } catch (error) {
        console.error('Error fetching Sales Agents:', error);
      }
    };

    fetchSalesAgents();
  }, []);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const campaignsResponse = await fetch('http://127.0.0.1:8000/api/team_leaders');
        const campaignsData = await campaignsResponse.json();

        console.log("Cap", campaignsData)

        const loggedInManagerName = localStorage.getItem("userFName");
        const loggedInManagerid = localStorage.getItem("id");

        const matchingCampaigns = campaignsData.filter(campaign =>
          campaign.manager && campaign.manager.first_name == loggedInManagerName &&
          campaign.campaign_detail.manager == loggedInManagerid
        );

        console.log("Matching", matchingCampaigns)

        const formattedData = matchingCampaigns.map(campaign => {
          const matchingSalesAgents = salesAgents
            .filter(salesAgent =>
              salesAgent.campaign_details.some(detail =>
                detail.team_id == campaign.team.id &&
                detail.team_leader_id == campaign.team.leader.id
              )
            )
            .map(agent => ({
              SalesAgentName: agent.name,
              SalesAgentImage: agent.image_path
            }));

          return {
            name: campaign.name,
            companyLogo: campaign.campaign_detail.company_logo || 'https://example.com/default-logo.jpg',
            teamName: campaign.team.team_name || 'null',
            LeaderName: campaign.team.leader.name || 'null',
            LeaderImg: campaign.team.leader.image_path || 'null',
            SalesAgents: matchingSalesAgents.length > 0 ? matchingSalesAgents : [{ SalesAgentName: 'No Sales Agent', SalesAgentImage: 'No Image Available' }]
          };
        });
        setCategories(formattedData);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      }
    };

    fetchCampaigns();
  }, [salesAgents]);

  return (
    <div className='flex flex-col w-full gap-6 p-8 pb-12 card'>
      <h1 className='font-[500] leading-[33px] text-[22px] text-[#269F8B]'>Current ORG Chart</h1>
      <div className='overflow-x-auto max-w-[930px]'>
        <div className="min-w-full tree-container">
          <div className="tree">
            <ul>
              <li>
                <div className="family">
                  <div className="parent">
                    <div className="flex flex-col items-center person manager">
                      <div className='relative'>
                        <div className="name text-center absolute rounded-full -left-[8px] top-[0px] bg-blue-300 h-[44px] w-[44px]"></div>
                        <div className="name text-center absolute rounded-full left-[45px] top-[43px] z-[2] bg-[#FFAAAB] h-[20px] w-[20px]"></div>
                        <div className="name text-center absolute rounded-full left-[58px] top-[26px] z-[2] bg-[#FFEE3C] h-[12px] w-[12px]"></div>
                        <div className="name text-center absolute rounded-full left-[34px] top-[60px] z-[2] bg-[#45D6FF] h-[8px] w-[8px]"></div>
                        <img className="avatar w-[64px] h-[64px] rounded-full relative" src="https://img.freepik.com/premium-photo/young-handsome-man-with-beard-isolated-keeping-arms-crossed-frontal-position_1368-132662.jpg" alt="Manager" />
                      </div>
                      <h1 className="name text-center font-[400] text-[16px] text-themeGreen mt-2">MANAGER</h1>
                      <h1 className="name text-center font-[500] text-[12px]">{localStorage.getItem("userFName")}</h1>
                    </div>
                    <ul>
                      {categories.map((category, catIndex) => (
                        <li key={catIndex}>
                          <div className="family">

                            <div className="flex flex-col items-center category">
                              <img className="avatar w-[64px] h-[64px] rounded-full" src={category.companyLogo} alt="Company Logo" />

                              <div className="category-name bg-themeGreen text-white font-[400] min-w-[103px] min-h-[34px] rounded-[200px] flex items-center justify-center mt-1">
                                {category.teamName}
                              </div>

                              <div className="vertical-line my-1"></div>

                              <img className="avatar w-[64px] h-[64px] rounded-full z-[1] bg-green-500" src={category.LeaderImg} alt="Leader" />

                              <div className="mt-1 text-sm text-center name">Team Leader</div>
                              <div className="mt-1 font-semibold text-center name"><p>{category.LeaderName}</p></div>

                              <div className="agents-container mt-4">
                                {category.SalesAgents.map((agent, agentIndex) => (
                                  (agent.SalesAgentImage !== "No Image Available" && agent.SalesAgentName !== "No Sales Agent") && (
                                    <div key={agentIndex} className="agent-item">
                                      <div className="circle">
                                        <img className="rounded-full agent-avatar" src={agent.SalesAgentImage} alt="Agent" />
                                      </div>
                                      <div className="mt-2 text-sm text-center name">{agent.SalesAgentName}</div>
                                    </div>
                                  )
                                ))}
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>


  );
}

export default Current_Agent;