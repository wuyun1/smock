// @ts-ignore

import formidable from 'formidable';
import { Request, Response } from 'express';

export function multipartMiddleware (req: Request, res: Response, next: any): void {
  if ((req.headers['content-type'] || '').match('multipart/form-data')) {
    const form = formidable({ multiples: true });
    form.parse(req, (err: any, fields: any, files: any) => {
      if (err) {
        next(err);
      }
      const body = { ...fields, ...files };
      console.log('body', body);
      req.body = body;
      next();
    });
  } else {
    next();
  }
}
