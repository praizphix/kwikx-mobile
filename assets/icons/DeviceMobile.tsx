import Svg, { Path } from "react-native-svg";

export function PhDeviceMobile({
  size = "16px",
  color,
  type = "default",
}: {
  size?: string;
  color: string;
  type?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 256 256">
      <Path
        fill={color}
        d={
          type === "fill"
            ? ""
            : type === "bold"
            ? ""
            : "M176 16H80a24 24 0 0 0-24 24v176a24 24 0 0 0 24 24h96a24 24 0 0 0 24-24V40a24 24 0 0 0-24-24M72 64h112v128H72Zm8-32h96a8 8 0 0 1 8 8v8H72v-8a8 8 0 0 1 8-8m96 192H80a8 8 0 0 1-8-8v-8h112v8a8 8 0 0 1-8 8"
        }
      ></Path>
    </Svg>
  );
}
