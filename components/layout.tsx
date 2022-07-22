import React, {useEffect, useState} from "react";
import Header from "@/components/Header/Header";
import BaseTag from "@/components/Metatag/BaseTag";
import Analytics from "@/components/Analytics/Analytics";

export default function Layout({ children }) {
  return (
    <>
      <BaseTag />
      <Header />
      <main>{children}</main>
      <footer>
        <Analytics />
      </footer>
    </>
  );
}
