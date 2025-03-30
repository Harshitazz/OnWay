'use client'
import { UserButton, UserProfile } from '@clerk/nextjs'
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCartShopping } from '@fortawesome/free-solid-svg-icons'
import MyOrders from './_components/MyOrders'


function User() {
    return (
        <div className='flex justify-center'>
            <UserProfile routing="hash">
                <UserButton.UserProfilePage
                    label="My Orders"
                    labelIcon={<FontAwesomeIcon icon={faCartShopping} />}
                    url="my-orders"
                >
                    <MyOrders/>
                </UserButton.UserProfilePage>
            </UserProfile>
        </div>
    )
}

export default User
