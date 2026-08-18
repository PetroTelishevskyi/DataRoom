import type { FileResourceItem } from '@/features/data-rooms/data-room.types'
import { DeleteFileDialog } from '@/features/files/components/delete-file-dialog'
import { RenameFileDialog } from '@/features/files/components/rename-file-dialog'
import { cn } from '@/lib/utils'
import { FileText } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ResourceActionsMenu } from './resource-actions-menu'
import { RESOURCE_TABLE_GRID_CLASS } from './resource-table-layout'

type FileRowProps = {
	canDelete: boolean
	canMove: boolean
	canRename: boolean
	canShare: boolean
	file: FileResourceItem
	onDeleteFile?: (file: FileResourceItem) => Promise<void>
	onRenameFile?: (file: FileResourceItem, name: string) => Promise<void>
}

function formatFileSize(sizeBytes: number) {
	if (sizeBytes < 1024) {
		return `${sizeBytes} B`
	}

	const units = ['KB', 'MB', 'GB']
	let size = sizeBytes / 1024
	let unitIndex = 0

	while (size >= 1024 && unitIndex < units.length - 1) {
		size /= 1024
		unitIndex += 1
	}

	return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unitIndex]}`
}

export function FileRow({
	canDelete,
	canMove,
	canRename,
	canShare,
	file,
	onDeleteFile,
	onRenameFile,
}: FileRowProps) {
	const [isDeleteOpen, setIsDeleteOpen] = useState(false)
	const [isRenameOpen, setIsRenameOpen] = useState(false)
	const navigate = useNavigate()
	const canView = file.status === 'READY'
	const fileHref = `/files/${file.id}`
	const fileRouteState = { fileName: file.name }

	return (
		<div
			className={cn(
				RESOURCE_TABLE_GRID_CLASS,
				'border-b px-4 py-5 transition-colors last:border-b-0 hover:bg-muted/40',
			)}
		>
			{canView ? (
				<Link
					className='flex min-w-0 items-center gap-3 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
					state={fileRouteState}
					to={fileHref}
				>
					<FileText
						aria-hidden
						className='h-4 w-4 shrink-0 text-muted-foreground'
					/>
					<span className='truncate text-sm font-medium'>{file.name}</span>
				</Link>
			) : (
				<div className='flex min-w-0 items-center gap-3'>
					<FileText
						aria-hidden
						className='h-4 w-4 shrink-0 text-muted-foreground'
					/>
					<span className='truncate text-sm font-medium'>{file.name}</span>
				</div>
			)}
			<span className='text-right text-sm text-muted-foreground'>
				{formatFileSize(file.sizeBytes)}
			</span>
			<span className='text-right text-sm text-muted-foreground'>
				{new Date(file.updatedAt).toLocaleDateString()}
			</span>
			<div className='flex justify-end'>
				<ResourceActionsMenu
					canDelete={canDelete}
					canMove={canMove}
					canOpen={canView}
					canRename={canRename}
					canShare={canShare}
					onDelete={
						canDelete && onDeleteFile ? () => setIsDeleteOpen(true) : undefined
					}
					onMove={undefined}
					onOpen={
						canView
							? () => navigate(fileHref, { state: fileRouteState })
							: undefined
					}
					onRename={
						canRename && onRenameFile ? () => setIsRenameOpen(true) : undefined
					}
					onShare={undefined}
					showMove
					showOpen
					showShare
				/>
				{canRename && onRenameFile ? (
					<RenameFileDialog
						currentName={file.name}
						onOpenChange={setIsRenameOpen}
						onRenameFile={(name) => onRenameFile(file, name)}
						open={isRenameOpen}
					/>
				) : null}
				{canDelete && onDeleteFile ? (
					<DeleteFileDialog
						fileName={file.name}
						onDeleteFile={() => onDeleteFile(file)}
						onOpenChange={setIsDeleteOpen}
						open={isDeleteOpen}
					/>
				) : null}
			</div>
		</div>
	)
}
