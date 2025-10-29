import { Button, Pressable, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { PhCameraRotate } from "@/assets/icons/CameraRotate";
import { PhXCircle } from "@/assets/icons/XCircle";
import { router } from "expo-router";

const OpenCamera = () => {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View className="h-full justify-center items-center flex-col gap-y-4">
        <Text>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  return (
    <View>
      <CameraView facing={facing}>
        <View className="h-full">
          <Pressable
            onPress={() => router.back()}
            className="absolute top-6 right-6"
          >
            <PhXCircle color="white" size="32px" />
          </Pressable>
          <View className=" absolute bottom-0 left-0 right-0 flex justify-center items-center pb-8">
            <TouchableOpacity
              onPress={toggleCameraFacing}
              className="bg-p1 rounded-full p-4"
            >
              <PhCameraRotate color="white" size="24px" />
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
};

export default OpenCamera;
