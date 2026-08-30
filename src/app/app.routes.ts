import { Routes } from '@angular/router';
import { HomeComponent } from './components/home.component';
import { PlaceholderPageComponent } from './components/placeholder-page.component';
import { AmorimArquiteturaComponent } from './components/amorim-arquitetura.component';
import { AmorimTechComponent } from './components/amorim-tech.component';
import { AmorimAcademyComponent } from './components/amorim-academy.component';
import { ContatoComponent } from './components/contato.component';
import { LinksBioComponent } from './components/links-bio.component';
import { ComunidadeComponent } from './components/comunidade.component';
import { ComunidadePreviewComponent } from './components/comunidade-preview.component';
import { BlogComponent } from './components/blog.component';
import { AdminPanelComponent } from './components/admin-panel.component';
import { VerificarCertificadoComponent } from './components/verificar-certificado.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'amorim-arquitetura',
    component: AmorimArquiteturaComponent,
  },
  {
    path: 'amorim-tech',
    component: AmorimTechComponent,
  },
  {
    path: 'amorim-academy',
    component: AmorimAcademyComponent,
  },
  {
    path: 'verificar-certificado',
    component: VerificarCertificadoComponent,
  },
  {
    path: 'blog',
    component: BlogComponent,
  },
  {
    path: 'blog/:slug',
    component: BlogComponent,
  },
  {
    path: 'comunidade',
    component: ComunidadeComponent,
  },
  {
    path: 'comunidade/preview',
    component: ComunidadePreviewComponent,
    canActivate: [authGuard],
  },
  {
    path: 'redefinir-senha',
    component: ComunidadeComponent,
  },
  {
    path: 'contato',
    component: ContatoComponent,
  },
  {
    path: 'links',
    component: LinksBioComponent,
  },
  {
    path: 'admin',
    component: AdminPanelComponent,
    canActivate: [adminGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
