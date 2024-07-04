import { Image } from "antd";
import React, { useState } from "react";

function ImagePreview(props) {
  const [isPreviewVisible, setPreviewVisible] = useState(false);
  return (
    <>
      <Image
        width={props.width}
        height={props.width ? props.width : "100%"}
        preview={{
          visible: isPreviewVisible,
          onVisibleChange: (visible, prevVisible) => setPreviewVisible(visible),
        }}
        src={props.data}
      />
    </>
  );
}

export default ImagePreview;
