import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

export const authGuard: CanActivateFn = async (_route, _state) => {
  const supabaseService = inject(SupabaseService);
  const router = inject(Router);

  try {
    const session = await supabaseService.getSession();
    if (session?.user) {
      return true;
    }
  } catch (err) {
    console.warn('Aviso ao verificar sessão no authGuard:', err);
  }

  return router.createUrlTree(['/comunidade']);
};
