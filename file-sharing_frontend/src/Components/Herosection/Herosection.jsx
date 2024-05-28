import React from "react";
import "./Herosection.css";
import Navbar from "./Navbar/Navbar";
import Recent from "./Recent/Recent";
import Tablesection from "./Tablesection/Tablesection";
import Searchsection from "./Searchsection/Searchsection";
function Herosection(props) {
  console.log(props.filedata);
  return (
    <div
      className={
        props.visibility
          ? "Herosection__container"
          : "Herosection__container--redefined"
      }
    >
      {" "}
      <Navbar
        // preview={props.previewsection}
        setnavbardata={props.setnavbardata}
        setfiledata={props.setfiledata}
        popupvisible={props.popupvisible}
      />
      <Recent
        previewdata={props.previewData}
        visibility={props.visibility}
        popupsection={props.popupsection}
        popupvisible={props.popupvisible}
        commentdata={props.commentdata}
      />
      {Array.isArray(props.filedata) && props.filedata.length > 0 ? (
        <Searchsection
          setcomment={props.setcomment}
          preview={props.previewsection}
          folderstructure={props.folderstructure}
          setstorage={props.setstorage}
          sharedtoggle={props.sharedtoggle}
          filesdata={props.filedata}
        />
      ) : (
        <Tablesection
          setcomment={props.setcomment}
          preview={props.previewsection}
          folderstructure={props.folderstructure}
          setstorage={props.setstorage}
          sharedtoggle={props.sharedtoggle}
          popupvisible={props.popupvisible}
        />
      )}
    </div>
  );
}

export default Herosection;
