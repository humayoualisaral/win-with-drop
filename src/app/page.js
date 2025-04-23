'use client'
// pages/index.js
import { useState } from 'react';
import Layout from "@/components/Layout";
import Actions from "@/components/Actions/Actions";
import Stats from '@/components/Stats/Stats';
import ChainLinkVRF from '@/components/ChainLinkVRF/ChainLinkVRF';
import ManageGiveAway from '@/components/ManageGiveAway/ManageGiveAway';
import WalletConnect from '@/components/WalletConnect';
import { useWallet } from '@/context/WalletContext';
import { useMultiGiveaway } from '@/context/MultiGiveawayContext';

export default function Home() {
  const [activeComponent, setActiveComponent] = useState('adminActions');
  const { isConnected } =useMultiGiveaway();

  const renderComponent = () => {
    switch (activeComponent) {
      case 'adminActions':
        return <Actions />;
      case 'stats':
        return <Stats />;
      case 'chainLinkVRF':
        return <ChainLinkVRF />;
      case 'manageGiveAway':
        return <ManageGiveAway />;
      default:
        return <Actions />;
    }
  };

  // Show wallet connection screen if wallet is not connected
  if (!isConnected) {
    return <WalletConnect />;
  }

  // Regular app layout (only shown when wallet is connected)
  return (
    <Layout activeComponent={activeComponent} setActiveComponent={setActiveComponent}>
      {renderComponent()}
    </Layout>
  );
}