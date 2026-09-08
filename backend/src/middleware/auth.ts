import { Request, Response, NextFunction } from "express";

export interface AuthUser {
  userId: string;
  roleId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const userId = req.headers["x-user-id"] as string | undefined;
  const roleId = req.headers["x-role-id"] as string | undefined;

  if (!userId || !roleId) {
    res.status(401).json({
      error: "Unauthorized: Missing required headers x-user-id or x-role-id",
    });
    return;
  }

  req.user = {
    userId,
    roleId,
  };

  next();
};
