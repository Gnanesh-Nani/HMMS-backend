import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import {Strategy, ExtractJwt} from 'passport-jwt';
import { Request } from "express";
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => req?.cookies?.jwt || null,
                ExtractJwt.fromAuthHeadersAsBearerToken(),
            ]),
            ignoreExpiration: false,
            secretOrKey: 'secret-key',
        })
    }

    async validate(payload: any) {
        return {userId:payload.sub};
    }
}