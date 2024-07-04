import React from "react";

const RateSvg = (props) => {
  return (
    <svg
      width="25"
      height="25"
      viewBox="0 0 25 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clip-path="url(#clip0_4855_2229)">
        <path
          d="M23.7266 11.668H18.7266C18.4613 11.668 18.207 11.7733 18.0195 11.9609C17.8319 12.1484 17.7266 12.4028 17.7266 12.668V21.668C17.7266 21.9332 17.8319 22.1875 18.0195 22.3751C18.207 22.5626 18.4613 22.668 18.7266 22.668H23.7266C23.9918 22.668 24.2461 22.5626 24.4337 22.3751C24.6212 22.1875 24.7266 21.9332 24.7266 21.668V12.668C24.7266 12.4028 24.6212 12.1484 24.4337 11.9609C24.2461 11.7733 23.9918 11.668 23.7266 11.668ZM23.7266 20.668H18.7266V13.668H23.7266V20.668ZM20.7266 2.66797H2.72656C1.61656 2.66797 0.726562 3.55797 0.726562 4.66797V16.668C0.726563 17.1984 0.937276 17.7071 1.31235 18.0822C1.68742 18.4573 2.19613 18.668 2.72656 18.668H9.72656V20.668H7.72656V22.668H15.7266V20.668H13.7266V18.668H15.7266V16.668H2.72656V4.66797H20.7266V9.66797H22.7266V4.66797C22.7266 3.55797 21.8266 2.66797 20.7266 2.66797ZM12.6966 9.66797L11.7266 6.66797L10.7566 9.66797H7.72656L10.1966 11.428L9.25656 14.338L11.7266 12.538L14.1966 14.338L13.2566 11.428L15.7266 9.66797H12.6966Z"
          fill={props.selectedKeys === "7" ? "#fff" : "#0B649D"}
        />
      </g>
      <defs>
        <clipPath id="clip0_4855_2229">
          <rect
            width="24"
            height="24"
            fill="white"
            transform="translate(0.726562 0.667969)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

export default RateSvg;
