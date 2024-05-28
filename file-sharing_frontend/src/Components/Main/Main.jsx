import React, { useState, useEffect, useCallback, useRef } from "react";
import "./Main.css";
import Herosection from "../Herosection/Herosection";
import Sidebar from "../Sidebar/Sidebar";
import Preview from "../Preview/Preview";
import cookies from "js-cookie";
import debounce from "lodash.debounce";

function Main() {
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [folderStructure, setFolderStructure] = useState({ Storage: {} });
  const [currentPath, setCurrentPath] = useState(["Mainfolder"]);
  const [previewData, setPreviewData] = useState("");
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [navbardata, setnavbardata] = useState("");
  const [comment, setcomment] = useState(false);
  const [storage, setstorage] = React.useState(0);
  const [sharedtoggle, setsharedtoggle] = useState(false);
  const [filedata, setfiledata] = useState([]);
  const [popupvisible, setpopupvisible] = useState(false);
  const [popupdata, setpopupdata] = useState("");
  const [commentdata, setcommentdata] = useState("");
  const token = cookies.get("token");
  const isInitialMount = useRef(true);
  // Fetch folder data when the component mounts
  useEffect(() => {
    const fetchFolderData = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/folder-struc/folder-get",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        if (response.ok) {
          setFolderStructure(data || { Storage: {} });
        } else {
          console.log("No data to display.");
        }
      } catch (error) {
        console.error("Error fetching folder data:", error);
      }
    };
    fetchFolderData();
  }, [token]);

  // Debounced function to upload folder data
  const uploadFolderData = useCallback(
    debounce(async (data) => {
      try {
        const response = await fetch(
          "http://localhost:4000/folder-struc/folder-set",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
          }
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
      } catch (error) {
        console.error("Error uploading folder data:", error);
      }
    }, 10000),
    []
  );

  // Upload folder data when there's a meaningful change
  useEffect(() => {
    if (!isInitialMount.current) {
      uploadFolderData({ folder: folderStructure });
    } else {
      isInitialMount.current = false;
    }
  }, [folderStructure, uploadFolderData]);

  // Handle folder click event
  const handleFolderClick = (path, folderName, content) => {
    setSelectedFolder({ folderName, content });
    setCurrentPath(path);
  };

  // Get the last nested object in a given object
  const getLastNestedObject = (obj, path = []) => {
    if (Object.keys(obj).length === 0) {
      return path;
    }
    const keys = Object.keys(obj);
    const lastKey = keys[keys.length - 1];
    const newPath = [...path, lastKey];
    return getLastNestedObject(obj[lastKey], newPath);
  };

  // Create a new folder in the current path
  const createNewFolder = (newFolderName) => {
    if (currentPath.length > 7) {
      alert("You cannot create folders more than 6 levels deep.");
      return;
    }

    setFolderStructure((prevStructure) => {
      const newStructure = { ...prevStructure };
      let currentLevel = newStructure;

      currentPath.forEach((folder) => {
        if (!currentLevel[folder]) {
          currentLevel[folder] = {};
        }
        currentLevel = currentLevel[folder];
      });

      if (!currentLevel[newFolderName]) {
        currentLevel[newFolderName] = {};
      }
      setCurrentPath([...currentPath, newFolderName]);
      return newStructure; // Return the updated structure
    });
  };

  // Handle preview section
  const previewsection = (data) => {
    setPreviewData(data);
    setIsPreviewVisible(!isPreviewVisible);
  };
  const popupsection = (data) => {
    setpopupdata(data);
    setpopupvisible(!popupvisible);
    console.log(popupvisible);
  };
  const commentpreviewsection = (data) => {
    setcomment(!comment);
    setPreviewData(data);
    setIsPreviewVisible(!isPreviewVisible);
  };
  useEffect(() => {
    if (navbardata) {
      console.log(navbardata);
      setIsPreviewVisible(true); // Show the preview section
    } else {
      setIsPreviewVisible(false); // Hide the preview section
    }
  }, [navbardata]);
  console.log(commentdata);
  return (
    <div className="Main__container">
      <Sidebar
        folders={folderStructure}
        onFolderClick={handleFolderClick}
        createNewFolder={createNewFolder}
        currentPath={currentPath}
        storage={storage}
        setsharedtoggle={setsharedtoggle}
        popupvisible={popupvisible}
      />
      <Herosection
        folderstructure={folderStructure}
        selectedFolder={selectedFolder}
        previewsection={previewsection}
        visibility={isPreviewVisible}
        previewData={previewData}
        setnavbardata={setnavbardata}
        setcomment={setcomment}
        setstorage={setstorage}
        sharedtoggle={sharedtoggle}
        setfiledata={setfiledata}
        filedata={filedata}
        popupsection={popupsection}
        popupvisible={popupvisible}
        commentdata={commentdata}
      />
      <Preview
        visibility={isPreviewVisible}
        previewsection={previewsection}
        commentsection={commentpreviewsection}
        previewData={previewData}
        navbardata={navbardata}
        comment={comment}
        popupvisible={popupvisible}
        setcommentdata={setcommentdata}
      />
    </div>
  );
}

export default Main;
