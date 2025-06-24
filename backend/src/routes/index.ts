// This file can be used for future route aggregation or OpenAPI setup if needed.
import { Router } from 'express';
import ordersRouter from './orders';
import productsRouter from './products';
import authRouter from './auth';
import pushNotificationsRouter from './pushNotifications';
import predictionsRouter from './predictions';
import purchasePatternsRouter from './purchasePatterns';
import geminiRouter from './gemini';
import emailWebhookRouter from './webhooks/email';
import emailProcessingRouter from './emailProcessing';

const router = Router();

router.use('/orders', ordersRouter);
router.use('/products', productsRouter);
router.use('/auth', authRouter);
router.use('/push-notifications', pushNotificationsRouter);
router.use('/predictions', predictionsRouter);
router.use('/purchase-patterns', purchasePatternsRouter);
router.use('/gemini', geminiRouter);
router.use('/webhooks', emailWebhookRouter);
router.use('/email-processing', emailProcessingRouter);

export default router;
