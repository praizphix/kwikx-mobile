import Svg, { Path } from "react-native-svg";

export function PhArrowsDownUp({
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
            : "M117.66 170.34a8 8 0 0 1 0 11.32l-32 32a8 8 0 0 1-11.32 0l-32-32a8 8 0 0 1 11.32-11.32L72 188.69V48a8 8 0 0 1 16 0v140.69l18.34-18.35a8 8 0 0 1 11.32 0m96-96l-32-32a8 8 0 0 0-11.32 0l-32 32a8 8 0 0 0 11.32 11.32L168 67.31V208a8 8 0 0 0 16 0V67.31l18.34 18.35a8 8 0 0 0 11.32-11.32"
        }
      ></Path>
    </Svg>
  );
}
