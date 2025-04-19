'use client'
// pages/index.js
import { useState } from 'react';
import Layout from "@/components/Layout";
import Actions from "@/components/Actions/Actions";
import Stats from '@/components/Stats/Stats';
// import dynamic from 'next/dynamic';

// Dynamically import components to improve performance
// const AdminActions = dynamic(() => import('@/components/AdminActions'));
// const Stats = dynamic(() => import('@/components/Stats'));
// const AdminsInfo = dynamic(() => import('@/components/AdminsInfo'));

export default function Home() {
  const [activeComponent, setActiveComponent] = useState('adminActions');

  const renderComponent = () => {
    switch (activeComponent) {
      case 'adminActions':
        return <Actions />;
      case 'stats':
        return <Stats />;
      // case 'adminsInfo':
      //   return <AdminsInfo />;
      default:
        return <Actions />;
    }
  };

  return (
    <Layout activeComponent={activeComponent} setActiveComponent={setActiveComponent}>
      {renderComponent()}
    </Layout>
  );
}