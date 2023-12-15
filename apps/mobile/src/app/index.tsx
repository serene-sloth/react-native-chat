import React from "react";
import { Layout } from "./_layout";
import { TRPCProvider } from "../lib/utils/api";

export const Root: React.FC = () => {
  return (
    <TRPCProvider>
      <Layout />
    </TRPCProvider>
  );
};

export default Root;
