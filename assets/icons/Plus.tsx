import Svg, { Path } from "react-native-svg";

export function PhPlus({
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
            : "M224 128a8 8 0 0 1-8 8h-80v80a8 8 0 0 1-16 0v-80H40a8 8 0 0 1 0-16h80V40a8 8 0 0 1 16 0v80h80a8 8 0 0 1 8 8"
        }
      ></Path>
    </Svg>
  );
}
