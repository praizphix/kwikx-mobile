import uuid from "react-native-uuid";

import onBoardingSliderImg1 from "@/assets/images/onboarding-slider-img1.png";
import onBoardingSliderImg2 from "@/assets/images/onboarding-slider-img2.png";
import onBoardingSliderImg3 from "@/assets/images/onboarding-slider-img3.png";

//people image
import people1 from "@/assets/images/people-1.png";
import people2 from "@/assets/images/people-2.png";
import people3 from "@/assets/images/people-3.png";
import people4 from "@/assets/images/people-4.png";
import people5 from "@/assets/images/people-5.png";
import { PhSignOut } from "@/assets/icons/SignOut";
import { PhUser } from "@/assets/icons/User";
import { PhChartLineUp } from "@/assets/icons/ChartLineUp";
import { PhBarcode } from "@/assets/icons/Barcode";
import { PhUsersThree } from "@/assets/icons/UsersThree";
import { PhHouse } from "@/assets/icons/House";
import { PhInfo } from "@/assets/icons/Info";
import { PhLockSimple } from "@/assets/icons/LockSimple";
import { PhCreditCard } from "@/assets/icons/CreditCard";
import { PhKey } from "@/assets/icons/Key";
import { PhSwap } from "@/assets/icons/Swap";
import { PhBell } from "@/assets/icons/BellIcon";
import { PhShieldCheck } from "@/assets/icons/ShieldCheck";
import { PhHeadset } from "@/assets/icons/Headset";
import { PhTranslate } from "@/assets/icons/Translate";
import { PhFile } from "@/assets/icons/File";
import { PhSun } from "@/assets/icons/PhSun";

//card background
import cardBg1 from "@/assets/images/card-bg-1.png";
import cardBg2 from "@/assets/images/card-bg-2.png";
import cardBg3 from "@/assets/images/card-bg-3.png";

//payment methods images
import payoneer from "@/assets/images/payoneer.png";
import card from "@/assets/images/card.png";
import bank from "@/assets/images/bank.png";
import masterCard from "@/assets/images/master-card.png";

//bill page icons
import billIcon1 from "@/assets/images/bill-pay-icon-1.png";
import billIcon2 from "@/assets/images/bill-pay-icon-2.png";
import billIcon3 from "@/assets/images/bill-pay-icon-3.png";
import billIcon4 from "@/assets/images/bill-pay-icon-4.png";
import billIcon5 from "@/assets/images/bill-pay-icon-5.png";
import billIcon6 from "@/assets/images/bill-pay-icon-6.png";
import billIcon7 from "@/assets/images/bill-pay-icon-7.png";
import billIcon8 from "@/assets/images/bill-pay-icon-8.png";
import billIcon9 from "@/assets/images/bill-pay-icon-9.png";
import billIcon10 from "@/assets/images/bill-pay-icon-10.png";

export const onbordingSliderData = [
  {
    id: 1,
    img: onBoardingSliderImg1,
    title: "Quiz On the Go",
    description:
      "Answer a quiz for a shot at winning thrilling prizes! Test your knowledge and win big!",
  },
  {
    id: 2,
    img: onBoardingSliderImg2,
    title: "Knowledge Boosting",
    description: "Find fun and interesting quizzes to boost up your knowledge",
  },
  {
    id: 3,
    img: onBoardingSliderImg3,
    title: "Win Rewards Galore",
    description: "Find fun and interesting quizzes to boost up your knowledge",
  },
];

