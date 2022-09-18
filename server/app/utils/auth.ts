import { NextFunction, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { HttpException } from '@app/classes/http.exception';
import { DataStoredInToken, RequestWithUser } from '@app/classes/auth.interface';
import userModel from '@app/models/users.model';
import { WEB_TOKEN_SECRET } from '@app/classes/global-constants';
import { HTTPStatusCode } from '@app/classes/constants/http-codes';

const authMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        /* eslint-disable */
        const Authorization = req.cookies['Authorization'] || (req.header('Authorization') ? req.header('Authorization')?.split('Bearer ')[1] : null);
        /* eslint-enable */

        if (Authorization) {
            const secretKey: string = WEB_TOKEN_SECRET;
            const verificationResponse = (await verify(Authorization, secretKey)) as DataStoredInToken;
            // eslint-disable-next-line no-underscore-dangle
            const userId = verificationResponse._id;
            const findUser = await userModel.findById(userId);

            if (findUser) {
                req.user = findUser;
                next();
            } else {
                next(new HttpException(HTTPStatusCode.Unauthorized, 'Wrong authentication token'));
            }
        } else {
            next(new HttpException(HTTPStatusCode.NotFound, 'Authentication token missing'));
        }
    } catch (error) {
        next(new HttpException(HTTPStatusCode.Unauthorized, 'Wrong authentication token'));
    }
};

export default authMiddleware;
