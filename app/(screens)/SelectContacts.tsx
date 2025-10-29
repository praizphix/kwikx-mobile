import { ScrollView } from "react-native";
import React from "react";
import SearchBox from "@/components/ui/SearchBox";
import ContactList from "@/components/ContactList";
import PageTitle from "@/components/ui/PageTitle";

const SelectContacts = () => {
  return (
    <ScrollView className="bg-white dark:bg-n0  pt-4 min-h-dvh">
      <PageTitle title="Select Contact" isBgWhite={true} />

      <SearchBox />
      <ContactList />
    </ScrollView>
  );
};

export default SelectContacts;
