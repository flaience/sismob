import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.userId) return false;

    const papel = String(user.papel ?? '');
    const cargo = String(user.cargo ?? '').toLowerCase();

    const isFlaienceAdmin = papel === '0';
    const isOwner = papel === '6';
    const isTeam = papel === '1';

    const hasKnownCargo = [
      'administrador',
      'admin',
      'gerente',
      'financeiro',
      'corretor',
      'secretaria',
    ].includes(cargo);

    return isFlaienceAdmin || isOwner || isTeam || hasKnownCargo;
  }
}
