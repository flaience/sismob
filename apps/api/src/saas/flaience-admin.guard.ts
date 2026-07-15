import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class FlaienceAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.userId) {
      throw new ForbiddenException('Usuário não identificado.');
    }

    const papel = String(user.papel ?? '');

    if (papel !== '0') {
      throw new ForbiddenException(
        'Somente o Super-Admin Flaience pode provisionar clientes.',
      );
    }

    return true;
  }
}
