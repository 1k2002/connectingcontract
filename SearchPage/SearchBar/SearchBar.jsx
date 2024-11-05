import React, { useEffect, useState } from "react";
import { BsSearch, BsArrowRight } from "react-icons/bs";

// INTERNAL IMPORT
import Style from "./SearchBar.module.css";

const SearchBar = ({ onHandleSearch, onClearSearch }) => {
  const [search, setSearch] = useState("");
  const [searchItem, setSearchItem] = useState(search);

  // Update search state with debounce effect
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchItem), 1000);
    return () => clearTimeout(timer); // Fixing the typo here
  }, [searchItem]);

  // Call onHandleSearch or onClearSearch based on search state
  useEffect(() => {
    if (search) {
      onHandleSearch(search);
    } else {
      onClearSearch();
    }
  }, [search, onHandleSearch, onClearSearch]); // Adding dependencies here

  return (
    <div className={Style.SearchBar}>
      <div className={Style.SearchBar_box}>
        <BsSearch className={Style.SearchBar_box_icon} />
        <input
          type="text"
          placeholder="Type your keyword..."
          onChange={(e) => setSearchItem(e.target.value)}
          value={searchItem}
        />
        <BsArrowRight className={Style.SearchBar_box_icon} />
      </div>
    </div>
  );
};

export default SearchBar;

// import React, {useEffect, useState} from "react";
// import { BsSearch, BsArrowRight } from "react-icons/bs";

// //INTERNAL IMPORT
// import Style from "./SearchBar.module.css";
// const SearchBar = ( onHandleSearch, onClearSearch ) => {
  
//   const [search, setSearch,] = useState("");
//   const [searchItem, setSearchItem] = useState(search);

//   useEffect(() => {
//     const timer = setTimeout(() => setSearch(searchItem), 1000);
//     return () => cleaarTimeout(timer);
//   }, [searchItem]);

//   useEffect( () => {
//     if(search){
//       onHandleSearch(search);
//     } else {
//       onClearSearch();
//     }
//   }, [search] );

//   return (
//     <div className={Style.SearchBar}>
//       <div className={Style.SearchBar_box}>
//         <BsSearch className={Style.SearchBar_box_icon} />
//         <input type="text" placeholder="Type yout keyword..." 
//           onChange={(e) => setSearchItem(e.target.value)}
//           value = {searchItem}
//         />
//         <BsArrowRight className={Style.SearchBar_box_icon} />
//       </div>
//     </div>
//   );
// };

// export default SearchBar;
