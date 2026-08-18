import {
	Toast,
	ToastClose,
	ToastDescription,
	ToastProvider,
	ToastTitle,
	ToastViewport,
	type ToastProps,
	type ToastVariant,
} from '@/components/ui/toast/toast'
import { useToast } from '@/components/ui/toast/use-toast'
import {
	AlertCircle,
	CheckCircle2,
	Info,
	TriangleAlert,
	type LucideIcon,
} from 'lucide-react'

const toastIcons = {
	default: Info,
	destructive: AlertCircle,
	info: Info,
	success: CheckCircle2,
	warning: TriangleAlert,
} satisfies Record<ToastVariant, LucideIcon>

function getToastVariant(variant: ToastProps['variant']) {
	return variant ?? 'default'
}

export function Toaster() {
	const { toasts } = useToast()

	return (
		<ToastProvider swipeDirection='left'>
			{toasts.map(({ action, description, id, title, ...props }) => {
				const variant = getToastVariant(props.variant)
				const Icon = toastIcons[variant]

				return (
					<Toast key={id} {...props} variant={variant}>
						<Icon aria-hidden className='mt-0.5 h-4 w-4 shrink-0' />
						<div className='grid min-w-0 flex-1 gap-1'>
							{title ? <ToastTitle>{title}</ToastTitle> : null}
							{description ? (
								<ToastDescription>{description}</ToastDescription>
							) : null}
						</div>
						{action}
						<ToastClose />
					</Toast>
				)
			})}
			<ToastViewport />
		</ToastProvider>
	)
}
