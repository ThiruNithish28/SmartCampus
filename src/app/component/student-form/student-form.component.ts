import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentService } from 'src/app/service/student.service';
import { ToastrService } from 'ngx-toastr';
import { options } from 'alasql';


@Component({
  selector: 'app-student-form',
  templateUrl: './student-form.component.html',
  styleUrls: ['./student-form.component.css']
})
export class StudentFormComponent implements OnInit {
  isEditForm:boolean = false;
  editRollNo: any;
  studentFormSections = [
    {
      title: 'Personal Details',
      subSec: [
        {placeholder:"enter your full name", name: 'Full Name', type: 'text',  validate:["required","minLength:5"]},
        {placeholder:"enter your dob", name: 'Date of Birth', type: 'date'},
        {placeholder:"enter your email", name: 'Email', type: 'email', validate:["email","required"]},
        {placeholder:"enter your mobile no", name: 'Mobile Number', type: 'number' ,  validate:["required","minLength:10", "maxLength:10"]},
        {placeholder:"enter your gender", name: 'Gender', type: 'select', options:['male','female'] , validate:["required"]},
        {placeholder:"enter your age", name: 'Age', type: 'number', validate:["underAgeValidator:18"] },
        {placeholder:"enter your blood group", name: 'Blood Group', type: 'radio', options:['A+','B+','A-',"O+","O-"] },
      ],
    },
    {
      title: 'Identity Details',
      subSec: [
        {placeholder:"enter your roll no", name: 'Roll No', type: 'text', validate:["required","minLength:2"]},
        {placeholder:"enter your department", name: 'Department', type: 'select', options:["CSE", "ECE","MECH","IT"] ,  validate:["required"]},
        {placeholder:"enter your start year", name: 'Start Year', type: 'monthYear' , validate:["min:1980"]},
        {placeholder:"enter your end year", name: 'Passout Year', type: 'monthYear',validate:["min:1980"] },
      ],
    },
    {
      title: 'Address Details',
      subSec: [
        {placeholder:"enter your (perment / temparory)", name: 'Address Type', type: 'select', options:["permanent", "temporary"] },
         {placeholder:"enter your address", name: 'Address', type: 'text' },
        {placeholder:"enter your nationality", name: 'Nationality', type: 'text' },
        {placeholder:"enter your state", name: 'State', type: 'text' },
        {placeholder:"enter your district", name: 'District', type: 'text' },
        {placeholder:"enter your pincode", name: 'Pincode', type: 'number',  validate:["minLength:6"] }
      ],
    },
  ];

  studentForm: FormGroup;

  constructor(
    private fb: FormBuilder, 
    private studentService: StudentService, 
    private router: Router, 
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.studentForm = this.fb.group({});
    this.buildForm();
    console.log("Age",this.studentForm.get(this.getControlName('Age')) ,this.studentForm.get(this.getControlName('Age'))?.errors);
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params =>{
      this.editRollNo = params.get('roll_no');
      if(this.editRollNo){
        this.isEditForm=true;
        const selectedStudent= this.studentService.getStudentById(this.editRollNo);
        console.log("selected" ,this.studentService.getStudentById(this.editRollNo));
        if(selectedStudent){
          this.studentForm.patchValue(selectedStudent);
          console.log("student", selectedStudent)
        }
      }
    })


    //automate calculation of age and validation
    this.studentForm.get('date_of_birth')?.valueChanges.subscribe((dob:Date) =>{
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const montDiff = today.getMonth() - dob.getMonth();
      const dateDiff = today.getDate() - dob.getDate();
      if(montDiff < 0 || (montDiff === 0 && dateDiff < 0)){
        age--;
      }
  
      const ageControl = this.studentForm.get('age');
      ageControl?.setValue(age, { emitEvent: false }); 
      ageControl?.updateValueAndValidity();
      ageControl?.markAsDirty();
      ageControl?.markAsTouched(); //forec error to show imediatly 
    })

