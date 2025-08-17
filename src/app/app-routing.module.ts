import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StudentFormComponent } from './component/student-form/student-form.component';
import { StudentDashboardComponent } from './component/student-dashboard/student-dashboard.component';
const routes: Routes = [
  {path:'new-student', component:StudentFormComponent},
  {path:"students", component:StudentDashboardComponent},
  {path:"student/edit/:roll_no", component:StudentFormComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
