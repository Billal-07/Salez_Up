import React, { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { FaChevronDown, FaBell } from "react-icons/fa";
import img from "../../public/images/image.jpg";
import { toast, ToastContainer } from "react-toastify";

const Navbar = () => {
  const [profilePic, setProfilePic] = useState();
  useEffect(() => {
    const images = localStorage.getItem("managerImage");
    if (images == "null") {
      setProfilePic(img);
      return;
    } else {
      setProfilePic(images);
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logout Successfully");
    window.close();

    // setTimeout(() => {
    //   window.close();
    // }, 3000);
  };

  return (
    <>
      <nav className="flex md:flex-row flex-col items-center justify-between py-[20px] px-[30px]">
        <div>
          <img src="/images/logo.png" alt="" className="w-[197px] h-[40px]" />
        </div>
        <div className="flex gap-[20px] flex-col sm:flex-row items-center">
          <div className="flex items-center">
            <button className="text-[#000] gap-[12px] flex items-center">
              <img
                src={profilePic}
                alt=""
                className="rounded-full w-[38px] h-[38px]"
              />
              <div className="text-left text-[14px]">
                <h1 className="font-medium">
                  {localStorage.getItem("managerRole")}
                </h1>
                <p>{localStorage.getItem("userFName")}</p>
              </div>
              <FaChevronDown className="text-[22px]" />
            </button>
          </div>
          <div className="flex flex-row items-center gap-[25px]">
            <div className="relative">
              <FaBell className="text-[25px]" />
              <div className="text-[#fff] absolute text-[14px] font-medium text-center rounded-full bg-themeGreen -top-2 -right-2 w-[20px] h-[20px] ">
                0
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-[104px] h-[36px] items-center justify-center  bg-themeGreen flex gap-[10px] rounded-[8px]"
            >
              {" "}
              <LogOut className="w-[15px] h-[15px]" />{" "}
              <span className="font-[500] text-[12px]">Log out</span>
            </button>
          </div>
        </div>
      </nav>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />
    </>
  );
};

export default Navbar;
