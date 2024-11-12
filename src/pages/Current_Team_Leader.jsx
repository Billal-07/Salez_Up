
import React, { useState, useEffect } from 'react';
import fallbackImage from "/public/images/image_not_1.jfif";

const Current_Team_Leader = () => {
  const [categories, setCategories] = useState([]);
  const [managerName, setManagerName] = useState('');
  const [managerRole, setManagerRole] = useState('Manager');

  useEffect(() => {
    const userFName = localStorage.getItem('userFName') || 'Manager';
    setManagerName(userFName);
  
    const role = localStorage.getItem('managerRole') || 'Manager';
    setManagerRole(role);
  
    const managerId = localStorage.getItem('id');
    fetch(`https://crmapi.devcir.co/api/team_and_team_leader?manager_id=${managerId}`)
      .then(response => response.json())
      .then(async data => {
        const filteredData = data.filter(item => item.team.manager_id == parseInt(managerId));
        
        const categoriesWithCampaigns = await Promise.all(filteredData.map(async (item) => {
          try {
            const campaignResponse = await fetch(`https://crmapi.devcir.co/api/campaigns_and_teams?team_id=${item.team.id}`);
            const campaignData = await campaignResponse.json();
            
            const matchingCampaign = campaignData.find(campaign => 
              campaign.team_id == item.team.id
            );

            return {
              name: item.team.team_name,
              teamName: item.team.team_name,
              LeaderName: `${item.team_leader.first_name} ${item.team_leader.last_name}`,
              LeaderImg: item.team_leader.image_path || fallbackImage,
              teamId: item.team.id,
              campaignImage: matchingCampaign ? matchingCampaign.campaign.image_path : null,
              campaignName: matchingCampaign ? matchingCampaign.campaign.name : null
            };
          } catch (error) {
            console.error('Error fetching campaign data:', error);
            return {
              name: item.team.team_name,
              teamName: item.team.team_name,
              LeaderName: `${item.team_leader.first_name} ${item.team_leader.last_name}`,
              LeaderImg: item.team_leader.image_path || fallbackImage,
              teamId: item.team.id,
              campaignImage: null,
              campaignName: null
            };
          }
        }));
        
        setCategories(categoriesWithCampaigns);
      })
      .catch(error => console.error('Error fetching team and team leader data:', error));
  }, []);

  return (
    <div className="flex flex-col w-full gap-6 p-8 pb-12 card">
      <h1 className="font-[500] leading-[33px] text-[22px] text-[#269F8B]">Current ORG Chart</h1>
      <div className="overflow-x-auto max-w-[930px]">
        <div className="min-w-full tree-container">
          <div className="tree">
            <ul>
              <li>
                <div className="family">
                  <div className="parent">
                    <div className="flex flex-col items-center person manager">
                      <div className="relative">
                        <div className="name text-center absolute rounded-full -left-[8px] top-[0px] bg-blue-300 h-[44px] w-[44px]"></div>
                        <div className="name text-center absolute rounded-full left-[45px] top-[43px] z-[2] bg-[#FFAAAB] h-[20px] w-[20px]"></div>
                        <div className="name text-center absolute rounded-full left-[58px] top-[26px] z-[2] bg-[#FFEE3C] h-[12px] w-[12px]"></div>
                        <div className="name text-center absolute rounded-full left-[34px] top-[60px] z-[2] bg-[#45D6FF] h-[8px] w-[8px]"></div>
                        <img 
                          className="avatar w-[64px] h-[64px] rounded-full relative" 
                          src="https://img.freepik.com/premium-photo/young-handsome-man-with-beard-isolated-keeping-arms-crossed-frontal-position_1368-132662.jpg" 
                          alt="Manager" 
                        />
                      </div>
                      <h1 className="name text-center font-[400] text-[16px] text-themeGreen mt-2">{managerRole}</h1>
                      <h1 className="name text-center font-[500] text-[12px]">{managerName}</h1>
                    </div>
                    <ul>
                      {categories.map((category, catIndex) => (
                        <li key={catIndex}>
                          <div className="family">
                            <div className="flex flex-col items-center category">
                              {category.campaignImage && (
                                <img
                                  className="avatar w-[64px] h-[64px] rounded-full"
                                  src={category.campaignImage || fallbackImage}
                                  alt={category.campaignName || "Campaign"}
                                />
                              )}
                              <div className="category-name bg-themeGreen text-white font-[400] min-w-[103px] min-h-[34px] rounded-[200px] flex items-center justify-center mt-1">
                                {category.teamName != 'Undefined' ? category.teamName : 'No Team'}
                              </div>
                              <div className="vertical-line my-1"></div>
                              <img
                                className="avatar w-[64px] h-[64px] rounded-full z-[1] bg-green-500"
                                // src={category.LeaderImg != 'Undefined' ? category.LeaderImg : fallbackImage}
                                src={category.LeaderImg ? category.LeaderImg : fallbackImage}
                                alt="Leader"
                              />
                              <div className="mt-1 text-sm text-center name">
                                {category.LeaderName != 'Undefined' ? 'Team Leader' : 'No Team Leader'}
                              </div>
                              <div className="mt-1 font-semibold text-center name">
                                <p>{category.LeaderName != 'Undefined' ? category.LeaderName : 'No Team Leader'}</p>
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
};

export default Current_Team_Leader;