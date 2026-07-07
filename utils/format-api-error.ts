/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import AppError from './app-error';
import { ZodError } from 'zod';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';

export function formatApiError(err: unknown) {
  if (process.env.NODE_ENV === 'development') console.log('API ERROR', err);

  let error = err as any;

  if (error instanceof AppError) {
    // already formatted, pass through
  } else if (error instanceof ZodError) {
    const message = error.issues.map(e => e.message).join('. ');
    error = new AppError(message, 400);
  } else if (error instanceof PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': {
        const target = error.meta?.target as string[] | undefined;
        const field = target?.[0] ?? 'Field';
        const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
        error = new AppError(message, 400);
        break;
      }
      case 'P2025': {
        const modelName = error.meta?.modelName as string | undefined;
        const resource = modelName
          ? modelName.charAt(0).toUpperCase() + modelName.slice(1).toLowerCase()
          : 'Resource';
        error = new AppError(`${resource} not found`, 404);
        break;
      }
      case 'P5010': {
        error = new AppError(
          'Server Connection Timeout. Please try again later.',
          503,
        );
        break;
      }
      default:
        error = new AppError(
          'Something went wrong. Please try again later',
          500,
        );
    }
  } else if (error?.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token. Please log in again.', 401);
  } else if (error?.name === 'TokenExpiredError') {
    error = new AppError('Your token has expired. Please log in again.', 401);
  } else if (!error || typeof error !== 'object') {
    error = new AppError(String(error), 500);
  } else {
    error = new AppError('Something went wrong', 500);
  }

  const statusCode: number = error.statusCode || 500;
  const status: string = error.status || 'error';
  const message: string = error.message || 'Something went wrong';

  if (process.env.NODE_ENV === 'development') {
    return NextResponse.json(
      {
        status,
        message,
        stack: error.stack,
        statusCode,
      },
      { status: statusCode },
    );
  } else if (error.isOperational) {
    return NextResponse.json(
      {
        status,
        message,
      },
      { status: statusCode },
    );
  } else {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Something went wrong',
      },
      { status: 500 },
    );
  }
}
