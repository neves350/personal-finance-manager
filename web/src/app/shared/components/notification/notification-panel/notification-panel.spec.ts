import { signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter, Router } from '@angular/router'
import { NotificationsApi } from '@core/api/notifications.api'
import type { Notification } from '@core/api/notifications.interface'
import { NotificationsService } from '@core/services/notifications.service'
import { makeNotification } from '@core/testing/factories'
import { mockNotifications } from '@core/testing/mocks'
import { of } from 'rxjs'
import { describe, expect, it, vi } from 'vitest'
import { ZardDropdownService } from '../../ui/dropdown/dropdown.service'
import { NotificationPanel } from './notification-panel'

const mockApi = {
	findAll: vi.fn(),
}

const mockDropdown = {
	isOpen: signal(false),
	close: vi.fn(),
}

describe('NotificationPanel', () => {
	async function setup() {
		vi.clearAllMocks()

		await TestBed.configureTestingModule({
			imports: [NotificationPanel],
			providers: [
				provideRouter([]),
				{ provide: NotificationsApi, useValue: mockApi },
				{ provide: NotificationsService, useValue: mockNotifications },
				{ provide: ZardDropdownService, useValue: mockDropdown },
			],
		}).compileComponents()

		const fixture = TestBed.createComponent(NotificationPanel)
		const component = fixture.componentInstance
		const router = TestBed.inject(Router)
		vi.spyOn(router, 'navigate')
		await fixture.whenStable()

		return { fixture, component, router }
	}

	it('should create', async () => {
		const { component } = await setup()
		expect(component).toBeTruthy()
	})

	describe('onOpen()', () => {
		it('should fetch unread notifications from api', async () => {
			const { component } = await setup()
			const notifications = [makeNotification()]
			mockApi.findAll.mockReturnValue(of({ data: notifications }))

			component.onOpen()

			expect(mockApi.findAll).toHaveBeenCalledWith({
				limit: 10,
				isRead: false,
			})
		})

		it('should populate groups from fetched notifications', async () => {
			const { component } = await setup()
			const today = new Date().toISOString().slice(0, 10)
			const notification = makeNotification({
				createdAt: `${today}T10:00:00.000Z`,
			})
			mockApi.findAll.mockReturnValue(of({ data: [notification] }))

			component.onOpen()

			expect(component.groups()).toHaveLength(1)
			expect(component.groups()[0].label).toBe('Today')
			expect(component.groups()[0].notifications).toHaveLength(1)
		})

		it('should label yesterday group correctly', async () => {
			const { component } = await setup()
			const yesterday = new Date(Date.now() - 86_400_000)
				.toISOString()
				.slice(0, 10)
			const notification = makeNotification({
				createdAt: `${yesterday}T10:00:00.000Z`,
			})
			mockApi.findAll.mockReturnValue(of({ data: [notification] }))

			component.onOpen()

			expect(component.groups()[0].label).toBe('Yesterday')
		})

		it('should show formatted date for older notifications', async () => {
			const { component } = await setup()
			const notification = makeNotification({
				createdAt: '2026-01-15T10:00:00.000Z',
			})
			mockApi.findAll.mockReturnValue(of({ data: [notification] }))

			component.onOpen()

			expect(component.groups()[0].label).toBe('January 15')
		})

		it('should sort groups newest first', async () => {
			const { component } = await setup()
			const older = makeNotification({
				id: 'n-1',
				createdAt: '2026-01-10T10:00:00.000Z',
			})
			const newer = makeNotification({
				id: 'n-2',
				createdAt: '2026-01-15T10:00:00.000Z',
			})
			mockApi.findAll.mockReturnValue(of({ data: [older, newer] }))

			component.onOpen()

			expect(component.groups()[0].notifications[0].id).toBe('n-2')
		})

		it('should group multiple notifications on the same day', async () => {
			const { component } = await setup()
			const n1 = makeNotification({
				id: 'n-1',
				createdAt: '2026-01-15T08:00:00.000Z',
			})
			const n2 = makeNotification({
				id: 'n-2',
				createdAt: '2026-01-15T18:00:00.000Z',
			})
			mockApi.findAll.mockReturnValue(of({ data: [n1, n2] }))

			component.onOpen()

			expect(component.groups()).toHaveLength(1)
			expect(component.groups()[0].notifications).toHaveLength(2)
		})
	})

	describe('markAllAsRead()', () => {
		it('should call service.markAllAsRead', async () => {
			const { component } = await setup()
			mockNotifications.markAllAsRead.mockReturnValue(of(undefined))
			mockApi.findAll.mockReturnValue(
				of({ data: [makeNotification({ isRead: false })] }),
			)
			component.onOpen()

			component.markAllAsRead()

			expect(mockNotifications.markAllAsRead).toHaveBeenCalled()
		})

		it('should mark all panel notifications as read', async () => {
			const { component } = await setup()
			mockNotifications.markAllAsRead.mockReturnValue(of(undefined))
			const today = new Date().toISOString().slice(0, 10)
			mockApi.findAll.mockReturnValue(
				of({
					data: [
						makeNotification({
							isRead: false,
							createdAt: `${today}T10:00:00.000Z`,
						}),
					],
				}),
			)
			component.onOpen()

			component.markAllAsRead()

			expect(component.groups()[0].notifications[0].isRead).toBe(true)
		})
	})

	describe('onNotificationClick()', () => {
		it('should mark unread notification as read', async () => {
			const { component } = await setup()
			mockNotifications.markAsRead.mockReturnValue(of(undefined))
			const notification = makeNotification({ isRead: false })

			component.onNotificationClick(notification)

			expect(mockNotifications.markAsRead).toHaveBeenCalledWith(notification.id)
		})

		it('should not call markAsRead for already read notification', async () => {
			const { component } = await setup()
			const notification = makeNotification({ isRead: true })

			component.onNotificationClick(notification)

			expect(mockNotifications.markAsRead).not.toHaveBeenCalled()
		})

		it('should close dropdown', async () => {
			const { component } = await setup()
			mockNotifications.markAsRead.mockReturnValue(of(undefined))
			const notification = makeNotification()

			component.onNotificationClick(notification)

			expect(mockDropdown.close).toHaveBeenCalled()
		})

		it('should navigate to /recurrings for RECURRING entity', async () => {
			const { component, router } = await setup()
			mockNotifications.markAsRead.mockReturnValue(of(undefined))
			const notification = makeNotification({ entityType: 'RECURRING' })

			component.onNotificationClick(notification)

			expect(router.navigate).toHaveBeenCalledWith(['/recurrings'])
		})

		it('should navigate to /budgets for ENVELOPE entity', async () => {
			const { component, router } = await setup()
			mockNotifications.markAsRead.mockReturnValue(of(undefined))
			const notification = makeNotification({ entityType: 'ENVELOPE' })

			component.onNotificationClick(notification)

			expect(router.navigate).toHaveBeenCalledWith(['/budgets'])
		})

		it('should navigate to /goals for GOAL entity', async () => {
			const { component, router } = await setup()
			mockNotifications.markAsRead.mockReturnValue(of(undefined))
			const notification = makeNotification({ entityType: 'GOAL' })

			component.onNotificationClick(notification)

			expect(router.navigate).toHaveBeenCalledWith(['/goals'])
		})

		it('should navigate to /dashboard for unknown entity', async () => {
			const { component, router } = await setup()
			mockNotifications.markAsRead.mockReturnValue(of(undefined))
			const notification = makeNotification({
				entityType: 'UNKNOWN' as Notification['entityType'],
			})

			component.onNotificationClick(notification)

			expect(router.navigate).toHaveBeenCalledWith(['/dashboard'])
		})

		it('should update panel notification to read', async () => {
			const { component } = await setup()
			mockNotifications.markAsRead.mockReturnValue(of(undefined))
			const today = new Date().toISOString().slice(0, 10)
			const notification = makeNotification({
				id: 'n-1',
				isRead: false,
				createdAt: `${today}T10:00:00.000Z`,
			})
			mockApi.findAll.mockReturnValue(of({ data: [notification] }))
			component.onOpen()

			component.onNotificationClick(notification)

			expect(component.groups()[0].notifications[0].isRead).toBe(true)
		})
	})

	describe('navigateToAll()', () => {
		it('should close dropdown', async () => {
			const { component } = await setup()

			component.navigateToAll()

			expect(mockDropdown.close).toHaveBeenCalled()
		})

		it('should navigate to /notifications', async () => {
			const { component, router } = await setup()

			component.navigateToAll()

			expect(router.navigate).toHaveBeenCalledWith(['/notifications'])
		})
	})
})
