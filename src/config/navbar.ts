import {NavbarConfig} from "../types.ts";

const navbarConfig: NavbarConfig = {
  siteName: "Paddy's solar calculator",
  items: [
    {label: "Home", url: "/"},
    {
      label: "Calculators", children: [
        {label: "Day/night import", url: "/calc/day-night-import"},
      ]
    },
  ],
}

export default navbarConfig;
