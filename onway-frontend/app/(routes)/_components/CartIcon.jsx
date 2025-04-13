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
                <div className=' p-3  flex items-center justify-center cursor-pointer'>

                    <PopoverTrigger >
                        <FontAwesomeIcon icon={faCartShopping} />
                        <span className='ml-2'>{cart?.items?.length}</span>
                    </PopoverTrigger>
                    <PopoverContent className='bg-gray-100 w-100 mr-2'>
                        <Cart cart={cart}/>
                    </PopoverContent>
                    </div>
                </Popover>
    </div>
  )
}

export default CartIcon
