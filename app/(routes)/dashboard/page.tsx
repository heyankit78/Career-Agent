import React from "react";
import WelcomeBanner from "./_components/WelcomeBanner";
import AiTools from "./_components/AITools";
import History from "./_components/History";

function Dashboard() {
  return (
    <div className="">
      <WelcomeBanner />
      <AiTools />
      <History />
    </div>
  );
}

export default Dashboard;
