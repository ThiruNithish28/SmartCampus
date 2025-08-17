import { Component, OnInit } from '@angular/core';
import { Student } from 'src/app/dto/Student';

@Component({
  selector: 'app-staff-form',
  templateUrl: './staff-form.component.html',
  styleUrls: ['./staff-form.component.css']
})
export class StaffFormComponent implements OnInit {
  staff: Student= {
    full_name:"",
    date_of_birth:"", 
    email:"",
    mobile_number:0, 
    gender: "", 
    age: 0,
    roll_no: "", 
    department: "",
    start_year: "", 
    passout_year:"", 
    address_type:"", 
    address:"", 
    nationality:"",
    state: "",
    district: "", 
    pincode: 0,
    blood_group:"", 
    active: true
  }
  constructor() { }

  ngOnInit(): void {
  }

}
