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
import { Link, useNavigate } from 'react-router-dom'

type RegisterField = 'name' | 'email' | 'password' | 'confirmPassword'

type RegisterFieldErrors = Partial<Record<RegisterField, boolean>>

function getErrorMessage(error: unknown) {
	if (error instanceof ApiError) {
		return error.message
	}

	return 'Unable to create account.'
}

function hasFieldErrors(fieldErrors: RegisterFieldErrors) {
	return Object.values(fieldErrors).some(Boolean)
}

function isValidEmail(email: string) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function RegisterPage() {
	const { register } = useAuth()
	const navigate = useNavigate()
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({})
	const [isSubmitting, setIsSubmitting] = useState(false)

	function showError(message: string) {
		toast({
			description: message,
			duration: 10_000,
			title: 'Unable to create account',
			variant: 'destructive',
		})
	}

	function clearFieldError(field: RegisterField) {
		setFieldErrors(currentFieldErrors => {
			const nextFieldErrors = { ...currentFieldErrors }
			delete nextFieldErrors[field]

			return nextFieldErrors
		})
	}

	function validateFields() {
		const nextFieldErrors: RegisterFieldErrors = {}
		const normalizedName = name.trim()
		const normalizedEmail = email.trim()
		let nextError = 'Please fill in the required fields.'

		if (!normalizedName) {
			nextFieldErrors.name = true
		}

		if (!normalizedEmail) {
			nextFieldErrors.email = true
		} else if (!isValidEmail(normalizedEmail)) {
			nextFieldErrors.email = true
			nextError = 'Please enter a valid email address.'
		}

		if (!password) {
			nextFieldErrors.password = true
		} else if (password.length < 8) {
			nextFieldErrors.password = true
			nextError = 'Password must be at least 8 characters long.'
		}

		if (!confirmPassword) {
			nextFieldErrors.confirmPassword = true
		}

		if (
			password &&
			confirmPassword &&
			password.length >= 8 &&
			password !== confirmPassword
		) {
			nextFieldErrors.password = true
			nextFieldErrors.confirmPassword = true
			nextError = 'Passwords do not match.'
		}

		setFieldErrors(nextFieldErrors)

		if (hasFieldErrors(nextFieldErrors)) {
			showError(nextError)
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
			await register({
				email,
				name: name.trim(),
				password,
			})
			navigate('/', { replace: true })
		} catch (submitError) {
			setFieldErrors({
				email: submitError instanceof ApiError,
			})
			showError(getErrorMessage(submitError))
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Card>
			<CardHeader className='text-center'>
				<CardTitle>Create your account</CardTitle>
				<CardDescription>
					Enter your email below to create your account.
				</CardDescription>
			</CardHeader>

			<CardContent>
				<form className='space-y-5' noValidate onSubmit={handleSubmit}>
					<div className='space-y-2'>
						<Label htmlFor='name'>Name</Label>
						<Input
							autoComplete='name'
							className={cn(
								fieldErrors.name &&
									'border-destructive focus-visible:ring-destructive',
							)}
							id='name'
							maxLength={255}
							onChange={event => setName(event.target.value)}
							onFocus={() => clearFieldError('name')}
							placeholder='John'
							required
							type='text'
							value={name}
						/>
					</div>

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
							autoComplete='new-password'
							className={cn(
								fieldErrors.password &&
									'border-destructive focus-visible:ring-destructive',
							)}
							id='password'
							maxLength={128}
							minLength={8}
							onChange={event => setPassword(event.target.value)}
							onFocus={() => clearFieldError('password')}
							required
							type='password'
							value={password}
						/>
						<p className='mt-2 text-xs text-muted-foreground'>
							Must be at least 8 characters long.
						</p>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='confirm-password'>Confirm Password</Label>
						<Input
							autoComplete='new-password'
							className={cn(
								fieldErrors.confirmPassword &&
									'border-destructive focus-visible:ring-destructive',
							)}
							id='confirm-password'
							maxLength={128}
							minLength={8}
							onChange={event => setConfirmPassword(event.target.value)}
							onFocus={() => clearFieldError('confirmPassword')}
							required
							type='password'
							value={confirmPassword}
						/>
					</div>

					<Button className='w-full' disabled={isSubmitting} type='submit'>
						{isSubmitting ? 'Creating account...' : 'Create account'}
					</Button>
				</form>
			</CardContent>

			<CardFooter className='justify-center'>
				<p className='text-center text-sm text-muted-foreground'>
					Already have an account?{' '}
					<Link
						className='font-medium text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground'
						to='/login'
					>
						Sign in
					</Link>
				</p>
			</CardFooter>
		</Card>
	)
}
