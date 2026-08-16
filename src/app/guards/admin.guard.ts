import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

export const adminGuard: CanActivateFn = async (_route, _state) => {
  const supabaseService = inject(SupabaseService);
  const router = inject(Router);

  try {
    const session = await supabaseService.getSession();
    if (!session?.user) {
      return router.createUrlTree(['/comunidade']);
    }

    const ehAdmin = await supabaseService.temPermissaoModulo('comunidade', 'admin');
    if (ehAdmin) {
      return true;
    }
  } catch (err) {
    console.warn('Erro ao verificar permissão de admin:', err);
  }

  return router.createUrlTree(['/comunidade/preview']);
};
