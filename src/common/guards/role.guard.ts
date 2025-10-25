import { CanActivate, ExecutionContext, Injectable, Logger } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLE_KEY } from "../decorators/roles.decorator";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private reflector:Reflector) {}
    async canActivate(context: ExecutionContext) {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
              context.getHandler(),
              context.getClass(),
        ]);

        if (isPublic) return true;

        const ExpectedRole = this.reflector.getAllAndOverride<string>(ROLE_KEY,[
            context.getHandler(),
            context.getClass()
        ]);

        if(!ExpectedRole) return true
        
        const req = context.switchToHttp().getRequest();
        
        Logger.debug(ExpectedRole,req.user)

        if(req.user.role == ExpectedRole)  return true;
        
        return false;
    }
}