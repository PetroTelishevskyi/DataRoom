import type {
	FileResourceItem,
	FolderResourceItem,
	ResourceItem,
} from '@/features/data-rooms/data-room.types'
import type { MoveFileDestination } from '@/features/files/files-api'
import { FileRow } from './file-row'
import { FolderCard } from './folder-card'
import { ResourceTableHeader } from './resource-table-header'

type ResourceTableProps = {
	canDeleteFile: boolean
	canDeleteFolder: boolean
	canMoveFile: boolean
	canRenameFile: boolean
	canRenameFolder: boolean
	canShare: boolean
	dataRoomId?: string
	getFolderHref: (folder: FolderResourceItem) => string
	items: ResourceItem[]
	onDeleteFile?: (file: FileResourceItem) => Promise<void>
	onDeleteFolder?: (folder: FolderResourceItem) => Promise<void>
	onMoveFile?: (
		file: FileResourceItem,
		destination: MoveFileDestination,
	) => Promise<void>
	onRenameFile?: (file: FileResourceItem, name: string) => Promise<void>
	onRenameFolder?: (folder: FolderResourceItem, name: string) => Promise<void>
}

function sortResourceItems(items: ResourceItem[]) {
	return [...items].sort((firstItem, secondItem) => {
		return firstItem.name.localeCompare(secondItem.name, undefined, {
			sensitivity: 'base',
		})
	})
}

export function ResourceTable({
	canDeleteFile,
	canDeleteFolder,
	canMoveFile,
	canRenameFile,
	canRenameFolder,
	canShare,
	dataRoomId,
	getFolderHref,
	items,
	onDeleteFile,
	onDeleteFolder,
	onMoveFile,
	onRenameFile,
	onRenameFolder,
}: ResourceTableProps) {
	const folders = sortResourceItems(items).filter(
		(item): item is FolderResourceItem => item.type === 'FOLDER',
	)
	const files = sortResourceItems(items).filter(
		(item): item is FileResourceItem => item.type === 'FILE',
	)

	return (
		<div className='flex min-h-0 flex-1 flex-col gap-8'>
			{folders.length ? (
				<section>
					<h2 className='mb-3 text-lg font-semibold tracking-tight'>
						Folders ({folders.length})
					</h2>
					<div className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'>
						{folders.map(folder => (
							<FolderCard
								canDelete={canDeleteFolder}
								canRename={canRenameFolder}
								folder={folder}
								href={getFolderHref(folder)}
								key={`${folder.type}-${folder.id}`}
								onDeleteFolder={onDeleteFolder}
								onRenameFolder={onRenameFolder}
							/>
						))}
					</div>
				</section>
			) : null}

			{files.length ? (
				<section className='min-h-0'>
					<h2 className='mb-3 text-lg font-semibold tracking-tight'>
						Files ({files.length})
					</h2>
					<div className='overflow-hidden rounded-lg border'>
						<ResourceTableHeader />
						{files.map(file => (
							<FileRow
								canDelete={canDeleteFile}
								canMove={canMoveFile}
								canRename={canRenameFile}
								canShare={canShare}
								dataRoomId={dataRoomId}
								file={file}
								key={`${file.type}-${file.id}`}
								onDeleteFile={onDeleteFile}
								onMoveFile={onMoveFile}
								onRenameFile={onRenameFile}
							/>
						))}
					</div>
				</section>
			) : null}
		</div>
	)
}
