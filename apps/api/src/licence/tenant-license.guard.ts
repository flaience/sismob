import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { FlaienceLicenseService } from './flaience-license.service';

@Injectable()
export class TenantLicenseGuard implements CanActivate {
  constructor(private readonly licenseService: FlaienceLicenseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const user = request.user;

    if (!user?.userId) {
      throw new ForbiddenException('Usuário não identificado.');
    }

    const papel = String(user.papel ?? '');

    /*
     * O Super-Admin Flaience pode acessar o SISMOB
     * para suporte mesmo que o tenant esteja bloqueado.
     */
    if (papel === '0') {
      return true;
    }

    const tenantId = user.tenantId;

    if (!tenantId) {
      throw new ForbiddenException('Tenant não identificado para o usuário.');
    }

    try {
      const license = await this.licenseService.validateSismobTenant(tenantId);

      request.license = license;

      if (!license.allowed) {
        throw new ForbiddenException(license.message);
      }

      return true;
    } catch (error: any) {
      if (error instanceof ForbiddenException) {
        throw error;
      }

      /*
       * Neste primeiro momento adotamos fail-closed:
       * se não for possível validar, operações protegidas
       * permanecem bloqueadas.
       */
      throw new ServiceUnavailableException(
        'Não foi possível confirmar a licença do SISMOB. Tente novamente em instantes.',
      );
    }
  }
}
