'use client'
// pages/index.js
import { useState } from 'react';
import Layout from "@/components/Layout";
import Actions from "@/components/Actions/Actions";
import Stats from '@/components/Stats/Stats';
import ChainLinkVRF from '@/components/ChainLinkVRF/ChainLinkVRF';
import ManageGiveAway from '@/components/ManageGiveAway/ManageGiveAway';
import WalletConnect from '@/components/WalletConnect';
import { useMultiGiveaway } from '@/context/MultiGiveawayContext';
import TransactionStatePopup from '@/components/TransactionStatePopup';
import AuthCheck from '@/components/AuthCheck';

export default function Home() {
  const [activeComponent, setActiveComponent] = useState('adminActions');
  const { isConnected } = useMultiGiveaway();

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

  // When wallet is connected, wrap with AuthCheck to verify admin/owner status
  return (
    <AuthCheck>
      <TransactionStatePopup/>
      <Layout activeComponent={activeComponent} setActiveComponent={setActiveComponent}>
        {renderComponent()}
      </Layout>
    </AuthCheck>
  );
}