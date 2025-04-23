import React from 'react'
import StatCards from '../StatCards'


const stats = [
    { title: "Key Hash", value: "100,000,000" },
    { title: "VRF coordinator Address", value: "0x0000000000000000000" },
    { title: "Link Token Address", value: "5" },
  ];


const ChainLinkVRF = () => {
    return (
        <>
            <div className='flex flex-col md:flex-row gap-4 w-full mt-15'>
                <StatCards  stats={stats}/>
            </div>
        </>

    )
}

export default ChainLinkVRF