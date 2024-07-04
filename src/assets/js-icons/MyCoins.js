import React from "react";

const MyCoinsSvg = (props) => {
  return (
    <svg
      width="22"
      height="21"
      viewBox="0 0 22 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15.7266 0.327148C12.9666 0.327148 10.7266 2.56715 10.7266 5.32715C10.7266 8.08715 12.9666 10.3271 15.7266 10.3271C18.4866 10.3271 20.7266 8.08715 20.7266 5.32715C20.7266 2.56715 18.4866 0.327148 15.7266 0.327148ZM15.7266 8.32715C14.0666 8.32715 12.7266 6.98715 12.7266 5.32715C12.7266 3.66715 14.0666 2.32715 15.7266 2.32715C17.3866 2.32715 18.7266 3.66715 18.7266 5.32715C18.7266 6.98715 17.3866 8.32715 15.7266 8.32715ZM18.7266 14.3271H16.7266C16.7266 13.1271 15.9766 12.0471 14.8566 11.6271L8.69656 9.32715H0.726562V20.3271H6.72656V18.8871L13.7266 20.8271L21.7266 18.3271V17.3271C21.7266 15.6671 20.3866 14.3271 18.7266 14.3271ZM4.72656 18.3271H2.72656V11.3271H4.72656V18.3271ZM13.6966 18.7371L6.72656 16.8271V11.3271H8.33656L14.1566 13.4971C14.4966 13.6271 14.7266 13.9571 14.7266 14.3271C14.7266 14.3271 12.7266 14.2771 12.4266 14.1771L10.0466 13.3871L9.41656 15.2871L11.7966 16.0771C12.3066 16.2471 12.8366 16.3271 13.3766 16.3271H18.7266C19.1166 16.3271 19.4666 16.5671 19.6266 16.8971L13.6966 18.7371Z"
        fill={props.selectedKeys === "4" ? "#fff" : "#0B649D"}
      />
    </svg>
  );
};

export default MyCoinsSvg;
