import dataRoomLogoUrl from '@/assets/data-room-logo.svg'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/use-auth'
import { BrowserActionProvider } from '@/features/browser/browser-action-provider'
import { useBrowserActions } from '@/features/browser/use-browser-actions'
import { CreateFolderDialog } from '@/features/folders/components/create-folder-dialog'
import { UploadFileButton } from '@/features/uploads/components/upload-file-button'
import { cn } from '@/lib/utils'
import { Folder, FolderPlus, LogOut, Users } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

function getUserInitial(name?: string | null, email?: string | null) {
	const source = name?.trim() || email?.trim() || '?'

	return source.charAt(0).toLocaleUpperCase()
}

function AuthenticatedAppShell() {
	const { logout, user } = useAuth()
	const {
		canCreateFolder,
		canUpload,

		onCreateFolder,
		onUploadFiles,
	} = useBrowserActions()
	const createFolderButton = (
		<Button
			className='mt-8 w-full justify-start'
			disabled={!canCreateFolder || !onCreateFolder}
			size='sm'
			type='button'
		>
			<FolderPlus aria-hidden className='h-4 w-4' />
			Create folder
		</Button>
	)

	return (
		<div className='flex h-screen overflow-hidden bg-background'>
			<aside className='hidden h-screen w-60 shrink-0 overflow-hidden border-r bg-muted/20 px-4 py-5 md:flex md:flex-col'>
				<div className='flex items-center gap-3 px-2'>
					<img
						alt=''
						aria-hidden
						className='h-8 w-8 shrink-0'
						src={dataRoomLogoUrl}
					/>
					<div className='text-xl font-semibold tracking-tight'>Data Room</div>
				</div>
				{onCreateFolder ? (
					<CreateFolderDialog
						disabled={!canCreateFolder}
						onCreateFolder={onCreateFolder}
					>
						{createFolderButton}
					</CreateFolderDialog>
				) : (
					createFolderButton
				)}
				<UploadFileButton
					className='mt-2 w-full justify-start bg-white hover:bg-muted/30'
					disabled={!canUpload || !onUploadFiles}
					onUploadFiles={onUploadFiles}
					size='sm'
					variant='outline'
				/>

				<nav className='mt-8 space-y-1'>
					<NavLink
						className={({ isActive }) =>
							cn(
								'flex h-10 items-center gap-3 rounded-md border border-transparent px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground',
								isActive &&
									'border-border bg-white text-foreground shadow-sm hover:bg-white',
							)
						}
						to='/'
					>
						<Folder aria-hidden className='h-4 w-4' />
						My Data Room
					</NavLink>

					<NavLink
						className={({ isActive }) =>
							cn(
								'flex h-10 items-center gap-3 rounded-md border border-transparent px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground',
								isActive &&
									'border-border bg-white text-foreground shadow-sm hover:bg-white',
							)
						}
						to='/shared-with-me'
					>
						<Users aria-hidden className='h-4 w-4' />
						Shared with me
					</NavLink>
				</nav>

				<div className='mt-auto'>
					<div className='border-t pt-4'>
						<div className='flex min-w-0 items-center gap-3 px-2'>
							<div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-foreground text-sm font-semibold text-background'>
								{getUserInitial(user?.name, user?.email)}
							</div>
							<div className='min-w-0 flex-1'>
								<p className='truncate text-sm font-medium'>
									{user?.name ?? user?.email}
								</p>
								{user?.name ? (
									<p className='truncate text-xs text-muted-foreground'>
										{user.email}
									</p>
								) : null}
							</div>
							<button
								className='inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground'
								onClick={() => {
									void logout()
								}}
								title='Sign out'
								type='button'
							>
								<LogOut aria-hidden className='h-4 w-4' />
							</button>
						</div>
					</div>
				</div>
			</aside>

			<div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
				<header className='flex h-14 items-center justify-between border-b px-4 md:hidden'>
					<p className='font-semibold tracking-tight'>Data Room</p>
					<button
						className='inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground'
						onClick={() => {
							void logout()
						}}
						title='Sign out'
						type='button'
					>
						<LogOut aria-hidden className='h-4 w-4' />
					</button>
				</header>

				<main className='min-w-0 flex-1 overflow-auto'>
					<Outlet />
				</main>
			</div>
		</div>
	)
}

export function AuthenticatedAppLayout() {
	return (
		<BrowserActionProvider>
			<AuthenticatedAppShell />
		</BrowserActionProvider>
	)
}
