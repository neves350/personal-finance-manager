export const mockJwt = {
	sign: jest.fn().mockReturnValue('mock-jwt-token'),
	verify: jest.fn(),
}
