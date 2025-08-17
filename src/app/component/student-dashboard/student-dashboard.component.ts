import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as alasql from 'alasql';
import * as XLSX from 'xlsx';
import { ToastrService } from 'ngx-toastr';
import { Student } from 'src/app/dto/Student';
import { StudentService } from 'src/app/service/student.service';

@Component({
  selector: 'app-student-dashboard',
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css'],
})
export class StudentDashboardComponent implements OnInit {
  OriginalStudentList!: Student[];
  studentList!: Student[];
  searchValue: any = '';
  columnsList = [
  { name: "roll_no",       isDefault: true },
  { name: "full_name",     isDefault: true },
  { name: "department",    isDefault: true },
  { name: "email",         isDefault: true },
  { name: "gender",        isDefault: true }, 
  { name: "address",       isDefault: false },
  { name: "address_type",  isDefault: false },
  { name: "age",           isDefault: false },
  { name: "date_of_birth", isDefault: false },
  { name: "district",      isDefault: false },
  { name: "passout_year",  isDefault: false },
  { name: "start_year",    isDefault: false },
  { name: "mobile_number", isDefault: false },
  { name: "nationality",   isDefault: false },
  { name: "pincode",       isDefault: false },
  { name: "blood_group",   isDefault: false },
  { name: "state",         isDefault: false }
  ];
  columnListCopy = this.columnsList;

  downloadOption: string[] = ['xlsx', 'json'];
  downloadpanelOpenState = false;

  //pagination variables
  table_pageNumber = 0;
  ITEMS_PER_PAGE: number = 5;
  MAX_PAGE!: number;
  startIndex: number = 0;
  endIndex: number = this.ITEMS_PER_PAGE;

  constructor(
    public studentService: StudentService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.studentList = this.studentService
      .getStudents()
      .filter((std) => std.active)
      .slice(0, this.ITEMS_PER_PAGE);
    this.OriginalStudentList = this.studentService
      .getStudents()
      .filter((std) => std.active);
    this.MAX_PAGE = Math.ceil(
      this.OriginalStudentList.length / this.ITEMS_PER_PAGE
    );
    console.log(this.studentList);
    //  this.studentService.getStudents().subscribe(response => {
    //   this.OriginalStudentList=response;
    //   this.studentList =[...this.OriginalStudentList];
    //  })
  }

  deleteStudent(id: string) {
    this.studentService.deleteStudent(id);
    this.OriginalStudentList = this.studentService.getStudents();
    this.studentList = [...this.OriginalStudentList];
    this.toastr.success('SucessFully delete');
  }

  editStudent(roll_no: string) {
    this.router.navigate(['/student/edit', roll_no]);
  }


  addStudent() {
    this.router.navigate(['/new-student']);
  }

  /* ------------------------ Table features  ------------------------ */

  // method triger when setting model open
  onTableSettingMenuOpen(searchInput:any){
    //reset the prev search value 
    if(searchInput.value){
      searchInput.value="";
      this.columnListCopy = this.columnsList;  
    }
  }

  //1.  download the table
  downloadTable(option: string) {
    alasql.setXLSX(XLSX);
    if (option === 'xlsx') {
      alasql
        .promise("SELECT * INTO xlsx('students_records.xlsx') from ?", [
          this.studentList,
        ])
        .then((res) => console.log(res))
        .catch((err) => console.log(err));
    } else if (option === 'json') {
      alasql
        .promise("SELECT * INTO json('students_records.json') from ?", [
          this.studentList,
        ])
        .then((res) => console.log(res))
        .catch((err) => console.log(err));
    }
  }

  //2. search the data
  handleSearch() {
    setTimeout(() => {
      if(this.searchValue ===""){
        this.sliceListBasedOnItems_Per_page();
        return;
      }

      this.studentList = this.OriginalStudentList.filter((std) =>
        std.full_name.startsWith(this.searchValue)
      );
      // console.log(this.studentService.getStudents());
    }, 600);
  }


