import { TestBed } from '@angular/core/testing'
import { NotificationsApi } from '@core/api/notifications.api'
import { NotificationsService } from '@core/services/notifications.service'
import { makeNotification } from '@core/testing/factories'
import { mockNotifications } from '@core/testing/mocks'
import { firstValueFrom, of, throwError } from 'rxjs'
import { beforeEach, describe, it, vi } from 'vitest'

describe('NotificationsService', () => {
	let service: NotificationsService

	beforeEach(() => {
		vi.clearAllMocks()

		TestBed.configureTestingModule({
			providers: [{ provide: NotificationsApi, useValue: mockNotifications }],
		})

		service = TestBed.inject(NotificationsService)
	})

	describe('loadNotifications()', () => {
		it('should load notifications and update signals', async () => {
			const n1 = makeNotification({ id: 'n-1' })
			const n2 = makeNotification({ id: 'n-2', isRead: true })
			const meta = {
				total: 2,
				lastPage: 1,
				currentPage: 1,
				perPage: 20,
				prev: null,
				next: null,
			}

			mockNotifications.findAll.mockReturnValue(of({ data: [n1, n2], meta }))

			const result = await firstValueFrom(service.loadNotifications())

			expect(result).toEqual([n1, n2])
			expect(service.notifications()).toEqual([n1, n2])
			expect(service.paginationMeta()).toEqual(meta)
			expect(service.loading()).toBe(false)
		})

		it('should pass query params to the API', async () => {
			mockNotifications.findAll.mockReturnValue(
				of({
					data: [],
					meta: {
						total: 0,
						lastPage: 1,
						currentPage: 2,
						perPage: 10,
						prev: 1,
						next: null,
					},
				}),
			)

			await firstValueFrom(service.loadNotifications({ page: 2, limit: 10 }))

			expect(mockNotifications.findAll).toHaveBeenCalledWith({
				page: 2,
				limit: 10,
			})
		})

		it('should reset loading on error', async () => {
			mockNotifications.findAll.mockReturnValue(
				throwError(() => new Error('Network error')),
			)

			await expect(firstValueFrom(service.loadNotifications())).rejects.toThrow(
				'Network error',
			)

			expect(service.loading()).toBe(false)
		})
	})

	describe('refreshUnreadCount()', () => {
		it('should update unreadCount signal', async () => {
			mockNotifications.getUnreadCount.mockReturnValue(of({ count: 5 }))

			const result = await firstValueFrom(service.refreshUnreadCount())

			expect(result).toBe(5)
			expect(service.unreadCount()).toBe(5)
		})
	})

	describe('markAsRead()', () => {
		it('should mark notification as read and decrement unread count', async () => {
			const n1 = makeNotification({ id: 'n-1', isRead: false })
			const n2 = makeNotification({ id: 'n-2', isRead: false })
			service.notifications.set([n1, n2])
			service.unreadCount.set(2)

			mockNotifications.markAsRead.mockReturnValue(of(undefined))

			await firstValueFrom(service.markAsRead('n-1'))

			expect(mockNotifications.markAsRead).toHaveBeenCalledWith('n-1')
			expect(service.notifications()[0].isRead).toBe(true)
			expect(service.notifications()[1].isRead).toBe(false)
			expect(service.unreadCount()).toBe(1)
		})

		it('should not go below zero unread count', async () => {
			service.unreadCount.set(0)
			service.notifications.set([makeNotification({ id: 'n-1', isRead: true })])

			mockNotifications.markAsRead.mockReturnValue(of(undefined))

			await firstValueFrom(service.markAsRead('n-1'))

			expect(service.unreadCount()).toBe(0)
		})
	})

	describe('markAllAsRead()', () => {
		it('should mark all notifications as read and reset unread count', async () => {
			service.notifications.set([
				makeNotification({ id: 'n-1', isRead: false }),
				makeNotification({ id: 'n-2', isRead: false }),
			])
			service.unreadCount.set(2)

			mockNotifications.markAllAsRead.mockReturnValue(of(undefined))

			await firstValueFrom(service.markAllAsRead())

			expect(service.notifications().every((n) => n.isRead)).toBe(true)
			expect(service.unreadCount()).toBe(0)
		})
	})

	describe('deleteNotification()', () => {
		it('should remove notification from list', async () => {
			const n1 = makeNotification({ id: 'n-1', isRead: false })
			const n2 = makeNotification({ id: 'n-2', isRead: true })
			service.notifications.set([n1, n2])
			service.unreadCount.set(1)

			mockNotifications.delete.mockReturnValue(of(undefined))

			await firstValueFrom(service.deleteNotification('n-1'))

			expect(mockNotifications.delete).toHaveBeenCalledWith('n-1')
			expect(service.notifications()).toEqual([n2])
			expect(service.unreadCount()).toBe(0)
		})

		it('should not decrement unread count when deleting a read notification', async () => {
			const n1 = makeNotification({ id: 'n-1', isRead: true })
			service.notifications.set([n1])
			service.unreadCount.set(3)

			mockNotifications.delete.mockReturnValue(of(undefined))

			await firstValueFrom(service.deleteNotification('n-1'))

			expect(service.notifications()).toEqual([])
			expect(service.unreadCount()).toBe(3)
		})
	})

	describe('displayBadge', () => {
		it('should return null when unread count is 0', () => {
			service.unreadCount.set(0)
			expect(service.displayBadge()).toBeNull()
		})

		it('should return string count for 1-9', () => {
			service.unreadCount.set(3)
			expect(service.displayBadge()).toBe('3')
		})

		it('should return "9+" for counts over 9', () => {
			service.unreadCount.set(15)
			expect(service.displayBadge()).toBe('9+')
		})
	})

	describe('groupedNotifications', () => {
		it('should group notifications by date with labels', () => {
			const today = new Date().toISOString().slice(0, 10)
			const yesterday = new Date(Date.now() - 86_400_000)
				.toISOString()
				.slice(0, 10)

			const n1 = makeNotification({
				id: 'n-1',
				createdAt: `${today}T10:00:00.000Z`,
			})
			const n2 = makeNotification({
				id: 'n-2',
				createdAt: `${yesterday}T08:00:00.000Z`,
			})
			const n3 = makeNotification({
				id: 'n-3',
				createdAt: '2026-01-15T12:00:00.000Z',
			})

			service.notifications.set([n1, n2, n3])

			const groups = service.groupedNotifications()

			expect(groups).toHaveLength(3)
			expect(groups[0].label).toBe('Today')
			expect(groups[0].notifications).toEqual([n1])
			expect(groups[1].label).toBe('Yesterday')
			expect(groups[1].notifications).toEqual([n2])
			expect(groups[2].label).toContain('January')
			expect(groups[2].notifications).toEqual([n3])
		})

		it('should return empty array when no notifications', () => {
			service.notifications.set([])
			expect(service.groupedNotifications()).toEqual([])
		})
	})

	describe('panel state', () => {
		it('should toggle panel open/closed', () => {
			expect(service.panelOpen()).toBe(false)

			service.togglePanel()
			expect(service.panelOpen()).toBe(true)

			service.togglePanel()
			expect(service.panelOpen()).toBe(false)
		})

		it('should close panel', () => {
			service.panelOpen.set(true)
			service.closePanel()
			expect(service.panelOpen()).toBe(false)
		})
	})
})
