import { Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const marginLeftRight = {
  marginLeft: SCREEN_WIDTH * 0.05,
  marginRight: SCREEN_WIDTH * 0.05,
};

// Make Grid With Flexbox

export const gridGap = (gapInDecimal: number) => {
  const flexGap = SCREEN_WIDTH * gapInDecimal;

  return { gap: flexGap };
};

export const gridItemWidth = (
  gapInDecimal: number,
  gridTotalColumn: number
) => {
  const gridColWidth =
    (SCREEN_WIDTH -
      marginLeftRight.marginLeft * 2 -
      SCREEN_WIDTH * gapInDecimal * (gridTotalColumn - 1)) /
      gridTotalColumn -
    0.001;

  return { width: gridColWidth };
};