    this.studentForm.get('passout_year')?.valueChanges.subscribe((passoutYear:number) => {
      const startYear = this.studentForm.get('start_year')?.value;
      function checkValidPassOut(start_year:number):ValidatorFn{
        return (control: AbstractControl):ValidationErrors | null =>{
          const passoutYear = control.value;
          if(passoutYear === null || isNaN(passoutYear)){
            return null
          }

          return passoutYear < start_year 
            ? {yearValidation: true}
            : null;
        }
      }

      const passoutControl = this.studentForm.get('passout_year');
      passoutControl?.setValidators(checkValidPassOut(startYear));
      passoutControl?.updateValueAndValidity();
      passoutControl?.markAsDirty();
      passoutControl?.markAsTouched();

      
    })
  }

  buildForm() {
    //custom validation
    function underAgeValidation(minAge: number): ValidatorFn {
      return (control: AbstractControl): ValidationErrors | null  =>{
        const value = control.value
        if( value === null || isNaN(value)){
          return null;
        }

        return value < 18 
          ? {underAge: {requiredAge: minAge, actualAge: value }}
          : null
        ;
      }
    }

    // form build with add validation
    this.studentFormSections.forEach((section) => {
      section.subSec.forEach((field) => {
        const controlName = this.getControlName(field.name);
        const activeValidators: any=[];
        field.validate?.forEach(condition =>{

          if(condition === "required") activeValidators.push( Validators.required);
          if(condition === "email") activeValidators.push(Validators.email);
          if(condition.startsWith("minLength")){
            const length = condition.split(":");
            activeValidators.push(Validators.minLength(Number(length[1])))
          }
          if(condition.startsWith("maxLength")){
            const length = condition.split(":");
            activeValidators.push(Validators.maxLength(Number(length[1])))
          }
          if(condition.startsWith("max")){
            const length = parseInt(condition.split(":")[1]);
            activeValidators.push(Validators.max(length))
          }
          if(condition.startsWith("min")){
            const length = parseInt(condition.split(":")[1]);
            activeValidators.push(Validators.min(length));
          }
          if(condition.startsWith("underAgeValidator")){
            const minAge = parseInt(condition.split(":")[1]);
            console.log("validation is added");
            activeValidators.push(underAgeValidation(minAge));
          }
        })
        this.studentForm.addControl(controlName, new FormControl('', activeValidators));
        console.log(this.studentForm.get(controlName));
      });
    });
    
  }



  getControlName(name: string): string{
    return name.replace(/\s+/g,"_").toLowerCase();
  }

  submitForm(){
    if(this.studentForm.valid){
      console.log(this.studentForm.value);
      if(this.studentService.addStudent(this.studentForm.value)){
        this.studentForm.reset();
        this.toastr.success("sucessfully added");
        this.router.navigate(["/students"]);
      }else{
        this.toastr.error("roll no already exists","OOPS! Error");
      }

      // whic give value even if input is disable
      // this.studentService.addStudent(this.studentForm.getRawValue());
      // console.log("student", this.studentService.getStudents()[0]);
    }
    else{
      this.toastr.error("please fill the required fields");
    }
  }

  updateForm(){
    console.log("updated", this.studentForm.getRawValue())
    this.studentService.updateStudent(this.studentForm.value);
    this.toastr.success("sucessfully update", "Sucess")
    this.router.navigate(["/students"]);
  }

  resetForm(){
    this.studentForm.reset();
  }

  // validatePassOutYear(event:any){
  //   const startYear = this.studentForm.get("start_year")
  //   if(startYear){
  //     if(event.target.value < startYear) 
  //   }
  // }

}

// note:
/* in the router.navigate([])
    if the url is /user/123 then we pass as .navigate(["/user",userID]) or .navigate(["/user",123])
    if the url is /user/details/123 then we pass as .navigate(["/user","details",userID])
    * we can give query param also 
        this.router.navigate(['/products'], { queryParams: { order: 'asc', priceRange: 'high' } });

 */