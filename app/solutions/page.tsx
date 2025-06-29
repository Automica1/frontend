import React from 'react'
import {LogoutLink} from "@kinde-oss/kinde-auth-nextjs/components";

export default function page() {
  return (
    <div className='text-white p-6'>
      You need to login to access this page.
      <LogoutLink className='bg-white text-purple-600 px-4 py-2 rounded-2xl hover:bg-purple-700 hover:text-white'>Log out</LogoutLink>
    </div>
  )
}
