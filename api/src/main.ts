import { Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { apiReference } from '@scalar/nestjs-api-reference'
import cookieParser from 'cookie-parser'
import { json, urlencoded } from 'express'
import { AppModule } from './app.module'

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		bodyParser: false,
		rawBody: true,
	})

	// Increase body limit for base64 avatar uploads
	// verify callback preserves raw body for webhook signature validation
	app.use(
		json({
			limit: '5mb',
			verify: (req: any, _res, buf) => {
				req.rawBody = buf
			},
		}),
	)
	app.use(urlencoded({ extended: true, limit: '5mb' }))

	// CORS
	app.enableCors({ origin: process.env.FRONTEND_URL, credentials: true })

	const config = new DocumentBuilder()
		.setTitle('Expenses Tracker API')
		.setDescription(
			'API for tracking personal and business expenses, managing budgets, and generating financial reports',
		)
		.setVersion('1.0.0')
		.addBearerAuth()
		.build()
	const documentFactory = () => SwaggerModule.createDocument(app, config)
	SwaggerModule.setup('api', app, documentFactory, {
		swaggerOptions: {
			persistAuthorization: true,
		},
	})

	app.use(
		'/docs',
		apiReference({
			theme: 'elysiajs',
			content: documentFactory,
		}),
	)

	app.useGlobalPipes(new ValidationPipe({ transform: true }))

	app.use(cookieParser())

	await app.listen(process.env.PORT ?? 3000)
	Logger.log('[INFO] Server listening at http://localhost:3000')
	Logger.log('[INFO] API Reference available at http://localhost:3000/docs')
}
bootstrap()
