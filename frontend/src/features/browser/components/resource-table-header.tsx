import { cn } from '@/lib/utils'
import { RESOURCE_TABLE_GRID_CLASS } from './resource-table-layout'

export function ResourceTableHeader() {
	return (
		<div
			className={cn(
				RESOURCE_TABLE_GRID_CLASS,
				'border-b bg-muted/30 px-4 py-3 text-xs font-medium uppercase text-muted-foreground',
			)}
		>
			<span>Name</span>
			<span className='text-right'>Size</span>
			<span className='text-right'>Updated</span>
			<span className='sr-only'>Actions</span>
		</div>
	)
}
