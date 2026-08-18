import logoUrl from '@/assets/data-room-logo.svg'
import { Outlet } from 'react-router-dom'

export function AuthLayout() {
	return (
		<main className='flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10'>
			<div className='w-full max-w-sm'>
				<div className='mb-6 flex items-center justify-center gap-2'>
					<span className='flex h-7 w-7 items-center justify-center rounded-md bg-background shadow-sm'>
						<img alt='' className='h-8 w-7' src={logoUrl} />
					</span>
					<p className='text-xl font-semibold tracking-tight'>Data Room</p>
				</div>

				<Outlet />
			</div>
		</main>
	)
}
