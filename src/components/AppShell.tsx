"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import ModalLogin from '@/components/modals/ModalLogin'
import ModalRegister from '@/components/modals/ModalRegister'

type AppShellProps = {
  children: React.ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const router = useRouter()

  return (
    <>
      <Navigation onLoginClick={() => setIsLoginOpen(true)} />
      <div className="pt-16">{children}</div>
      <ModalLogin
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToRegister={() => {
          setIsLoginOpen(false)
          setIsRegisterOpen(true)
        }}
        onSwitchToForgotPassword={() => {
          setIsLoginOpen(false)
          router.push('/forgot-password')
        }}
      />
      <ModalRegister
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSwitchToLogin={() => {
          setIsRegisterOpen(false)
          setIsLoginOpen(true)
        }}
      />
    </>
  )
}
