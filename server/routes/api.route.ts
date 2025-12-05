/**
 * 业务 API 路由 - 返回 Mock 数据
 */

import { Router, Request, Response } from 'express';
import { APIExecutor } from '../orchestrator/api-executor';
import { ApiCallConfig, ApiResponse } from '../../shared/types';

const router = Router();
const apiExecutor = new APIExecutor();

/**
 * POST /api/flights/search
 * 搜索航班
 */
router.post('/flights/search', async (req: Request, res: Response) => {
  try {
    const params = req.body;
    
    const apiCall = new ApiCallConfig(
      'flights/search',
      '/api/flights/search',
      'POST',
      params
    );

    const result = await apiExecutor.execute(apiCall);

    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/flights/detail
 * 获取航班详情
 */
router.post('/flights/detail', async (req: Request, res: Response) => {
  try {
    const params = req.body;
    
    const apiCall = new ApiCallConfig(
      'flights/detail',
      '/api/flights/detail',
      'POST',
      params
    );

    const result = await apiExecutor.execute(apiCall);

    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/hotels/search
 * 搜索酒店
 */
router.post('/hotels/search', async (req: Request, res: Response) => {
  try {
    const params = req.body;
    
    const apiCall = new ApiCallConfig(
      'hotels/search',
      '/api/hotels/search',
      'POST',
      params
    );

    const result = await apiExecutor.execute(apiCall);

    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/hotels/detail
 * 获取酒店详情
 */
router.post('/hotels/detail', async (req: Request, res: Response) => {
  try {
    const params = req.body;
    
    const apiCall = new ApiCallConfig(
      'hotels/detail',
      '/api/hotels/detail',
      'POST',
      params
    );

    const result = await apiExecutor.execute(apiCall);

    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/weather/query
 * 查询天气
 */
router.post('/weather/query', async (req: Request, res: Response) => {
  try {
    const params = req.body;
    
    const apiCall = new ApiCallConfig(
      'weather/query',
      '/api/weather/query',
      'POST',
      params
    );

    const result = await apiExecutor.execute(apiCall);

    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

