import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import AppShell from '@/components/layout/AppShell'

export default function HomePage() {
  const token = cookies().get('veyfy_token')?.value
  if (!token || !verifyToken(token)) {
    redirect('/login')
  }

  const payload = verifyToken(token)!

  return <AppShell user={payload} />
}
