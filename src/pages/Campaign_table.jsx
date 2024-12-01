
import React from "react";
import { Tree, TreeNode } from "react-organizational-chart";
import './OrgChartAgent.css';
import fallbackImage from "/public/images/image_not_1.jfif";

export default function Current_Agent() {

  const managerRole = "Manager Role";
  const userFName = "John Doe";
  const managerImagePath = "/path/to/manager/image.jpg";  
  const isManagerMatched = true;

  const teamData = [
    { id: 1, team_name: "Team A" },
    { id: 2, team_name: "Team B" }
  ];

  const campaignData = [
    { id: 1, image_path: "/path/to/campaign/image1.jpg" },
    { id: 2, image_path: "/path/to/campaign/image2.jpg" }
  ];

  const teamLeaderDetails = [
    { firstName: "Leader A", imagePath: "/path/to/leader/image1.jpg" },
    { firstName: "Leader B", imagePath: "/path/to/leader/image2.jpg" }
  ];

  return (
    <div className="flex items-center justify-center w-full mt-8">
      <Tree
        lineWidth="2px"
        lineColor="green"
        lineBorderRadius="10px"
        label={
          <div className="flex flex-col items-center gap-2">
            {isManagerMatched && managerImagePath && (
              <img
                src={managerImagePath || fallbackImage}
                alt="Manager"
                className="w-12 h-12 rounded-full"
                onError={(e) => (e.target.src = fallbackImage)}
              />
            )}
            <h2 className="text-lg">{managerRole || "No Role Defined"}</h2>
            <h2 className="text-lg">{isManagerMatched ? userFName : "Root"}</h2>
          </div>
        }
      >
        {teamData && campaignData && teamData.length > 0 && campaignData.length > 0 ? (
          teamData.map((team, index) => {
            const campaign = campaignData[index];
            return (
              <TreeNode
                label={
                  <div className="flex flex-col items-center relative">
                    {/* Blue div */}
                    <div
                      key={team.id}
                      className="px-4 py-2 flex flex-col items-center text-center bg-blue-200 border border-blue-500 rounded-md"
                    >
                      <img
                        src={campaign?.image_path || fallbackImage}
                        alt="Campaign"
                        className="w-12 h-12 rounded-full"
                        onError={(e) => (e.target.src = fallbackImage)}
                      />
                      <h2 className="text-lg mt-2">{team.team_name || "Unknown Team"}</h2>
                    </div>
                    {/* Vertical line */}
                    <div className="w-0.5 h-8 bg-gray-400"></div>
                    {/* Green circular div */}
                    <div className="w-20 h-20 bg-green-500 rounded-full flex flex-col items-center justify-center text-white">
                      {teamLeaderDetails[index]?.imagePath ? (
                        <>
                          <p className="text-sm mt-2">{teamLeaderDetails[index].firstName}</p>
                        </>
                      ) : (
                        <p className="text-sm">No Team Leader Assigned</p>
                      )}
                    </div>
                  </div>
                }
              />
            );
          })
        ) : (
          <p>No teams or campaigns available</p>
        )}
      </Tree>
    </div>
  );
}
