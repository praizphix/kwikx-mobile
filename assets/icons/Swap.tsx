import Svg, { Path } from "react-native-svg";

export function PhSwap({
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
            : "M224 48v104a16 16 0 0 1-16 16H99.31l10.35 10.34a8 8 0 0 1-11.32 11.32l-24-24a8 8 0 0 1 0-11.32l24-24a8 8 0 0 1 11.32 11.32L99.31 152H208V48H96v8a8 8 0 0 1-16 0v-8a16 16 0 0 1 16-16h112a16 16 0 0 1 16 16m-56 144a8 8 0 0 0-8 8v8H48V104h108.69l-10.35 10.34a8 8 0 0 0 11.32 11.32l24-24a8 8 0 0 0 0-11.32l-24-24a8 8 0 0 0-11.32 11.32L156.69 88H48a16 16 0 0 0-16 16v104a16 16 0 0 0 16 16h112a16 16 0 0 0 16-16v-8a8 8 0 0 0-8-8"
        }
      ></Path>
    </Svg>
  );
}
