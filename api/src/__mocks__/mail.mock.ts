export const mockMail = {
	sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
	sendNotificationEmail: jest.fn().mockResolvedValue(undefined),
}
