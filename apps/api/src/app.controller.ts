import { Controller, Get, Inject } from '@nestjs/common';
import type { HealthCheckResponse } from '@food-delivery/types';

import type { Database } from './db';
import { users } from './db/schema';

@Controller()
export class AppController {
  constructor(
    @Inject('DB')
    private readonly db: Database,
  ) { }

  @Get("db-test")
  async dbTest() {
    const result = await this.db
      .select()
      .from(users)
      .limit(1);

    return {
      users: result,
      count: result.length,
    };
  }

  @Get('health')
  healthCheck(): HealthCheckResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}