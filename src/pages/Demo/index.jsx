import { Button, Input, Slider, Switch } from "antd";
import { useState } from 'react';

export default () => {
  const [captionShow, setCaptionShow] = useState(true);

  return <Switch checked={captionShow} onChange={setCaptionShow} />;
};
