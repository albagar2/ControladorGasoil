import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { GasPriceService } from '../services/gas-price.service';

const router = Router();

router.get('/cheapest', asyncHandler(async (req, res) => {
    const province = (req.query.province as string) || 'Madrid';
    const limit = parseInt(req.query.limit as string) || 5;
    const prices = await GasPriceService.getCheapestByProvince(province, limit);
    res.json(prices);
}));

router.get('/', asyncHandler(async (req, res) => {
    const prices = await GasPriceService.getPrices();
    res.json(prices.slice(0, 20)); // Return top 20 by default
}));

export default router;
