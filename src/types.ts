import {ReactNode} from "react";

export type NavbarItem = {
  label: string;
  url?: string;
  icon?: string;
  children?: NavbarItem[];
}

export type NavbarConfig = {
  siteName: ReactNode | string;
  items: NavbarItem[];
}