export const transactionsList = [
  {
    id: uuid.v4(),
    date: "Today",
    transactions: [
      {
        id: uuid.v4(),
        img: people1,
        name: "Beulah Miller",
        time: "02:58 AM",
        amount: "100",
        type: "Incoming Request",
        link: "/IncomingRequest",
      },
      {
        id: uuid.v4(),
        img: people5,
        name: "Smith Miller",
        time: "03:58 AM",
        amount: "100",
        type: "Bill Pay",
        link: "/TransactionDetails",
      },
      {
        id: uuid.v4(),
        img: people2,
        name: "Gerald Erickson",
        time: "07:58 PM",
        amount: "992",
        type: "Received",
        link: "/MoneyReceived",
      },
      {
        id: uuid.v4(),
        img: people3,
        name: "Clara Gardner",
        time: "01:14 PM",
        amount: "709",
        type: "Sent",
        link: "/MoneySent",
      },
      {
        id: uuid.v4(),
        // img: people2,
        icon: PhSignOut,
        name: "Allen George",
        time: "02:37 AM",
        amount: "087",
        type: "Withdraw",
        link: "/MoneyWithdraw",
      },
    ],
  },
  {
    id: uuid.v4(),
    date: "Yesterday",
    transactions: [
      {
        id: uuid.v4(),
        img: people4,
        name: "Chad Oliver",
        time: "07:38 AM",
        amount: "555",
        type: "Outgoing Request",
        link: "/OutgoingRequest",
      },
      {
        id: uuid.v4(),
        img: people5,
        name: "Mabel Walsh",
        time: "02:24 PM",
        amount: "089",
        type: "Withdraw",
        link: "/MoneyWithdraw",
      },
      {
        id: uuid.v4(),
        img: people1,
        name: "Gertrude Freeman",
        time: "11:52 AM",
        amount: "261",
        type: "Sent",
        link: "/MoneySent",
      },
    ],
  },
  {
    id: uuid.v4(),
    date: "Jan 22, 2025",
    transactions: [
      {
        id: uuid.v4(),
        img: people2,
        name: "Allen George",
        time: "02:37 AM",
        amount: "087",
        type: "Withdraw",
        link: "/MoneyWithdraw",
      },
      {
        id: uuid.v4(),
        img: people3,
        name: "Miguel Soto",
        time: "03:02 AM",
        amount: "517",
        type: "Top Up",
        link: "/MoneyTopUp",
      },
      {
        id: uuid.v4(),
        img: people5,
        name: "Jay Olson",
        time: "09:22 PM",
        amount: "313",
        type: "Incoming Request",
        link: "/IncomingRequest",
      },
    ],
  },
];

export const tabDate = [
  {
    id: uuid.v4(),
    name: "Home",
    icon: PhHouse,
    link: "/Home",
  },
  {
    id: uuid.v4(),
    name: "Contacts",
    icon: PhUsersThree,
    link: "/Contacts",
  },
  {
    id: uuid.v4,
    icon: PhBarcode,
  },
  {
    id: uuid.v4(),
    name: "Statistics",
    icon: PhChartLineUp,
    link: "/Statistics",
  },
  {
    id: uuid.v4(),
    name: "Account",
    icon: PhUser,
    link: "/Account",
  },
];

export const notifications = [
  {
    id: uuid.v4(),
    date: "Today",
    notificationList: [
      {
        id: uuid.v4(),
        title: "New Updates Available!",
        desc: "Update the BankoX app and enjoy new features",
        time: "12.10 pm",
        icon: PhInfo,
      },
      {
        id: uuid.v4(),
        title: "2-Factor Authentication",
        desc: "Use two-factor authentication for extra security on your account",
        time: "01.45 pm",
        icon: PhLockSimple,
      },
      {
        id: uuid.v4(),
        title: "Receive payment",
        desc: "Confirm receipt of payment securely and efficiently.",
        time: "04.16 pm",
        icon: PhCreditCard,
      },
    ],
  },
  {
    id: uuid.v4(),
    date: "Tomorrow",
    notificationList: [
      {
        id: uuid.v4(),
        title: "Password Change",
        desc: "Update the BankoX app and enjoy new features",
        time: "07.30 pm",
        icon: PhKey,
      },
      {
        id: uuid.v4(),
        title: "Transfer Success",
        desc: "Update the BankoX app and enjoy new features",
        time: "08.30 pm",
        icon: PhSwap,
      },
      {
        id: uuid.v4(),
        title: "2-Factor Authentication",
        desc: "Use two-factor authentication for extra security on your account",
        time: "01.45 pm",
        icon: PhLockSimple,
      },
    ],
  },
  {
    id: uuid.v4(),
    date: "Jan 25, 2025",
    notificationList: [
      {
        id: uuid.v4(),
        title: "2-Factor Authentication",
        desc: "Use two-factor authentication for extra security on your account",
        time: "01.45 pm",
        icon: PhLockSimple,
      },
      {
        id: uuid.v4(),
        title: "Receive payment",
        desc: "Confirm receipt of payment securely and efficiently.",
        time: "04.16 pm",
        icon: PhCreditCard,
      },
      {
        id: uuid.v4(),
        title: "Transfer Success",
        desc: "Update the BankoX app and enjoy new features",
        time: "08.30 pm",
        icon: PhSwap,
      },
    ],
  },
];

