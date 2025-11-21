import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { SociosComponent } from './socios/socios.component';
import { PagosComponent } from './pagos/pagos.component';
import { EstadisticasComponent } from './estadisticas/estadisticas.component';
import { PersonalComponent } from './personal/personal.component';
import { InventarioComponent } from './inventario/inventario.component';

export const routes: Routes = [
    { path: '', component: LoginComponent },
    { path: 'home', component: HomeComponent},
    { path: 'login', component: LoginComponent},
    { path: 'socios', component: SociosComponent},
    { path: 'pagos', component: PagosComponent},
    { path: 'estadisticas', component:  EstadisticasComponent},
    { path: 'personal', component: PersonalComponent},
    { path: 'inventario', component: InventarioComponent}

];
