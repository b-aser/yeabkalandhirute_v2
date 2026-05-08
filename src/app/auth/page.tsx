'use client'
import Auth from '@/components/auth/Auth'
import React from 'react'
import { Helmet } from 'react-helmet-async'


const Login = () => {
  return (
    <>
      <Helmet>
        <title>Sign In</title>
        <meta name="description" content="Sign in to manage your wedding website content." />
      </Helmet>
      <Auth />
    </>
  )
}

export default Login