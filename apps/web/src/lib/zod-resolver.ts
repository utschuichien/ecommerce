import { Resolver, FieldErrors } from 'react-hook-form';
import { ZodType } from 'zod';

/**
 * Custom Zod Resolver tương thích hoàn hảo cả Zod v3 (.errors) và Zod v4 (.issues)
 * Ngăn chặn lỗi throw ZodError chưa bắt khi người dùng submit form rỗng.
 */
export function customZodResolver<T extends Record<string, any>>(
  schema: ZodType<any, any, any>,
): Resolver<T> {
  return async (values) => {
    const result = await schema.safeParseAsync(values);

    if (result.success) {
      return {
        values: result.data as T,
        errors: {},
      };
    }

    const errors: FieldErrors<T> = {};
    const issues =
      (result.error as any)?.issues || (result.error as any)?.errors || [];

    for (const issue of issues) {
      const fieldName = (issue.path?.[0] || 'root') as keyof T;
      if (!errors[fieldName]) {
        (errors as any)[fieldName] = {
          type: issue.code || 'validation',
          message: issue.message,
        };
      }
    }

    return {
      values: {},
      errors,
    };
  };
}

