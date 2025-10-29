import React, { useState } from "react";
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const useModalAnimation = () => {
  const [show, setShow] = useState<boolean | null>(null);
  //modal shared vlaues
  const modalZIndex = useSharedValue(-60);
  const modalBgOpacity = useSharedValue(0);

  //modal animated styles
  const modalBgAnimatedStyles = useAnimatedStyle(() => {
    return {
      opacity: modalBgOpacity.value,
      zIndex: modalZIndex.value,
    };
  });

  const modalAnimation = () => {
    modalBgOpacity.value = withTiming(modalBgOpacity.value === 0 ? 1 : 0, {
      duration: 300,
    });
    modalZIndex.value = modalZIndex.value === -60 ? 60 : -60;
  };

  return { modalBgAnimatedStyles, modalAnimation };
};

export default useModalAnimation;
