// This file can be used for future route aggregation or OpenAPI setup if needed.
import { Router } from 'express';
import ordersRouter from './orders';
import productsRouter from './products';
import authRouter from './auth';
import pushNotificationsRouter from './pushNotifications';
import predictionsRouter from './predictions';
import purchasePatternsRouter from './purchasePatterns';

const router = Router();

router.use('/orders', ordersRouter);
router.use('/products', productsRouter);
router.use('/auth', authRouter);
router.use('/push-notifications', pushNotificationsRouter);
router.use('/predictions', predictionsRouter);
router.use('/purchase-patterns', purchasePatternsRouter);

export default router;