export const contactList = [
  {
    id: uuid.v4(),
    firstLetter: "A",
    contacts: [
      {
        id: uuid.v4(),
        name: "Anthony Cobb",
        img: people1,
        email: "wef@mouwpuj.bi",
        isFavourite: false,
      },
      {
        id: uuid.v4(),
        name: "Andrew Garrett",
        img: people5,
        email: "itecac@faam.yt",
        isFavourite: true,
      },
      {
        id: uuid.v4(),
        name: "Almanzo Moreno",
        img: people4,
        email: "nil@dowi.al",
        isFavourite: false,
      },
      {
        id: uuid.v4(),
        name: "Amos Burgess",
        img: people3,
        email: "kolop@pawdomter.sx",
        isFavourite: true,
      },
    ],
  },
  {
    id: uuid.v4(),
    firstLetter: "B",
    contacts: [
      {
        id: uuid.v4(),
        name: "Bella Mason",
        img: people1,
        email: "atokohlo@kedof.ms",
        isFavourite: false,
      },
      {
        id: uuid.v4(),
        name: "Brooke Coleman",
        img: people4,
        email: "fev@eja.io",
        isFavourite: false,
      },
      {
        id: uuid.v4(),
        name: "Blake Patterson",
        img: people5,
        email: "hisli@ire.mz",
        isFavourite: true,
      },
      {
        id: uuid.v4(),
        name: "Brandon Jordan",
        img: people3,
        email: "umge@ukeno.ck",
        isFavourite: false,
      },
    ],
  },
  {
    id: uuid.v4(),
    firstLetter: "C",
    contacts: [
      {
        id: uuid.v4(),
        name: "Clark Patterson",
        img: people4,
        email: "go@gebunbus.lu",
        isFavourite: false,
      },
      {
        id: uuid.v4(),
        name: "Campbell Yates",
        img: people3,
        email: "va@veasa.gl",
        isFavourite: false,
      },
      {
        id: uuid.v4(),
        name: "Cody Berry",
        img: people2,
        email: "cubigje@uvefu.ir",
        isFavourite: false,
      },
      {
        id: uuid.v4(),
        name: "Carter Houston",
        img: people5,
        email: "cajot@vuj.ms",
        isFavourite: true,
      },
    ],
  },
  {
    id: uuid.v4(),
    firstLetter: "D",
    contacts: [
      {
        id: uuid.v4(),
        name: "Daniel Adkins",
        img: people1,
        email: "ul@je.ly",
        isFavourite: false,
      },
      {
        id: uuid.v4(),
        name: "Don Vaughn",
        img: people2,
        email: "edudu@so.af",
        isFavourite: false,
      },
      {
        id: uuid.v4(),
        name: "David Brewer",
        img: people4,
        email: "ma@erefebiz.gr",
        isFavourite: false,
      },
      {
        id: uuid.v4(),
        name: "Dominic Diaz",
        img: people5,
        email: "sis@uhte.gt",
        isFavourite: false,
      },
    ],
  },
];

export const settingsLists = [
  {
    id: uuid.v4(),
    icon: PhBell,
    name: "Notifications",
    link: "/NotificationSettings",
  },
  {
    id: uuid.v4(),
    icon: PhCreditCard,
    name: "My Cards",
    link: "/MyCards",
  },
  {
    id: uuid.v4(),
    icon: PhUser,
    name: "Personal Info",
    link: "/EditProfile",
  },
  {
    id: uuid.v4(),
    icon: PhShieldCheck,
    name: "Security",
    link: "/SecuritySettings",
  },

  {
    id: uuid.v4(),
    icon: PhHeadset,
    name: "Help Center",
    link: "/HelpCenter",
  },
  {
    id: uuid.v4(),
    icon: PhTranslate,
    name: "Language",
    link: "/LanguageSettings",
  },
  {
    id: uuid.v4(),
    icon: PhFile,
    name: "Privacy Policy",
    link: "/PrivacyPolicy",
  },
  {
    id: uuid.v4(),
    icon: PhFile,
    name: "About BankuX",
    link: "/AboutBankuX",
  },
];

