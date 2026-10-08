import { Controller, Get, Inject } from '@nestjs/common';
import type { HealthCheckResponse } from '@food-delivery/types';

import type { Database } from './db';
import { users } from './db/schema';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('Health')
export class AppController {
  constructor(
    @Inject('DB')
    private readonly db: Database,
  ) { }



  @Get('health')
  @ApiOperation({ summary: 'Check API health' })
  healthCheck(): HealthCheckResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
