import React from 'react'

function Skeleton() {
  return (
    <div>
      <div className='h-[200px] w-full bg-slate-200 rounded-xl animate-pulse'>

      </div>
      <div className='mt-3 w-full h-5 bg-slate-200 animate-pulse'></div>
    </div>
  )
}

export default Skeleton
