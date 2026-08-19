import type { FileResourceItem } from '@/features/data-rooms/data-room.types'
import { DeleteFileDialog } from '@/features/files/components/delete-file-dialog'
import { MoveFileDialog } from '@/features/files/components/move-file-dialog'
import { RenameFileDialog } from '@/features/files/components/rename-file-dialog'
import type { MoveFileDestination } from '@/features/files/files-api'
import { ShareDialog } from '@/features/sharing/components/share-dialog'
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
	dataRoomId?: string
	file: FileResourceItem
	getFileHref?: (file: FileResourceItem) => string
	getFileState?: (file: FileResourceItem) => unknown
	onDeleteFile?: (file: FileResourceItem) => Promise<void>
	onMoveFile?: (
		file: FileResourceItem,
		destination: MoveFileDestination,
	) => Promise<void>
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
	dataRoomId,
	file,
	getFileHref,
	getFileState,
	onDeleteFile,
	onMoveFile,
	onRenameFile,
}: FileRowProps) {
	const [isDeleteOpen, setIsDeleteOpen] = useState(false)
	const [isMoveOpen, setIsMoveOpen] = useState(false)
	const [isRenameOpen, setIsRenameOpen] = useState(false)
	const [isShareOpen, setIsShareOpen] = useState(false)
	const navigate = useNavigate()
	const canView = file.status === 'READY'
	const canMoveFile = canMove && Boolean(dataRoomId && onMoveFile)
	const fileHref = getFileHref?.(file) ?? `/files/${file.id}`
	const fileRouteState = getFileState?.(file) ?? { fileName: file.name }
	const shouldShowActions = canDelete || canMoveFile || canRename || canShare

	return (
		<div
			className={cn(
				RESOURCE_TABLE_GRID_CLASS,
				'border-b px-4 py-5 transition-colors last:border-b-0 hover:bg-muted/40',
			)}
		>
			{canView ? (
				<Link
					className='group flex min-w-0 items-center gap-3 rounded-sm text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
					state={fileRouteState}
					to={fileHref}
				>
					<FileText
						aria-hidden
						className='h-4 w-4 shrink-0 text-primary'
					/>
					<span className='truncate text-sm font-medium underline-offset-4 group-hover:underline'>
						{file.name}
					</span>
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
				{shouldShowActions ? (
					<ResourceActionsMenu
						canDelete={canDelete}
						canMove={canMoveFile}
						canOpen={canView}
						canRename={canRename}
						canShare={canShare}
						onDelete={
							canDelete && onDeleteFile ? () => setIsDeleteOpen(true) : undefined
						}
						onMove={canMoveFile ? () => setIsMoveOpen(true) : undefined}
						onOpen={
							canView
								? () => navigate(fileHref, { state: fileRouteState })
								: undefined
						}
						onRename={
							canRename && onRenameFile
								? () => setIsRenameOpen(true)
								: undefined
						}
						onShare={canShare ? () => setIsShareOpen(true) : undefined}
						showMove
						showOpen
						showShare
					/>
				) : null}
				{canShare ? (
					<ShareDialog
						onOpenChange={setIsShareOpen}
						open={isShareOpen}
						resource={{
							id: file.id,
							name: file.name,
							type: 'FILE',
						}}
					/>
				) : null}
				{canRename && onRenameFile ? (
					<RenameFileDialog
						currentName={file.name}
						onOpenChange={setIsRenameOpen}
						onRenameFile={(name) => onRenameFile(file, name)}
						open={isRenameOpen}
					/>
				) : null}
				{canMoveFile && dataRoomId && onMoveFile ? (
					<MoveFileDialog
						dataRoomId={dataRoomId}
						fileName={file.name}
						onMoveFile={(destination) => onMoveFile(file, destination)}
						onOpenChange={setIsMoveOpen}
						open={isMoveOpen}
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
