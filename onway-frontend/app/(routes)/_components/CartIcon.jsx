import React from 'react'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import Cart from '@/app/_components/Cart'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCartShopping } from '@fortawesome/free-solid-svg-icons'

function CartIcon({cart}) {
  return (
    <div>
      <Popover>
                <div className='fixed bottom-5 left-5 p-3 rounded-full shadow-lg flex items-center justify-center border-4 cursor-pointer'>

                    <PopoverTrigger >
                        <FontAwesomeIcon icon={faCartShopping} />
                        <span className='ml-2'>{cart?.items?.length}</span>
                    </PopoverTrigger>
                    <PopoverContent className='bg-slate-200 w-100'>
                        <Cart cart={cart}/>
                    </PopoverContent>
                    </div>
                </Popover>
    </div>
  )
}

export default CartIcon
