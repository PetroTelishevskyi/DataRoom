import type { FolderResourceItem } from '@/features/data-rooms/data-room.types'
import { DeleteFolderDialog } from '@/features/folders/components/delete-folder-dialog'
import { RenameFolderDialog } from '@/features/folders/components/rename-folder-dialog'
import { Folder } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ResourceActionsMenu } from './resource-actions-menu'

type FolderCardProps = {
	canDelete: boolean
	canRename: boolean
	folder: FolderResourceItem
	href: string
	onDeleteFolder?: (folder: FolderResourceItem) => Promise<void>
	onRenameFolder?: (folder: FolderResourceItem, name: string) => Promise<void>
}

export function FolderCard({
	canDelete,
	canRename,
	folder,
	href,
	onDeleteFolder,
	onRenameFolder,
}: FolderCardProps) {
	const [isDeleteOpen, setIsDeleteOpen] = useState(false)
	const [isRenameOpen, setIsRenameOpen] = useState(false)

	return (
		<div className='flex min-w-0 items-start justify-between gap-3 rounded-lg border bg-white p-4 shadow-sm transition-colors hover:bg-muted/30'>
			<Link
				className='flex min-w-0 flex-1 items-start gap-3 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
				to={href}
			>
				<div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-muted/30'>
					<Folder aria-hidden className='h-4 w-4 text-muted-foreground' />
				</div>
				<div className='min-w-0'>
					<p className='truncate text-base font-medium'>{folder.name}</p>
					<p className='mt-1 text-xs text-muted-foreground'>
						Updated {new Date(folder.updatedAt).toLocaleDateString()}
					</p>
				</div>
			</Link>

			<div className='flex shrink-0 items-start'>
				<ResourceActionsMenu
					onDelete={
						canDelete && onDeleteFolder
							? () => setIsDeleteOpen(true)
							: undefined
					}
					onRename={
						canRename && onRenameFolder
							? () => setIsRenameOpen(true)
							: undefined
					}
				/>
				{canRename && onRenameFolder ? (
					<RenameFolderDialog
						currentName={folder.name}
						onOpenChange={setIsRenameOpen}
						onRenameFolder={name => onRenameFolder(folder, name)}
						open={isRenameOpen}
					/>
				) : null}
				{canDelete && onDeleteFolder ? (
					<DeleteFolderDialog
						folderId={folder.id}
						folderName={folder.name}
						onDeleteFolder={() => onDeleteFolder(folder)}
						onOpenChange={setIsDeleteOpen}
						open={isDeleteOpen}
					/>
				) : null}
			</div>
		</div>
	)
}
