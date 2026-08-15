import { Routes } from '@angular/router';
import { HomeComponent } from './components/home.component';
import { PlaceholderPageComponent } from './components/placeholder-page.component';
import { AmorimArquiteturaComponent } from './components/amorim-arquitetura.component';
import { AmorimTechComponent } from './components/amorim-tech.component';
import { AmorimAcademyComponent } from './components/amorim-academy.component';

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
    path: 'blog',
    component: PlaceholderPageComponent,
    data: { title: 'Blog' },
  },
  {
    path: 'comunidade',
    component: PlaceholderPageComponent,
    data: { title: 'Comunidade' },
  },
  {
    path: 'contato',
    component: PlaceholderPageComponent,
    data: { title: 'Contato' },
  },
  {
    path: 'admin',
    component: PlaceholderPageComponent,
    data: { title: 'Admin' },
  },
  {
    path: '**',
    redirectTo: '',
  },
];
