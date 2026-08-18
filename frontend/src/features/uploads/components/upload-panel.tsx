import { useEffect, useMemo, useState } from 'react'
import { useUploadQueue } from '../upload-context'
import { UploadItem } from './upload-item'
import { UploadPanelHeader } from './upload-panel-header'

export function UploadPanel() {
	const {
		clearUploads,
		items,
		queueVersion,
		removeUpload,
		renameUpload,
		retryUpload,
	} = useUploadQueue()
	const [isDismissed, setIsDismissed] = useState(false)
	const [isExpanded, setIsExpanded] = useState(true)
	const completedCount = useMemo(
		() => items.filter(item => item.status === 'success').length,
		[items],
	)

	useEffect(() => {
		setIsDismissed(false)
		setIsExpanded(true)
	}, [queueVersion])

	if (items.length === 0 || isDismissed) {
		return null
	}

	return (
		<section className='fixed bottom-5 right-8 z-50 w-[500px] max-w-[calc(100vw-2.5rem)] overflow-hidden rounded-lg border bg-white shadow-lg'>
			<UploadPanelHeader
				completedCount={completedCount}
				isExpanded={isExpanded}
				onClose={() => {
					clearUploads()
					setIsDismissed(true)
				}}
				onToggle={() => setIsExpanded(currentValue => !currentValue)}
				totalCount={items.length}
			/>

			{isExpanded ? (
				<div className='max-h-[340px] overflow-y-auto'>
					{items.map(item => (
						<UploadItem
							item={item}
							key={item.id}
							onRemove={removeUpload}
							onRename={renameUpload}
							onRetry={retryUpload}
						/>
					))}
				</div>
			) : null}
		</section>
	)
}
