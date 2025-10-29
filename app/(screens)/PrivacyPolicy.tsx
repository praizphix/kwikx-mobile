import { ScrollView, StyleSheet, View } from "react-native";
import React from "react";
import PageTitle from "@/components/ui/PageTitle";
import ThemedText from "@/components/ThemedText";

const PrivacyPolicy = () => {
  return (
    <View className="bg-white dark:bg-n900  h-full pt-6">
      <PageTitle title="Privacy Policy" isBgWhite={true} />

      <ScrollView className=" overflow-auto pr-4 text-sm pl-6 ">
        <ThemedText
          className="text-lg dark:text-white"
          text="Terms"
          weight="semiBold"
        />
        <ThemedText
          className="pt-3 text-n500 dark:text-darkN500"
          text="Our platform operates under the following terms and conditions. By
          accessing our services, you agree to abide by these terms. Users must
          use the platform responsibly and in compliance with applicable laws."
        />

        <ThemedText
          className="pt-2 text-n500 dark:text-darkN500"
          text="We are committed to safeguarding your privacy; however, we collect and
          process data as outlined in our Privacy Policy. Any violation of these
          terms may result in account suspension or termination."
        />

        <ThemedText
          className="pt-2 text-n500 dark:text-darkN500"
          text="Always ensure to consult legal professionals for comprehensive legal
          advice and precise policy details."
        />

        <ThemedText
          className="text-lg  pt-5 dark:text-white"
          text="Changes to the Service and/or Terms:"
          weight="semiBold"
        />

        <ThemedText
          className="pt-3 text-n500 dark:text-darkN500"
          text="We reserve the right to modify, suspend, or terminate the services or
          revise these terms at any time. Users will be notified of significant
          alterations through email or by prominent notice on our platform. By
          continuing to use our services after modifications, users agree to
          abide by the updated terms. It's recommended to regularly review the
          terms for any amendments that may affect your usage."
        />

        <ThemedText
          className="pt-2 text-n500 dark:text-darkN500"
          text="Remember, legal content should be reviewed by a legal professional for
          accuracy and compliance.We reserve the right to modify, suspend, or
          terminate the services or revise these terms at any time. Users will
          be notified of significant alterations through email or by prominent
          notice on our platform. By continuing to use our services after"
        />

        <ThemedText
          className="pt-3 text-n500 dark:text-darkN500"
          text="We reserve the right to modify, suspend, or terminate the services or
          revise these terms at any time. Users will be notified of significant
          alterations through email or by prominent notice on our platform. By
          continuing to use our services after modifications, users agree to
          abide by the updated terms. It's recommended to regularly review the
          terms for any amendments that may affect your usage."
        />

        <ThemedText
          className="pt-2 text-n500 dark:text-darkN500 pb-12"
          text="Remember, legal content should be reviewed by a legal professional for
          accuracy and compliance.We reserve the right to modify, suspend, or
          terminate the services or revise these terms at any time. Users will
          be notified of significant alterations through email or by prominent
          notice on our platform. By continuing to use our services after"
        />
      </ScrollView>
    </View>
  );
};

export default PrivacyPolicy;