  //3. for drag and drop
  drop(event: CdkDragDrop<Student[]>) {
    moveItemInArray(
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
  }

  //4. column selction

  toggleSelectAll(columnSelectionRef:any){
    if(columnSelectionRef.selectedOptions.selected.length === this.columnsList.length){
      columnSelectionRef.deselectAll()
    }else{
      columnSelectionRef.selectAll()
    }
    this.updateColumnSelection(columnSelectionRef.selectedOptions.selected)
  }
  updateColumnSelection(selectedColumns: any){
    console.log(selectedColumns);
    this.applyColumnSelection(selectedColumns);
    
  }
  applyColumnSelection(columnSelected :any){
    debugger;
    const selectedCol:string[] = columnSelected.map((col:any )=> col.value);

    if(selectedCol.length !== 5){
      this.toastr.warning("  Please Select Six Columns For Better Visibility","",{ closeButton: true,});
    }

    this.columnsList= this.columnsList.map((col)=>{
      if(selectedCol.includes(col.name)){
        col.isDefault=true;
      }else{
        col.isDefault=false;
      }
      return col;
    })
  }

  resetColumnSelection(){
    const defaultColumns= ["roll_no", "full_name","department","email","gender"]
    this.columnsList = this.columnsList.map((col) =>{
      col.isDefault = defaultColumns.includes(col.name)
      return col;
    })
    // this.columnListCopy = this.columnsList;
    console.log(this.columnsList)
  }

  searchColumn(event:Event){
    const searchColumnName  = (event.target as HTMLInputElement).value;
    this.columnListCopy = this.columnsList.filter((col) => col.name.toLowerCase().includes(searchColumnName.toLowerCase()));
    console.log(searchColumnName);
  }

  //5. pagination
  perPage() {
    if (this.startIndex > 0) {
      if (this.endIndex < this.ITEMS_PER_PAGE * 2) {
        this.startIndex = 0;
        this.endIndex = this.ITEMS_PER_PAGE;
        this.table_pageNumber -= 1;
      } else {
        this.startIndex -= this.ITEMS_PER_PAGE;
        this.endIndex -= this.ITEMS_PER_PAGE;
        this.table_pageNumber -= 1;
      }
      this.studentList = this.OriginalStudentList.slice(
        this.startIndex,
        this.endIndex
      );
      
    }
  }

  nextPage() {
    if (this.endIndex < this.OriginalStudentList.length) {
      this.table_pageNumber += 1;
      this.startIndex = this.table_pageNumber * this.ITEMS_PER_PAGE;
      this.endIndex = this.startIndex + Number(this.ITEMS_PER_PAGE);
      this.studentList = this.OriginalStudentList.slice(
        this.startIndex,
        this.endIndex
      );
    }
    console.log('next',this.OriginalStudentList.slice(this.startIndex, this.endIndex),'s:',this.startIndex,'e:', this.endIndex);
  }

  handleItems_per_page(event: any) {
    console.log(this.ITEMS_PER_PAGE);
    //reset the default value
    this.startIndex = 0;
    this.endIndex = this.ITEMS_PER_PAGE;
    this.MAX_PAGE = Math.ceil(
      this.OriginalStudentList.length / this.ITEMS_PER_PAGE
    );
    this.table_pageNumber = 0;
    //update the list
    this.sliceListBasedOnItems_Per_page(); 
  }

  checkDisable(btn:string){
    if(btn === "next"){
      return this.table_pageNumber === this.MAX_PAGE - 1;
    }else{
      
      return this.table_pageNumber === 0;
    }

  }

  /* ---------------------- REUSED FUNCTION ---------------------- */
  sliceListBasedOnItems_Per_page() {
    this.studentList = this.OriginalStudentList.slice(
      this.startIndex,
      this.endIndex
    );
    console.log(
      'in slice()',
      's',
      this.startIndex,
      'e',
      this.endIndex,
      this.studentList
    );
  }
}
