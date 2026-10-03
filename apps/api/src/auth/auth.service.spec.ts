import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { Database } from '../db';
import { User } from '../db/schema';
import { AuthService } from './auth.service';

describe('AuthService.login', () => {
  let service: AuthService;
  let matchingUser: User | undefined;
  let comparePassword: jest.SpyInstance;

  beforeEach(() => {
    matchingUser = undefined;

    const where = jest.fn().mockImplementation(async () =>
      matchingUser ? [matchingUser] : [],
    );
    const from = jest.fn().mockReturnValue({ where });
    const db = {
      select: jest.fn().mockReturnValue({ from }),
    } as unknown as Database;

    service = new AuthService(
      db,
      { sign: jest.fn().mockReturnValue('token') } as unknown as JwtService,
    );
    comparePassword = jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);
  });

  afterEach(() => {
    comparePassword.mockRestore();
  });

  it('returns generic unauthorized credentials for an unknown email without comparing a password', async () => {
    await expect(
      service.login({ email: 'missing@example.com', password: 'password' }),
    ).rejects.toMatchObject({
      status: 401,
      response: 'Invalid Credentials',
    });

    expect(comparePassword).not.toHaveBeenCalled();
  });

  it('returns the same generic unauthorized credentials for a wrong password', async () => {
    matchingUser = {
      id: 'user-id',
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      password: 'hashed-password',
      role: 'CUSTOMER',
      pushToken: null,
      isOnline: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await expect(
      service.login({ email: matchingUser.email, password: 'wrong-password' }),
    ).rejects.toMatchObject({
      status: 401,
      response: 'Invalid Credentials',
    });

    expect(comparePassword).toHaveBeenCalledWith(
      'wrong-password',
      'hashed-password',
    );
  });
});
