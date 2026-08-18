import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/toast/use-toast'
import { useAuth } from '@/features/auth/use-auth'
import { ApiError } from '@/lib/api'
import { cn } from '@/lib/utils'
import { FormEvent, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

type LocationState = {
	from?: {
		pathname?: string
	}
}

type LoginField = 'email' | 'password'

type LoginFieldErrors = Partial<Record<LoginField, boolean>>

function getErrorMessage(error: unknown) {
	if (error instanceof ApiError) {
		return error.message
	}

	return 'Unable to sign in.'
}

function hasFieldErrors(fieldErrors: LoginFieldErrors) {
	return Object.values(fieldErrors).some(Boolean)
}

export function LoginPage() {
	const { login } = useAuth()
	const location = useLocation()
	const navigate = useNavigate()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({})
	const [isSubmitting, setIsSubmitting] = useState(false)
	const locationState = location.state as LocationState | null
	const redirectTo = locationState?.from?.pathname ?? '/'

	function showError(message: string) {
		toast({
			description: message,
			duration: 10_000,
			title: 'Unable to sign in',
			variant: 'destructive',
		})
	}

	function clearFieldError(field: LoginField) {
		setFieldErrors(currentFieldErrors => {
			const nextFieldErrors = { ...currentFieldErrors }
			delete nextFieldErrors[field]

			return nextFieldErrors
		})
	}

	function validateFields() {
		const nextFieldErrors: LoginFieldErrors = {}

		if (!email.trim()) {
			nextFieldErrors.email = true
		}

		if (!password) {
			nextFieldErrors.password = true
		}

		setFieldErrors(nextFieldErrors)

		if (hasFieldErrors(nextFieldErrors)) {
			showError('Please fill in the required fields.')
			return false
		}

		return true
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()

		if (!validateFields()) {
			return
		}

		setIsSubmitting(true)

		try {
			await login({ email, password })
			navigate(redirectTo, { replace: true })
		} catch (submitError) {
			setFieldErrors({
				email: true,
				password: true,
			})
			showError(getErrorMessage(submitError))
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Card>
			<CardHeader className='text-center'>
				<CardTitle>Welcome back</CardTitle>
				<CardDescription>
					Enter your email below to login to your account.
				</CardDescription>
			</CardHeader>

			<CardContent>
				<form className='space-y-5' noValidate onSubmit={handleSubmit}>
					<div className='space-y-2'>
						<Label htmlFor='email'>Email</Label>
						<Input
							autoComplete='email'
							className={cn(
								fieldErrors.email &&
									'border-destructive focus-visible:ring-destructive',
							)}
							id='email'
							onChange={event => setEmail(event.target.value)}
							onFocus={() => clearFieldError('email')}
							placeholder='m@example.com'
							required
							type='email'
							value={email}
						/>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='password'>Password</Label>
						<Input
							autoComplete='current-password'
							className={cn(
								fieldErrors.password &&
									'border-destructive focus-visible:ring-destructive',
							)}
							id='password'
							minLength={8}
							onChange={event => setPassword(event.target.value)}
							onFocus={() => clearFieldError('password')}
							required
							type='password'
							value={password}
						/>
					</div>

					<Button className='w-full' disabled={isSubmitting} type='submit'>
						{isSubmitting ? 'Logging in...' : 'Login'}
					</Button>
				</form>
			</CardContent>

			<CardFooter className='justify-center'>
				<p className='text-center text-sm text-muted-foreground'>
					Don&apos;t have an account?{' '}
					<Link
						className='font-medium text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground'
						to='/register'
					>
						Sign up
					</Link>
				</p>
			</CardFooter>
		</Card>
	)
}