export const faqData = [
  {
    id: 1,
    question: "What is BankuX?",
    answer:
      "BankuX is a digital banking platform offering convenient financial services online.",
  },
  {
    id: 2,
    question: "What are the services in BankuX?",
    answer:
      "BankuX is a digital banking platform offering convenient financial services online.",
  },
  {
    id: 3,
    question: "What are the services in BankuX?",
    answer:
      "BankuX is a digital banking platform offering convenient financial services online.",
  },
  {
    id: 4,
    question: "What are the services in BankuX?",
    answer:
      "BankuX is a digital banking platform offering convenient financial services online.",
  },
  {
    id: 5,
    question: "What are the services in BankuX?",
    answer:
      "BankuX is a digital banking platform offering convenient financial services online.",
  },
];

export const noOfTransactions = [
  {
    id: uuid.v4(),
    name: "Income",
    totalNo: "46",
  },
  {
    id: uuid.v4(),
    name: "Sent",
    totalNo: "94",
  },
  {
    id: uuid.v4(),
    name: "Request",
    totalNo: "04",
  },
  {
    id: uuid.v4(),
    name: "Top Up",
    totalNo: "98",
  },
  {
    id: uuid.v4(),
    name: "Withdraw",
    totalNo: "58",
  },
  {
    id: uuid.v4(),
    name: "All",
    totalNo: "49",
  },
];

export const myCardsData = [
  {
    id: uuid.v4(),
    bank: "WAVEY",
    cardNo: "4024 0071 7677 6426",
    cardHolderName: "Frances Rowe",
    expiryDate: "01/26",
    cardBg: cardBg1,
  },
  {
    id: uuid.v4(),
    bank: "WAVEY",
    cardNo: "4024 0071 7677 1775",
    cardHolderName: "Mildred Gonzales",
    expiryDate: "01/26",
    cardBg: cardBg2,
  },
  {
    id: uuid.v4(),
    bank: "WAVEY",
    cardNo: "4024 0071 7677 2328",
    cardHolderName: "Earl Turner",
    expiryDate: "01/26",
    cardBg: cardBg1,
  },
];

export const paymentMethods = [
  {
    id: uuid.v4(),
    name: "Payoneer",
    img: payoneer,
  },
  {
    id: uuid.v4(),
    name: "Bank Transfer",
    img: bank,
  },
  {
    id: uuid.v4(),
    name: "Mastercard",
    img: masterCard,
  },
  {
    id: uuid.v4(),
    name: "Paypal",
    img: payoneer,
  },
  {
    id: uuid.v4(),
    name: "Paytm",
    img: card,
  },
];

export const paybillItems = [
  {
    id: uuid.v4(),
    name: "Electricity",
    icon: billIcon1,
  },
  {
    id: uuid.v4(),
    name: "Water Bill",
    icon: billIcon2,
  },
  {
    id: uuid.v4(),
    name: "Food Order",
    icon: billIcon10,
  },
  {
    id: uuid.v4(),
    name: "Airfare",
    icon: billIcon3,
  },
  {
    id: uuid.v4(),
    name: "Cable",
    icon: billIcon4,
  },
  {
    id: uuid.v4(),
    name: "Internet",
    icon: billIcon5,
  },
  {
    id: uuid.v4(),
    name: "Hotel Booking",
    icon: billIcon6,
  },
  {
    id: uuid.v4(),
    name: "Trains Tickets",
    icon: billIcon7,
  },
  {
    id: uuid.v4(),
    name: "Bus Ticket",
    icon: billIcon8,
  },
  {
    id: uuid.v4(),
    name: "Movie Ticket",
    icon: billIcon9,
  },
];
