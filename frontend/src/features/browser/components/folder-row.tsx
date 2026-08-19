import type { FolderResourceItem } from '@/features/data-rooms/data-room.types'
import { DeleteFolderDialog } from '@/features/folders/components/delete-folder-dialog'
import { RenameFolderDialog } from '@/features/folders/components/rename-folder-dialog'
import { cn } from '@/lib/utils'
import { Folder } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ResourceActionsMenu } from './resource-actions-menu'
import { RESOURCE_TABLE_GRID_CLASS } from './resource-table-layout'

type FolderRowProps = {
	canDelete: boolean
	canRename: boolean
	folder: FolderResourceItem
	href: string
	onDeleteFolder?: (folder: FolderResourceItem) => Promise<void>
	onRenameFolder?: (folder: FolderResourceItem, name: string) => Promise<void>
}

export function FolderRow({
	canDelete,
	canRename,
	folder,
	href,
	onDeleteFolder,
	onRenameFolder,
}: FolderRowProps) {
	const [isDeleteOpen, setIsDeleteOpen] = useState(false)
	const [isRenameOpen, setIsRenameOpen] = useState(false)
	const shouldShowActions = canDelete || canRename

	return (
		<div
			className={cn(
				RESOURCE_TABLE_GRID_CLASS,
				'border-b px-4 py-5 transition-colors last:border-b-0 hover:bg-muted/40',
			)}
		>
			<Link
				className='group flex min-w-0 items-center gap-3 rounded-sm text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
				to={href}
			>
				<Folder
					aria-hidden
					className='h-4 w-4 shrink-0 text-primary'
				/>
				<span className='truncate text-sm font-medium underline-offset-4 group-hover:underline'>
					{folder.name}
				</span>
			</Link>
			<span className=' text-center text-sm text-muted-foreground'>-</span>
			<span className='text-right text-sm text-muted-foreground'>
				{new Date(folder.updatedAt).toLocaleDateString()}
			</span>
			<div className='flex justify-end'>
				{shouldShowActions ? (
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
				) : null}
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
