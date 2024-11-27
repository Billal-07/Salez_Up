import React, { useState, useEffect } from "react";
import axios from "axios";

import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import fallbackImage from "/public/images/image_not_1.jfif";
import {
  faSearch as faMagnifyingGlass,
  faPlus,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";

const TeamLeaderKpiTable = () => {
  const [demoData, setDemoData] = useState([]);
  const [singleCampaignTeams, setSingleCampaignTeams] = useState([]);
  const [multipleCampaignTeams, setMultipleCampaignTeams] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("All Leaders");
  const [selectedTeamName, setSelectedTeamName] = useState("All Teams");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [editingRow, setEditingRow] = useState(null);
  const [updateCommission, setUpdateCommission] = useState(null);
  const [gatekeeperSet, setGatekeeperSet] = useState({});
  const [kpis, setKpis] = useState([]);
  const [selectedDialOptions, setSelectedDialOptions] = useState({});
  const [isDownloadClicked, setIsDownloadClicked] = useState(false);

  const handleEditCommissionOpportunity = (rowIndex) => {
    setUpdateCommission(rowIndex);
    setIsModalOpen(true);
    console.log("Handle commission Update: ");
    console.log("Selected option: ", selectedRow);
  };

  function generateMonthOptions() {
    const options = ["All Leaders"];
    for (let year = 2021; year <= 2030; year++) {
      for (let month = 0; month < 12; month++) {
        const date = new Date(year, month);
        const monthYear = date.toLocaleString("default", {
          month: "short",
          year: "numeric",
        });
        options.push(monthYear);
      }
    }
    return options;
  }
  const monthOptions = generateMonthOptions();

  const handleUpdate = (team, rowIndex) => {
    console.log("update", team);
    if (!team.kpi_data || !team.kpi_data.kpi_data) {
      alert("No KPI added");
      return;
    }

    const parsedKpiData = team.kpi_data.kpi_data;
    setEditingRow(rowIndex);

    setSelectedRow(parsedKpiData);
    console.log("Selected DAATTA", parsedKpiData);
  };

  useEffect(() => {
    axios
      .get("https://crmapi.devcir.co/api/teams")
      .then((response) => {
        const allTeams = response.data.filter(
          (team) => team.manager_id == localStorage.getItem("id")
        );

        const singleCampaignTeams = allTeams.filter((team) => {
          return demoData.some((agent) => {
            return (
              Array.isArray(agent.team) &&
              agent.team.some((teamObj) => teamObj.team_name == team.team_name)
            );
          });
        });

        console.log("TEAmS: ", singleCampaignTeams);
        const multipleCampaignTeams = allTeams.filter((team) => {
          return demoData.some((agent) =>
            console.log("TEAMS: ", team.team_name)
          );
        });
        setSingleCampaignTeams(singleCampaignTeams);
        // console.log(singleCampaignTeams)
        setMultipleCampaignTeams(multipleCampaignTeams);
      })
      .catch((error) => console.error("Error fetching teams:", error));
  }, [demoData]);

  useEffect(() => {
    const fetchKpis = async () => {
      try {
        const response = await axios.get("https://crmapi.devcir.co/api/kpi_info");
        setKpis(response.data);
      } catch (error) {
        console.error("Error fetching KPIs:", error);
      }
    };
    fetchKpis();
    console.log("Dial Selected Value: ", selectedDialOptions);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamLeadersResponse, teamLeaderResponse] = await Promise.all([
          fetch("https://crmapi.devcir.co/api/team_leaders"),
          fetch("https://crmapi.devcir.co/api/team_and_team_leader"),
        ]);

        const teamLeadersData = await teamLeadersResponse.json();
        const teamLeaderData = await teamLeaderResponse.json();
        const filteredTeams = teamLeadersData.filter(
          (team) => team.manager_id == localStorage.getItem("id")
        );
        const filtered = teamLeaderData.filter(
          (team) => team.team.manager_id == localStorage.getItem("id")
        );

        const combinedData = filteredTeams.map((leader) => {
          const teamInfos = filtered.filter(
            (team) => team.team_leader_id == leader.id
          );

          if (teamInfos.length > 1) {
            return {
              ...leader,
              kpi_data: {
                kpi_data: teamInfos
                  .filter((teamInfo) => teamInfo && teamInfo.kpi_data)
                  .map((teamInfo) => {
                    const parsedKpiData = JSON.parse(teamInfo.kpi_data || "{}");
                    return {
                      ...parsedKpiData,
                      teamInfo: parsedKpiData.teamInfo || null,
                    };
                  }),
              },
              team: teamInfos
                .filter((teamInfo) => teamInfo && teamInfo.team)
                .map((teamInfo) => ({
                  id: teamInfo.team_id,
                  team_name: teamInfo.team.team_name,
                })),
            };
          } else if (teamInfos.length == 1) {
            return {
              ...leader,
              kpi_data: {
                kpi_data: teamInfos[0].kpi_data
                  ? [JSON.parse(teamInfos[0].kpi_data)]
                  : null,
              },
              team: [
                {
                  id: teamInfos[0].team_id,
                  team_name: teamInfos[0].team.team_name,
                },
              ],
            };
          } else {
            return {
              ...leader,
              kpi_data: null,
              team: null,
            };
          }
        });

        console.log("Combined Data:", combinedData);
        setDemoData(combinedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const getFilteredKpiOptions = (kpiType, kpiIndex) => {
    const selectedKpiIds = selectedRow
      .flatMap((row) => {
        const kpiDataIds = row.kpiData.map((kpi, index) =>
          kpiType == "kpiData" && index == kpiIndex ? null : kpi.kpi_Name_ID
        );
        const customKpiDataIds = row.customKpiData.map((customKpi, index) =>
          kpiType == "customKpiData" && index == kpiIndex
            ? null
            : customKpi.Custom_KPI_ID?.toString()
        );

        return [...kpiDataIds, ...customKpiDataIds];
      })
      .filter((id) => id != null);

    return kpis.filter(
      (kpiOption) => !selectedKpiIds.includes(kpiOption.id.toString())
    );
  };

  const handleSaveKpi = async (updatedTeam, rowIndex, row) => {
    console.log("Row: ", row);
    console.log("Row Index: ", rowIndex);
    console.log("Updated Team: ", updatedTeam);
    const kpiWeightingSum = row.kpiData.reduce((sum, kpi) => {
      return sum + (parseFloat(kpi.weighting) || 0);
    }, 0);

    const customKpiWeightingSum = row.customKpiData.reduce((sum, customKpi) => {
      return sum + (parseFloat(customKpi.Custom_Weighting) || 0);
    }, 0);

    const totalWeightingSum = kpiWeightingSum + customKpiWeightingSum;

    if (totalWeightingSum > 100) {
      alert(
        `Total weighting (${totalWeightingSum}%) exceeds 100%. Please adjust the weightings.`
      );
      return false;
    }

    const dataToPost = {
      kpi_data: JSON.stringify(updatedTeam[rowIndex]),
    };
    console.log("Updated Data: ", dataToPost);
    try {
      const response = await fetch(
        `https://crmapi.devcir.co/api/kpiUpdate/${row.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToPost),
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const responseData = await response.json();
      console.log("Response from API:", responseData);
      // Show success alert
      toast.success("Data Updated successfully!", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      window.location.reload();
      setIsModalOpen(false);
      setSelectedRow(null);
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
      alert("There was an error posting the data.");
    }
  };

  const handleDelete = async (team) => {
    const deletedTeam = team;
    console.log(`delete team = ${deletedTeam}`);

    // const responses = await fetch(
    //   `https://crmapi.devcir.co/api/team_leader_update/${deletedTeam}`,
    //   {
    //     method: "PUT",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //   }
    // );

    // try {
    //   const response = await fetch(
    //     `https://crmapi.devcir.co/api/team_leader_update/${deletedTeam}`,
    //     {
    //       method: "PUT",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //     }
    //   );

    //   if (!response.ok) {
    //     toast.error("Error Deleting Team Leader");
    //     return;
    //     throw new Error("Failed to delete");
    //   }

    //   toast.success("Item deleted successfully!", {
    //     position: "bottom-right",
    //     autoClose: 5000,
    //     hideProgressBar: false,
    //     closeOnClick: true,
    //     pauseOnHover: true,
    //     draggable: true,
    //     progress: undefined,
    //     theme: "light",
    //   });
    //   window.location.reload();
    // } catch (err) {
    //   setError(err.message);
    // }
  };

  const handleCustomKpiChange = (rowIndex, kpiIndex, field, value) => {
    setSelectedRow((prevRows) =>
      prevRows.map((row, rIndex) =>
        rIndex == rowIndex
          ? {
            ...row,
            kpiData: row.kpiData.map((kpi, kIndex) =>
              kIndex == kpiIndex ? { ...kpi, [field]: value } : kpi
            ),
          }
          : row
      )
    );
  };

  const handleStoreCSV = async () => {
    try {
      const headers = [
        "Name",
        "Surname",
        "Campaign",
        "Team",
        "Team Leader",
        "Commission",
        "KPIs",
        "Gatekeeper",
      ];

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sales Agents");
      worksheet.addRow(headers);
      worksheet.getRow(1).font = { bold: true };

      const rows = document.querySelectorAll("tbody tr");
      rows.forEach((row) => {
        const cells = row.querySelectorAll("td");
        const rowData = [
          cells[1]?.querySelector("p")?.innerText.trim() || "",
          cells[2]?.querySelector("p")?.innerText.trim() || "",
          cells[3]?.querySelector("p")?.innerText.trim() || "",
          cells[4]?.querySelector("p")?.innerText.trim() || "",
          cells[5]?.querySelector("p")?.innerText.trim() || "",
          cells[6]?.querySelector("p")?.innerText.trim() || "",
          cells[7]?.querySelector("p")?.innerText.trim() || "",
          cells[8]?.querySelector("p")?.innerText.trim() || "",
        ];
        worksheet.addRow(rowData);
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, "Sales_Agents_Data.xlsx");
    } catch (error) {
      console.error("Error generating Excel:", error);
    }
  };

  const [currentPageSingle, setCurrentPageSingle] = useState(1);
  const [currentPageMultiple, setCurrentPageMultiple] = useState(1);
  const agentsPerPage = 9;
  const [campaignView, setCampaignView] = useState("single");
  const filteredData = demoData.filter((team) => {
    const teamStartDate = new Date(team.start_date);
    const teamMonth = teamStartDate.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    const monthMatch =
      selectedMonth == "All Leaders" || teamMonth == selectedMonth;
    return monthMatch;
  });

  let filteredAgents, currentPage, setCurrentPage;
  if (campaignView == "multiple") {
    filteredAgents = filteredData.filter(
      (agent) =>
        agent.campaign_details.length > 1 &&
        (selectedTeamName == "All Teams" ||
          agent.campaign_details.some(
            (campaign) => campaign.team_name == selectedTeamName
          ))
    );
    currentPage = currentPageMultiple;
    setCurrentPage = setCurrentPageMultiple;
  } else {
    filteredAgents = filteredData.filter(
      (agent) =>
        selectedTeamName == "All Teams" ||
        (Array.isArray(agent.team) &&
          agent.team.some((teamObj) => teamObj.team_name == selectedTeamName))
    );
    currentPage = currentPageSingle;
    setCurrentPage = setCurrentPageSingle;
  }
  const indexOfLastAgent = currentPage * agentsPerPage;
  const indexOfFirstAgent = indexOfLastAgent - agentsPerPage;
  const currentAgents = filteredAgents.slice(
    indexOfFirstAgent,
    indexOfLastAgent
  );
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  return (
    <>
      {multipleCampaignTeams.length > 0 && (
        <div className="flex justify-center gap-4 mb-4">
          <button
            onClick={() => setCampaignView("single")}
            className={`px-4 py-2 rounded-[10px] ${campaignView == "single"
              ? "bg-themeGreen text-white"
              : "bg-lGreen text-black"
              }`}
          >
            Single Campaign
          </button>
          <button
            onClick={() => setCampaignView("multiple")}
            className={`px-4 py-2 rounded-[10px] ${campaignView == "multiple"
              ? "bg-themeGreen text-white"
              : "bg-lGreen text-black"
              }`}
          >
            Multiple Campaigns
          </button>
          <button
            onClick={() => setCampaignView("multiple")}
            className={`px-4 py-2 rounded-[10px] ${campaignView == "multiple"
              ? "bg-themeGreen text-white"
              : "bg-lGreen text-black"
              }`}
          >
            Multiple Campaigns
          </button>
        </div>
      )}

      <div className="font-[500] leading-[33px] text-[22px] text-[#269F8B] flex justify-between items-center">
        <div className="flex items-center w-1/2 ">
          Current Month
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="[box-shadow:0px_4px_4px_0px_#40908417] cursor-pointer w-[28%] ml-6 rounded-[6px] outline-none focus:outline-none bg-white p-2 text-[15px] font-[500] border-none h-[45px]  text-center"
          >
            {monthOptions.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        {/* <button
          onClick={handleStoreCSV}
          className="bg-themeGreen w-[150px] p-2 h-full rounded-[10px] text-white tracking-[1%] font-[500] text-[15px]"
        >
          Export Data <FontAwesomeIcon icon={faDownload} className="ml-2" />
        </button> */}

        {/* <button
          onClick={handleStoreCSV}
          className="flex justify-center items-center w-10 h-10 rounded-full bg-lGreen border-2 border-gray-300 cursor-pointer"
        >
          <FontAwesomeIcon
            icon={faDownload}
            className={`text-base text-gray-500 ${isDownloadClicked ? "text-green-500" : ""
              }`}
          />
        </button> */}


      </div>
      <div className="flex flex-wrap items-center gap-[10px] justify-between lg:justify-start">
        <div
          className="cursor-pointer"
          onClick={() => setSelectedTeamName("All Teams")}
        >
          <p
            className={`w-[100px] h-[34px] flex items-center justify-center text-[14px] leading-[21px] rounded-[10px] ${selectedTeamName == "All Teams"
              ? "bg-lGreen text-black font-[400]"
              : "border-2 border-gray-300 text-gray-500 font-[400]"
              }`}
          >
            All Teams
          </p>
        </div>
        {campaignView == "single"
          ? singleCampaignTeams.map((team, index) => (
            <div
              key={index}
              className="cursor-pointer"
              onClick={() => setSelectedTeamName(team.team_name)}
            >
              <p
                className={`min-w-[100px] max-w-[200px] h-[44px] flex items-center justify-center text-[14px] leading-[21px] rounded-[10px] overflow-hidden text-ellipsis whitespace-nowrap ${selectedTeamName == team.team_name
                  ? "bg-lGreen text-black font-[400] p-4"
                  : "border-2 border-gray-300 text-gray-500 font-[400] p-4"
                  }`}
              >
                {team.team_name}
              </p>
            </div>
          ))
          : multipleCampaignTeams.map((team, index) => (
            <div
              key={index}
              className="cursor-pointer"
              onClick={() => setSelectedTeamName(team.team_name)}
            >
              <p
                className={`${selectedTeamName == team.team_name
                  ? "bg-lGreen text-black font-[400]"
                  : "border-2 border-gray-300 text-gray-500 font-[400]"
                  } w-[100px] h-[34px] flex items-center justify-center text-[14px] leading-[21px] rounded-[10px]`}
              >
                {team.team_name}
              </p>
            </div>
          ))}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-[14px] bg-white">
          <thead className="text-themeGreen h-[30px]">
            {campaignView == "multiple" ? (
              <tr className="flex flex-row items-center justify-evenly w-full text-center custom flex-nowrap">
                <th className="font-[500] w-16"></th>
                <th className="font-[500] w-24">Name</th>
                <th className="font-[500] w-24">Surname</th>
                <th className="font-[500] w-28">Commission</th>
                <th className="font-[500] w-20">KPIs</th>
                <th className="font-[500]">Gatekeeper</th>
                <th className="font-[500] w-80 text-center">
                  Campaign Details
                </th>
                <th className="font-[500] w-14"></th>
              </tr>
            ) : (
              <tr className="flex flex-row items-center justify-between w-full text-center custom flex-nowrap">
                <th className="px-[10px] font-[500] w-[55px]"></th>
                <th className="px-[10px] font-[500] w-[84px]">Name</th>
                <th className="px-[10px] font-[500] w-[84px]">Surname</th>
                {/* <th className="px-[5px] font-[500]">Campaign</th> */}
                <th className="px-[10px] font-[500] w-[84px]">Team</th>
                {/* <th className="font-[500] w-[104px]">Team Leader</th> */}
                <th className="font-[500] w-[84px]">Commission</th>
                <th className="font-[500] w-[44px]">KPIs</th>
                <th className="px-[10px] font-[500] w-[84px]">Gatekeeper</th>
                <th className="px-[10px] font-[500] w-[71px]"></th>
              </tr>
            )}
          </thead>
          <tbody className="font-[400] bg-white">
            {currentAgents.map((team, index) => {
              // console.log("Cr Agents: ", currentAgents)
              let hasGatekeeperValue = false;
              let parsedKpiDataArray = [];
              let kpiIds = [];

              if (team.kpi_data && Array.isArray(team.kpi_data.kpi_data)) {
                team.kpi_data.kpi_data.forEach((kpiEntry) => {
                  const parsedKpiEntry =
                    kpiEntry && typeof kpiEntry == "string"
                      ? JSON.parse(kpiEntry)
                      : kpiEntry;

                  if (parsedKpiEntry.id) {
                    kpiIds.push(parsedKpiEntry.id);
                  }

                  if (parsedKpiEntry) {
                    parsedKpiDataArray.push(parsedKpiEntry);
                    const hasGatekeeperValueInKpiData =
                      parsedKpiEntry.kpiData &&
                      parsedKpiEntry.kpiData.some((kpi) => kpi.gatekeeper);

                    const hasGatekeeperValueInCustomKpiData =
                      parsedKpiEntry.customKpiData &&
                      parsedKpiEntry.customKpiData.some(
                        (kpi) => kpi.Custom_Gatekeeper
                      );

                    if (
                      hasGatekeeperValueInKpiData ||
                      hasGatekeeperValueInCustomKpiData
                    ) {
                      hasGatekeeperValue = true;
                    }
                  }
                });
              }

              return (
                <React.Fragment key={index}>
                  {campaignView == "multiple" ? (
                    <tr className="my-[8px] text-center custom w-full flex flex-row flex-nowrap justify-between items-center">
                      <td className="px-[10px]">
                        <img
                          src={team.image_path}
                          className="w-[40px] h-[40px] rounded-full m-auto"
                          alt=""
                        />
                      </td>
                      <td className="px-[10px] w-[91px]">
                        <p>{team.first_name}</p>
                      </td>
                      <td className="px-[10px] w-[91px]">
                        <p>{team.last_name}</p>
                      </td>
                      <td className="px-[10px] w-[91px]">
                        <p>{`${parsedKpiData.teamInfo
                          ? parsedKpiData.teamInfo.currency
                          : ""
                          } ${team.commission}`}</p>
                      </td>
                      <td className="w-[55px]">
                        <p>{parsedKpiData ? parsedKpiData.TotalCount : 0}</p>
                      </td>
                      <td className="px-[10px] w-[91px]">
                        <p>{hasGatekeeperValue ? "Yes" : "No"}</p>
                      </td>
                      <td className="px-2 sm:px-[20px]">
                        <table className="text-[8px] table-fixed border-collapse">
                          <thead>
                            <tr>
                              <th className="px-[3px] border-2">
                                Campaign Name
                              </th>
                              <th className="px-[3px] border-2">Team Name</th>
                              <th className="px-[3px] border-2">Team Leader</th>
                              <th className="px-[3px] border-2">Partition</th>
                            </tr>
                          </thead>
                          <tbody>
                            {team.campaign_details.map((campaign, i) => (
                              <tr key={i}>
                                <td className="px-[3px] border-2">
                                  {campaign.campaign_name}
                                </td>
                                <td className="px-[3px] border-2">
                                  {campaign.team_name}
                                </td>
                                <td className="px-[3px] border-2">
                                  {campaign.team_leader_name}
                                </td>
                                <td className="px-[3px] border-2">
                                  {campaign.Partition}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                      <td className="px-[10px] py-[10px] w-[76px]">
                        <span
                          className="mx-1 cursor-pointer"
                          onClick={() => handleUpdate(team, index)}
                        >
                          <img
                            src="../images/edit.png"
                            className="inline h-[18px] w-[18px]"
                            alt=""
                          />
                        </span>
                        <span
                          className="cursor-pointer"
                          onClick={() => {
                            const isConfirmed = window.confirm(
                              "Are you sure you want to update?"
                            );
                            if (isConfirmed) {
                              handleDelete(parsedKpiDataArray.id);
                            }
                          }}
                        >
                          <img
                            src="../images/delete.png"
                            className="inline h-[18px] w-[18px]"
                            alt=""
                          />
                        </span>
                      </td>
                    </tr>
                  ) : (
                    <tr className="my-[8px] text-center custom w-full flex flex-row flex-nowrap justify-between items-center">
                      <td className="px-[10px]">
                        <img
                          src={
                            team.image_path ? team.image_path : fallbackImage
                          }
                          className="w-[40px] h-[40px] rounded-full m-auto"
                          alt=""
                        />
                      </td>
                      <td className="px-[10px] w-[91px]">
                        <p>{team.first_name}</p>
                      </td>
                      <td className="px-[10px] w-[91px]">
                        <p>{team.last_name}</p>
                      </td>
                      {/* <td className="px-[10px] w-[91px]">
                        <p>No Campaign</p>
                      </td> */}
                      {/* <td className="px-[10px] w-[91px]">
                        <p>
                          {team.team &&
                          Array.isArray(team.team) &&
                          team.team.length >= 0
                            ? team.team.map((kpiEntry, index) => (
                                <span key={index}>
                                  {kpiEntry.team_name || "(No Team Assigned)"}
                                  {index < team.team.length - 1 && <br />}
                                </span>
                              ))
                            : "(No Team Assigned)"}
                        </p>
                      </td> */}
                      <td className="px-[10px] w-[91px]">
                        <p
                          style={
                            team.team && team.team.length > 0
                              ? {}
                              : { fontSize: "12px" }
                          }
                        >
                          {team.team &&
                            Array.isArray(team.team) &&
                            team.team.length > 0
                            ? selectedTeamName == "All Teams"
                              ? team.team.map((kpiEntry, index) => (
                                <span key={index}>
                                  {kpiEntry.team_name || "(No Team Assigned)"}
                                  {index < team.team.length - 1 && <br />}
                                </span>
                              ))
                              : team.team.find(
                                (kpiEntry) =>
                                  kpiEntry.team_name == selectedTeamName
                              )?.team_name || "(No Team Assigned)"
                            : "(No Team Assigned)"}
                        </p>
                      </td>
                      <td className="px-[10px] w-[91px]">
                        <p>
                          {parsedKpiDataArray && parsedKpiDataArray.length > 0
                            ? parsedKpiDataArray.map((kpiEntry, index) => (
                              <span key={index}>
                                {kpiEntry.teamInfo
                                  ? kpiEntry.teamInfo.currency
                                  : ""}{" "}
                                {kpiEntry.teamInfo &&
                                  kpiEntry.teamInfo.opportunity
                                  ? kpiEntry.teamInfo.opportunity
                                  : 0}
                                {index < parsedKpiDataArray.length - 1 && (
                                  <br />
                                )}
                              </span>
                            ))
                            : 0}
                        </p>
                      </td>
                      <td className="w-[55px]">
                        <p>
                          {parsedKpiDataArray && parsedKpiDataArray.length > 0
                            ? parsedKpiDataArray.map((kpiEntry, index) => (
                              <span key={index}>
                                {kpiEntry.TotalCount || 0}{" "}
                                {index < parsedKpiDataArray.length - 1 && (
                                  <br />
                                )}{" "}
                              </span>
                            ))
                            : 0}
                        </p>
                      </td>
                      {/* <td className="w-[55px]">
                        <p>{parsedKpiData ? parsedKpiData.TotalCount : 0}</p>
                      </td> */}
                      <td className="px-[10px] w-[91px]">
                        <p>{hasGatekeeperValue ? "Yes" : "No"}</p>
                      </td>
                      <td className="px-[10px] py-[10px] w-[76px]">
                        <span
                          className="mx-1 cursor-pointer"
                          onClick={() => handleUpdate(team, index)}
                        >
                          <img
                            src="../images/edit.png"
                            className="inline h-[18px] w-[18px]"
                            alt=""
                          />
                        </span>
                        {/* <span
                          className="cursor-pointer"
                          onClick={() => {
                            const isConfirmed = window.confirm(
                              `Are you sure you want to Delete ${team.first_name} ${team.last_name} ?`
                            );
                            if (isConfirmed) {
                              console.log(team)
                              handleDelete(team.id);
                            }
                          }}
                        >
                          <img
                            src="../images/delete.png"
                            className="inline h-[18px] w-[18px]"
                            alt=""
                          />
                        </span> */}
                        <span
                          className="cursor-pointer"
                          onClick={() => {
                            const isConfirmed = window.confirm(
                              `Are you sure you want to delete ${team.first_name} ${team.last_name}?`
                            );
                            console.log(team)
                            if (isConfirmed) {
                              if (
                                team.kpi_data &&
                                team.kpi_data.kpi_data.length > 0
                              ) {
                                const kpiIds = team.kpi_data.kpi_data.map(
                                  (kpi) => kpi.id
                                );
                                console.log("Selected KPI IDs:", kpiIds);
                              } else {
                                console.log("No KPI data found.");
                              }
                              handleDelete(team.id);
                            }
                          }}
                        >
                          <img
                            src="../images/delete.png"
                            className="inline h-[18px] w-[18px]"
                            alt=""
                          />
                        </span>
                      </td>
                    </tr>
                  )}
                  {selectedRow &&
                    editingRow == index &&
                    selectedRow.map((row, rowIndex) => (
                      <tr key={row.id} className="w-full">
                        <td colSpan="10">
                          <div className="p-6 bg-white rounded-lg shadow-lg">
                            <div className="flex justify-between">
                              <h2 className="mb-4 text-lg font-bold">
                                Update Data for{" "}
                                {singleCampaignTeams.find(
                                  (team) => team.id == row.id
                                )?.team_name || row.id}
                              </h2>
                              <button
                                type="button"
                                onClick={() =>
                                  handleEditCommissionOpportunity(rowIndex)
                                }
                                className="p-2 mb-4 text-xs font-semibold text-white rounded-lg bg-themeGreen"
                              >
                                Edit Commission Opportunity
                              </button>
                            </div>
                            <form>
                              {row && (
                                <>
                                  <h3 className="mt-4 font-bold">KPI Data</h3>
                                  {row.kpiData.map((customKpi, index) => (
                                    <div
                                      key={index}
                                      className="grid grid-cols-5 gap-4 mt-4"
                                    >
                                      <div className={`flex flex-col border-r-2 ${row.kpiData.length === 1 || index !== row.kpiData.length - 1
                                        ? "border-b-2"
                                        : ""
                                        } border-[#dbd9d9] border-dashed`}>
                                        <label className="ml-10 text-xs font-bold">
                                          KPI
                                        </label>
                                        <select
                                          value={customKpi.kpi_Name_ID || ""}
                                          onChange={(e) => {
                                            const newValue = e.target.value;

                                            const isKpiIdUsed = selectedRow[
                                              rowIndex
                                            ].customKpiData.some(
                                              (customKpi) =>
                                                customKpi.Custom_KPI_ID?.toString() ==
                                                newValue
                                            );

                                            if (isKpiIdUsed) {
                                              alert(
                                                "This KPI is already selected in Custom KPIs section"
                                              );
                                              return;
                                            }

                                            handleCustomKpiChange(
                                              rowIndex,
                                              index,
                                              "kpi_Name_ID",
                                              newValue
                                            );
                                          }}
                                          className="bg-[#E9ECEB] mb-3 placeholder-[#8fa59c] text-center border-none w-[119px] h-[30px] p-[3px] rounded-[6px] text-[10px] font-medium leading-[12px]"
                                        >
                                          <option value="">Select KPI</option>
                                          {getFilteredKpiOptions(
                                            "kpiData",
                                            index
                                          ).map((kpiOption) => (
                                            <option
                                              key={kpiOption.id}
                                              value={kpiOption.id.toString()}
                                            >
                                              {kpiOption.kpi_name}{" "}
                                              {kpiOption.note
                                                ? `(${kpiOption.note})`
                                                : ""}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                      <div className={`flex flex-col border-r-2 ${row.kpiData.length === 1 || index !== row.kpiData.length - 1
                                        ? "border-b-2"
                                        : ""
                                        } border-[#dbd9d9] border-dashed`}>
                                        <label className="ml-8 text-xs font-bold">
                                          Target
                                        </label>
                                        <div className="relative w-[109px] h-[30px] bg-[#E9ECEB] rounded-[6px] text-cente">
                                          <span className="absolute left-7 top-1/2 transform -translate-y-1/2 text-[10px] font-medium leading-[15px] text-[#8fa59c]">
                                            {row.teamInfo.currency || ""}
                                          </span>
                                          <input
                                            type="text"
                                            value={customKpi.target}
                                            onChange={(e) => {
                                              const newTarget = e.target.value;
                                              setSelectedRow((prevRows) =>
                                                prevRows.map((r, rIndex) =>
                                                  rIndex == rowIndex
                                                    ? {
                                                      ...r,
                                                      kpiData: r.kpiData.map(
                                                        (kpi, kpiIndex) =>
                                                          kpiIndex == index
                                                            ? {
                                                              ...kpi,
                                                              target:
                                                                newTarget,
                                                            }
                                                            : kpi
                                                      ),
                                                    }
                                                    : r
                                                )
                                              );
                                            }}
                                            className="bg-[#E9ECEB] placeholder-[#8fa59c] text-center border-none w-[109px] h-[30px] p-[10px] rounded-[6px] text-[10px] font-medium leading-[15px]"
                                          />
                                        </div>
                                      </div>
                                      <div className={`flex flex-col border-r-2 ${row.kpiData.length === 1 || index !== row.kpiData.length - 1
                                        ? "border-b-2"
                                        : ""
                                        } border-[#dbd9d9] border-dashed`}>
                                        <label className="ml-6 text-xs font-bold">
                                          Weighting
                                        </label>
                                        <div className="relative">
                                          <input
                                            type="number"
                                            value={customKpi.weighting}
                                            onChange={(e) => {
                                              const newWeighting =
                                                e.target.value;
                                              setSelectedRow((prevRows) =>
                                                prevRows.map((r, rIndex) =>
                                                  rIndex == rowIndex
                                                    ? {
                                                      ...r,
                                                      kpiData: r.kpiData.map(
                                                        (kpi, kpiIndex) =>
                                                          kpiIndex == index
                                                            ? {
                                                              ...kpi,
                                                              weighting:
                                                                newWeighting,
                                                            }
                                                            : kpi
                                                      ),
                                                    }
                                                    : r
                                                )
                                              );
                                            }}
                                            className="bg-[#E9ECEB] placeholder-[#8fa59c] text-center border-none w-[109px] h-[30px] p-[10px] rounded-[6px] text-[10px] font-medium leading-[15px]"
                                          />
                                          {customKpi.weighting && (
                                            <span className="absolute right-[105px] top-1/2 transform -translate-y-1/2 text-[#8fa59c] text-[10px] font-medium pointer-events-none">
                                              %
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      <div className={`flex flex-col border-r-2 ${row.kpiData.length === 1 || index !== row.kpiData.length - 1
                                        ? "border-b-2"
                                        : ""
                                        } border-[#dbd9d9] border-dashed`}>
                                        <label className="ml-2 text-xs font-bold">
                                          Opportunity
                                        </label>
                                        <div className="relative w-[109px] h-[30px] bg-[#E9ECEB] rounded-[6px] text-center">
                                          <span className="absolute left-7 top-1/2 transform -translate-y-1/2 text-[10px] font-medium leading-[15px] text-[#8fa59c]">
                                            {row.teamInfo.currency || ""}
                                          </span>
                                          <input
                                            type="text"
                                            className="w-full h-full pl-10 pr-2 text-center bg-transparent border-none placeholder-[#8fa59c] text-[10px] font-medium leading-[15px]"
                                            readOnly
                                            value={parseFloat(
                                              (customKpi.weighting / 100) *
                                              row.teamInfo.opportunity
                                            ).toFixed(2)}
                                          />
                                        </div>
                                      </div>

                                      <div className={`flex flex-col ${row.kpiData.length === 1 || index !== row.kpiData.length - 1
                                          ? "border-b-2"
                                          : ""
                                        } border-[#dbd9d9] border-dashed`}>
                                        <label className="ml-4 text-xs font-bold">
                                          Gatekeeper
                                        </label>
                                        <input
                                          type="text"
                                          value={customKpi.gatekeeper}
                                          disabled={
                                            (row.kpiData.some(
                                              (kpi) => kpi.gatekeeper
                                            ) ||
                                              row.customKpiData.some(
                                                (kpi) => kpi.Custom_Gatekeeper
                                              )) &&
                                            !customKpi.gatekeeper
                                          }
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            const teamId = row.id;

                                            setSelectedRow((prevRows) =>
                                              prevRows.map((r, rIndex) =>
                                                rIndex == rowIndex
                                                  ? {
                                                    ...r,
                                                    kpiData: r.kpiData.map(
                                                      (kpi, kpiIndex) =>
                                                        kpiIndex == index
                                                          ? {
                                                            ...kpi,
                                                            gatekeeper:
                                                              value,
                                                          }
                                                          : kpi
                                                    ),
                                                  }
                                                  : r
                                              )
                                            );
                                            const hasAnyGatekeeper =
                                              value ||
                                              row.kpiData.some(
                                                (kpi, idx) =>
                                                  idx != index && kpi.gatekeeper
                                              ) ||
                                              row.customKpiData.some(
                                                (kpi) => kpi.Custom_Gatekeeper
                                              );

                                            setGatekeeperSet((prev) => ({
                                              ...prev,
                                              [teamId]: hasAnyGatekeeper,
                                            }));
                                          }}
                                          className="bg-[#E9ECEB] placeholder-[#8fa59c] text-center border-none w-[109px] h-[30px] p-[10px] rounded-[6px] text-[10px] font-medium leading-[15px]"
                                        />
                                      </div>
                                    </div>
                                  ))}
                                  {row.customKpiData.map((customKpi, index) => (
                                    <div
                                      key={index}
                                      className="grid grid-cols-5 gap-4 mt-4"
                                    >
                                      <div className={`flex flex-col border-r-2 ${index === row.customKpiData.length - 1
                                        ? ""
                                        : "border-b-2"
                                        } border-[#dbd9d9] border-dashed`}>
                                        <label className="text-[10px] font-bold ml-2">
                                          Custom KPI Name
                                        </label>
                                        <select
                                          value={
                                            customKpi.Custom_KPI_ID?.toString() ||
                                            ""
                                          }
                                          onChange={(e) => {
                                            const newValue = e.target.value;
                                            const isKpiIdUsed = selectedRow[
                                              rowIndex
                                            ].kpiData.some(
                                              (kpi) =>
                                                kpi.kpi_Name_ID == newValue
                                            );

                                            if (isKpiIdUsed) {
                                              alert(
                                                "This KPI is already selected in KPIs section"
                                              );
                                              return;
                                            }
                                            const selectedKpi = kpis.find(
                                              (kpi) =>
                                                kpi.id.toString() == newValue
                                            );

                                            const updatedCustomKpiData = [
                                              ...selectedRow[rowIndex]
                                                .customKpiData,
                                            ];
                                            updatedCustomKpiData[index] = {
                                              ...updatedCustomKpiData[index],
                                              Custom_KPI_ID: parseInt(newValue),
                                              Custom_KPI_Name: selectedKpi
                                                ? selectedKpi.kpi_name
                                                : "",
                                            };
                                            const updatedRows = [
                                              ...selectedRow,
                                            ];
                                            updatedRows[rowIndex] = {
                                              ...updatedRows[rowIndex],
                                              customKpiData:
                                                updatedCustomKpiData,
                                            };

                                            setSelectedRow(updatedRows);
                                          }}
                                          className="bg-[#E9ECEB] mb-3 placeholder-[#8fa59c] text-center border-none w-[119px] h-[30px] p-[3px] rounded-[6px] text-[10px] font-medium leading-[12px]"
                                        >
                                          <option value="">Select KPI</option>
                                          {getFilteredKpiOptions(
                                            "customKpiData",
                                            index
                                          ).map((kpiOption) => (
                                            <option
                                              key={kpiOption.id}
                                              value={kpiOption.id.toString()}
                                            >
                                              {kpiOption.kpi_name}{" "}
                                              {kpiOption.note
                                                ? `(${kpiOption.note})`
                                                : ""}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                      <div className={`flex flex-col border-r-2 ${index === row.customKpiData.length - 1
                                        ? ""
                                        : "border-b-2"
                                        } border-[#dbd9d9] border-dashed`}>
                                        <label className="text-[10px] font-bold ml-3">
                                          Custom Target
                                        </label>
                                        <div className="relative w-[109px] h-[30px] bg-[#E9ECEB] rounded-[6px] text-center">
                                          <span className="absolute left-7 top-1/2 transform -translate-y-1/2 text-[10px] font-medium leading-[15px] text-[#8fa59c]">
                                            {row.teamInfo.currency || ""}
                                          </span>
                                          <input
                                            type="number"
                                            value={customKpi.Custom_Target}
                                            onChange={(e) => {
                                              const newTarget = e.target.value;
                                              setSelectedRow((prevRows) =>
                                                prevRows.map((r, rIndex) =>
                                                  rIndex == rowIndex
                                                    ? {
                                                      ...r,
                                                      customKpiData:
                                                        r.customKpiData.map(
                                                          (kpi, kpiIndex) =>
                                                            kpiIndex == index
                                                              ? {
                                                                ...kpi,
                                                                Custom_Target:
                                                                  newTarget,
                                                              }
                                                              : kpi
                                                        ),
                                                    }
                                                    : r
                                                )
                                              );
                                            }}
                                            className="bg-[#E9ECEB] placeholder-[#8fa59c] text-center border-none w-[109px] h-[30px] p-[10px] rounded-[6px] text-[10px] font-medium leading-[15px]"
                                          />
                                        </div>
                                      </div>

                                      <div className={`flex flex-col border-r-2 ${index === row.customKpiData.length - 1
                                        ? ""
                                        : "border-b-2"
                                        } border-[#dbd9d9] border-dashed`}>
                                        <label className="text-[10px] font-bold ml-1">
                                          Custom Weighting
                                        </label>
                                        <div className="relative">
                                          <input
                                            type="number"
                                            value={customKpi.Custom_Weighting}
                                            onChange={(e) => {
                                              const newWeighting =
                                                e.target.value;
                                              setSelectedRow((prevRows) =>
                                                prevRows.map((r, rIndex) =>
                                                  rIndex == rowIndex
                                                    ? {
                                                      ...r,
                                                      customKpiData:
                                                        r.customKpiData.map(
                                                          (kpi, kpiIndex) =>
                                                            kpiIndex == index
                                                              ? {
                                                                ...kpi,
                                                                Custom_Weighting:
                                                                  newWeighting,
                                                              }
                                                              : kpi
                                                        ),
                                                    }
                                                    : r
                                                )
                                              );
                                            }}
                                            className="bg-[#E9ECEB] placeholder-[#8fa59c] text-center border-none w-[109px] h-[30px] p-[10px] rounded-[6px] text-[10px] font-medium leading-[15px]"
                                          />
                                          {customKpi.Custom_Weighting && (
                                            <span className="absolute right-[105px] top-1/2 transform -translate-y-1/2 text-[#8fa59c] text-[10px] font-medium pointer-events-none">
                                              %
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      <div className={`flex flex-col border-r-2 ${index === row.customKpiData.length - 1
                                        ? ""
                                        : "border-b-2"
                                        } border-[#dbd9d9] border-dashed`}>
                                        <label className="text-[10px] font-bold ml-5">
                                          Opportunity
                                        </label>
                                        <div className="relative w-[109px] h-[30px] bg-[#E9ECEB] rounded-[6px] text-center">
                                          <span className="absolute left-7 top-1/2 transform -translate-y-1/2 text-[10px] font-medium leading-[15px] text-[#8fa59c]">
                                            {row.teamInfo.currency || ""}
                                          </span>
                                          <input
                                            type="text"
                                            className="w-full h-full pl-10 pr-2 text-center bg-transparent border-none placeholder-[#8fa59c] text-[10px] font-medium leading-[15px]"
                                            readOnly
                                            value={parseFloat(
                                              (customKpi.Custom_Weighting /
                                                100) *
                                              row.teamInfo.opportunity
                                            ).toFixed(2)}
                                          />
                                        </div>
                                      </div>

                                      <div className={`flex flex-col ${index === row.customKpiData.length - 1
                                        ? ""
                                        : "border-b-2"
                                        } border-[#dbd9d9] border-dashed`}>
                                        <label className="text-[10px] font-bold">
                                          Custom Gatekeeper
                                        </label>
                                        <input
                                          type="text"
                                          value={
                                            customKpi.Custom_Gatekeeper || ""
                                          }
                                          disabled={
                                            (row.kpiData.some(
                                              (kpi) => kpi.gatekeeper
                                            ) ||
                                              row.customKpiData.some(
                                                (kpi) => kpi.Custom_Gatekeeper
                                              )) &&
                                            !customKpi.Custom_Gatekeeper
                                          }
                                          onChange={(e) => {
                                            const newValue = e.target.value;
                                            const updatedCustomKpiData = [
                                              ...row.customKpiData,
                                            ];
                                            updatedCustomKpiData[index] = {
                                              ...updatedCustomKpiData[index],
                                              Custom_Gatekeeper: newValue,
                                            };
                                            const updatedRows = [
                                              ...selectedRow,
                                            ];
                                            updatedRows[rowIndex] = {
                                              ...selectedRow[rowIndex],
                                              customKpiData:
                                                updatedCustomKpiData,
                                            };
                                            setSelectedRow(updatedRows);
                                            const hasAnyGatekeeper =
                                              newValue ||
                                              row.kpiData.some(
                                                (kpi) => kpi.gatekeeper
                                              ) ||
                                              updatedCustomKpiData.some(
                                                (kpi, idx) =>
                                                  idx != index &&
                                                  kpi.Custom_Gatekeeper
                                              );
                                            setGatekeeperSet((prev) => ({
                                              ...prev,
                                              [row.id]: hasAnyGatekeeper,
                                            }));
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
                                  onClick={() => {
                                    setSelectedRow(null);
                                    setEditingRow(null);
                                  }}
                                  className="px-4 py-2 mr-2 text-white bg-red-700 rounded-lg hover:bg-red-800"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleSaveKpi(selectedRow, rowIndex, row)
                                  }
                                  className="px-4 py-2 text-white bg-green-700 rounded-lg hover:bg-green-800"
                                >
                                  Save
                                </button>
                              </div>
                            </form>
                          </div>
                        </td>
                      </tr>
                    ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="flex flex-col justify-center w-1/6 p-6 bg-white rounded-lg shadow-lg">
              <h2 className="mb-4 text-lg font-bold">Update Commission</h2>
              {selectedRow && (
                <div className="flex flex-col items-center justify-center mb-6">
                  <label className="text-xs font-bold">Commission</label>
                  <input
                    type="number"
                    value={
                      selectedRow[updateCommission]?.teamInfo.opportunity || ""
                    }
                    onChange={(e) => {
                      const newValue = e.target.value;

                      setSelectedRow((prevRows) =>
                        prevRows.map((row) => {
                          if (row.id == selectedRow[updateCommission]?.id) {
                            return {
                              ...row,
                              teamInfo: {
                                ...row.teamInfo,
                                opportunity: newValue,
                              },
                            };
                          }
                          return row;
                        })
                      );
                    }}
                    className="bg-[#E9ECEB] placeholder-[#8fa59c] text-center border-none w-[109px] h-[30px] p-[10px] rounded-[6px] text-[10px] font-medium leading-[15px]"
                  />
                </div>
              )}
              <div className="flex justify-between space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    const isConfirmed = window.confirm(
                      "Are you sure you want to update?"
                    );
                    if (isConfirmed) {
                      handleSaveKpi(
                        selectedRow,
                        updateCommission,
                        selectedRow[updateCommission]
                      );
                    }
                  }}
                  className="px-2 py-2 text-white bg-green-700 rounded-lg hover:bg-green-800"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                  }}
                  className="px-4 py-2 text-white bg-red-700 rounded-lg hover:bg-red-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage == 1}
          className="px-3 py-1 mr-2 text-lg font-medium text-[#072D20] rounded-md bg-white border-2 border-gray-300"
        >
          {`<`}
        </button>
        {Array.from(
          { length: Math.ceil(filteredAgents.length / agentsPerPage) },
          (_, i) => (
            <button
              key={i}
              onClick={() => paginate(i + 1)}
              className={`px-4 py-2 mx-1 text-sm font-medium ${currentPage == i + 1
                ? "bg-lGreen text-black"
                : "bg-lGreen text-black hover:text-black"
                } rounded-md`}
            >
              {i + 1}
            </button>
          )
        )}
        <button
          onClick={() =>
            setCurrentPage((prev) =>
              Math.min(
                prev + 1,
                Math.ceil(filteredAgents.length / agentsPerPage)
              )
            )
          }
          disabled={
            currentPage == Math.ceil(filteredAgents.length / agentsPerPage)
          }
          className="px-3 py-1 ml-2 text-lg font-medium text-[#072D20] rounded-md bg-white border-2 border-gray-300"
        >
          {`>`}
        </button>
      </div>
    </>
  );
};

export default TeamLeaderKpiTable;
