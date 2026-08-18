import type { FileResourceItem } from '@/features/data-rooms/data-room.types'
import { cn } from '@/lib/utils'
import { FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { RESOURCE_TABLE_GRID_CLASS } from './resource-table-layout'

type FileRowProps = {
	file: FileResourceItem
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

export function FileRow({ file }: FileRowProps) {
	const canView = file.status === 'READY'

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
					state={{ fileName: file.name }}
					to={`/files/${file.id}`}
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
			<span aria-hidden />
		</div>
	)
}
