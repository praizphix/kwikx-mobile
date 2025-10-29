import Svg, { Path } from "react-native-svg";

export function IconName({
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
        d={type === "fill" ? "" : type === "bold" ? "" : ""}
      ></Path>
    </Svg>
  );
}
