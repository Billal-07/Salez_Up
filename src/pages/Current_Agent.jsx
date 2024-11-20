import React, { useState, useEffect } from "react";
import { Tree, TreeNode } from "react-organizational-chart";
import './OrgChartAgent.css';
import fallbackImage from "/public/images/image_not_1.jfif";

export default function Current_Agent() {
  const [managerId, setManagerId] = useState(null);
  const [managerImagePath, setManagerImagePath] = useState(null);
  const [isManagerMatched, setIsManagerMatched] = useState(false);
  const [userFName, setUserFName] = useState(null); 
  const [managerRole, setManagerRole] = useState(null);
  const [teamData, setTeamData] = useState(null);
  const [campaignData, setCampaignData] = useState(null);

  useEffect(() => {
    const storedManagerId = localStorage.getItem("id");
    const storedUserFName = localStorage.getItem("userFName"); 
    const storedManagerRole = localStorage.getItem("managerRole");

    setManagerId(storedManagerId);
    setUserFName(storedUserFName);
    setManagerRole(storedManagerRole);

    fetch("http://127.0.0.1:8000/api/manager_details")
      .then((response) => response.json())
      .then((data) => {
        const matchingManager = data.find(
          (manager) => manager.id === parseInt(storedManagerId)
        );
        if (matchingManager) {
          console.log("Manager details match!");
          setManagerImagePath(matchingManager.manager_image_path);
          setIsManagerMatched(true);
        } else {
          console.log("Manager details do not match.");
          setIsManagerMatched(false);
        }
      })
      .catch((error) => {
        console.error("Error fetching manager details:", error);
        setIsManagerMatched(false);
      });
  }, []);

  useEffect(() => {
    const storedManagerId = localStorage.getItem("id");
    if (!storedManagerId) return;

    fetch("http://127.0.0.1:8000/api/campaigns_and_teams")
      .then((response) => response.json())
      .then((data) => {
        // Process team data
        const matchingTeams = data
          .filter(item => item.team?.manager_id === parseInt(storedManagerId))
          .map(item => item.team);
        
        const uniqueTeams = Array.from(new Set(matchingTeams.map(team => team.id)))
          .map(id => matchingTeams.find(team => team.id === id));

        console.log("Matching Teams:", uniqueTeams.map(team => team.team_name));
        setTeamData(uniqueTeams);

        // Process campaign data
        const matchingCampaigns = data
          .filter(item => item.campaign?.manager_id === parseInt(storedManagerId))
          .map(item => item.campaign);

        const uniqueCampaigns = Array.from(new Set(matchingCampaigns.map(campaign => campaign.id)))
          .map(id => matchingCampaigns.find(campaign => campaign.id === id));

        console.log("Matching Campaigns:", uniqueCampaigns.map(campaign => ({
          name: campaign.campaign_name,
          image: campaign.image_path
        })));
        setCampaignData(uniqueCampaigns);
      })
      .catch((error) => {
        console.error("Error fetching campaigns and teams:", error);
      });
  }, []);

  return (
    <div className="flex flex-col w-full gap-6 p-8 pb-12 card">
      <Tree
        lineWidth="2px"
        lineColor="green"
        lineBorderRadius="10px"
        label={
          <div className="flex flex-col items-center gap-2">
            {isManagerMatched && managerImagePath && (
           <img
           src={isManagerMatched && managerImagePath ? managerImagePath : fallbackImage}
           alt="Manager"
           className="w-12 h-12 rounded-full"
           onError={(e) => (e.target.src = fallbackImage)} 
         />
            )}
            <h2 className="text-lg">
              {managerRole || "No Role Defined"}
            </h2>
            <h2 className="text-lg">
              {isManagerMatched ? userFName : "Root"}
            </h2>
          </div>
        }
        
>
        <TreeNode
          label={
            <div className="px-4 py-2 flex flex-col items-center text-center bg-blue-200 border border-blue-500 rounded-md">
              <img
           src={isManagerMatched && managerImagePath ? managerImagePath : fallbackImage}
           alt="Manager"
           className="w-12 h-12 rounded-full"
           onError={(e) => (e.target.src = fallbackImage)} 
         />
          <h2 className="text-lg">
              {isManagerMatched ? userFName : "Root"}
            </h2>
            </div>
          }
        >
          <TreeNode
            label={
              <div className="px-4 py-2 text-center bg-yellow-200 border border-yellow-500 rounded-md">
                Grand Child
              </div>
            }
          />
        </TreeNode>


        
        <TreeNode
          label={
            <div className="px-4 py-2 text-center bg-blue-200 border border-blue-500 rounded-md">
              Child 2
            </div>
          }
        >
          <TreeNode
            label={
              <div className="px-4 py-2 text-center bg-yellow-200 border border-yellow-500 rounded-md">
                Grand Child
              </div>
            }
          >
            <TreeNode
              label={
                <div className="px-4 py-2 text-center bg-green-200 border border-green-500 rounded-md">
                  Great Grand Child 1
                </div>
              }
            />
            <TreeNode
              label={
                <div className="px-4 py-2 text-center bg-green-200 border border-green-500 rounded-md">
                  Great Grand Child 2
                </div>
              }
            />
            <TreeNode
              label={
                <div className="px-4 py-2 text-center bg-green-200 border border-green-500 rounded-md">
                  Great Grand Child 4
                </div>
              }
            />
          </TreeNode>
        </TreeNode>
        <TreeNode
          label={
            <div className="px-4 py-2 text-center bg-blue-200 border border-blue-500 rounded-md">
              Child 3
            </div>
          }
        >
          <TreeNode
            label={
              <div className="px-4 py-2 text-center bg-yellow-200 border border-yellow-500 rounded-md">
                Grand Child 1
              </div>
            }
          />
          <TreeNode
            label={
              <div className="px-4 py-2 text-center bg-yellow-200 border border-yellow-500 rounded-md">
                Grand Child 2
              </div>
            }
          />
        </TreeNode>
      </Tree>
    </div>
  );
}






