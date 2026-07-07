import { ExecutionContext, Injectable, Logger } from '@nestjs/common'
import { ThrottlerGuard, ThrottlerLimitDetail } from '@nestjs/throttler'

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
	private readonly logger = new Logger(CustomThrottlerGuard.name)

	protected async getTracker(req: Record<string, any>): Promise<string> {
		// checks by user id
		return req.user?.userId ?? req.ip
	}

	protected async throwThrottlingException(
		context: ExecutionContext,
		throttlerLimitDetail: ThrottlerLimitDetail,
	): Promise<void> {
		const req = context.switchToHttp().getRequest()
		this.logger.warn(
			`Rate limit exceeded: ${req.method} ${req.path} from ${throttlerLimitDetail.tracker}`,
		)
		return super.throwThrottlingException(context, throttlerLimitDetail) // throw 429 error
	}
}
