import { Component, OnInit } from '@angular/core';

import {
  AbstractControl,
  ControlContainer,
  FormArray,
  FormControl,
  FormGroup,
  UntypedFormBuilder,
  UntypedFormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { NgxImageCompressService } from 'ngx-image-compress';
import { NzTabPosition } from 'ng-zorro-antd/tabs';
import { UserService } from 'src/services/user.service';
import { AuthService } from 'src/services/auth.service';
import { nationalities } from 'src/app/nationalities';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ThemeService } from 'src/services/theme.service';
import { Subscription } from 'rxjs';
import { SeafarerService } from 'src/services/seafarer.service';
import { EndUserService } from 'src/services/end-user.service';
@Component({
  selector: 'app-individualprofile',
  templateUrl: './individualprofile.component.html',
  styleUrls: ['./individualprofile.component.css'],
})
export class IndividualprofileComponent {
  [x: string]: any;
  isSpinning = false;
  showUserProfile = true;
  showChangePassword = false;
  showInfo = false;
  showSocialLinks = false;
  showConnections = false;
  showNotifications = false;
  showSubscription = false;
  showPaymentMethod = false;
  showCloseAccount = false;
  validateForm: any;
  control: any;
  originalFormValues: any;
  showAddPhotoOverlay: boolean = false;
  savechangesloading: Boolean = false;
  uploadphotoloading: Boolean = false;
  photonotchanged: Boolean = true;

  isDarkTheme!: boolean;
  private themeSubscription!: Subscription;

  triggerFileInput() {
    const fileInput = document.getElementById('avatar-input-file');
    if (fileInput) {
      fileInput.click();
    }
  }

  passwordVisible1 = false;
  passwordVisible2 = false;
  passwordVisible3 = false;
  loading: boolean = false;
  tabs: Array<{ name: string; content: string; disabled: boolean }> = [];
  nzTabPosition: NzTabPosition = 'top';
  selectedIndex = 27;

  log(args: any[]): void {
    console.log(args);
  }

  username: string = '';
  name: string = '';
  email: string = '';
  company: string = '';
  file: string = '';
  selectedValue = null;
  userId: any;
  placeholderColor: string = '#e0e0e0';

  adduserform!: FormGroup;
  changePasswordForm!: FormGroup;

  userName: any;
  imgResultAfterResize!: string;

  constructor(
    private fb: UntypedFormBuilder,
    private imageCompress: NgxImageCompressService,
    private userService: UserService,
    private authService: AuthService,
    private message: NzMessageService,
    private themeService: ThemeService,
    private seaService: SeafarerService,
    private enduserService: EndUserService
  ) {
    this.adduserform = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.email, Validators.required]],
      gender: ['', [Validators.required]],
      phoneNo: ['', [Validators.required]],
      nationality: ['', [Validators.required]],
      userDob: ['', [Validators.required]],
      companyName: ['', [Validators.required]],
      password: ['', [Validators.required]],
      newPassword: ['', [Validators.required]],

      confirmpassword: ['', [Validators.required, this.confirmationValidator]],
    });

    this.changePasswordForm = this.fb.group({
      password: ['', [Validators.required]],
      newPassword: ['', [Validators.required]],
      confirmpassword: ['', [Validators.required]],
    });

    this.originalFormValues = { ...this.adduserform.value };
  }

  get firstName() {
    return this.adduserform.get('firstName');
  }
  get lastName() {
    return this.adduserform.get('lastName');
  }
  checked = true;

  updateConfirmValidator(): void {
    /** wait for refresh value */
    Promise.resolve().then(() =>
      this.adduserform.controls['confirmpassword'].updateValueAndValidity()
    );
  }

  generateRandomColor(): string {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
  }

  confirmationValidator: ValidatorFn = (
    control: AbstractControl
  ): { [s: string]: boolean } => {
    if (!control.value) {
      return { required: true };
    } else if (
      control.value !== this.adduserform.controls['newPassword'].value
    ) {
      return { confirm: true, error: true };
    }
    return {};
  };

  selectedFile!: File;
  selectedFileName!: string;
  fileSizeError: string | null = null;

  async onFileChange(event: any) {
    this.photonotchanged = false;

    const files = event.target.files as FileList;

    if (files.length > 0) {
      let selectedFile = files[0];

      if (selectedFile) {
        try {
          // Log the original size of the image
          console.log(
            'Original Size:',
            this.calculateFileSizeInKB(selectedFile.size)
          );

          // Check if the image size is greater than 500 KB
          if (selectedFile.size > 500 * 1024) {
            // Convert the selected file to a data URL
            const dataUrl: string = await this.convertFileToDataUrl(
              selectedFile
            );

            // Convert the image to JPEG if it's not already
            if (selectedFile.type !== 'image/jpeg') {
              const jpegDataUrl: string = await this.convertToJPEG(dataUrl);
              console.log('Converted to JPEG:', jpegDataUrl);

              // Resize the JPEG image to reduce size (adjust the quality parameter as needed)
              const resizedImage: string =
                await this.imageCompress.compressFile(jpegDataUrl, -1, 75, 75);

              // Log the compressed size of the image
              const compressedBlob = this.dataURLtoBlob(resizedImage);
              console.log(
                'Compressed Size:',
                this.calculateFileSizeInKB(compressedBlob.size)
              );

              // Set the selected file to be the compressed or resized one
              selectedFile = new File([compressedBlob], selectedFile.name, {
                type: 'image/jpeg',
              });
              console.log('Converted to compress JPEG:', selectedFile);
            } else {
              // Resize the image using ngx-image-compress (adjust the quality parameter as needed)
              const resizedImage: string =
                await this.imageCompress.compressFile(dataUrl, -1, 75, 75);

              // Log the compressed size of the image
              const compressedBlob = this.dataURLtoBlob(resizedImage);
              console.log(
                'Compressed Size:',
                this.calculateFileSizeInKB(compressedBlob.size)
              );
              console.log('Converted to compress JPEG:', compressedBlob);

              // Set the selected file to be the compressed or resized one
              selectedFile = new File([compressedBlob], selectedFile.name, {
                type: 'image/jpeg',
              });
            }
          } else {
            // Image size is within the limit, create URL for the original selected file
            // Proceed with your upload logic...
          }
        } catch (error) {
          console.error('Error processing image:', error);
        }

        this.selectedFileName = selectedFile.name;
        console.log(selectedFile);

        // Check the file size (in bytes)
        if (selectedFile.size > 2 * 1024 * 1024) {
          // Display an error message to the user
          this.fileSizeError =
            'File size exceeds 2MB. Please select a smaller file.';
          return; // Exit the function
        }
        this.file = URL.createObjectURL(selectedFile);
        console.log('Original Image URL:', this.file);
        this.resetInput();
        this.selectedFile = selectedFile;
        this.fileSizeError = null; // Reset the error message
      }
    }
  }

  uploadphoto() {
    this.uploadphotoloading = true;
    this.photonotchanged = true;

    this.userService
      .updateProfilePhoto(this.userId, this.selectedFile)
      .subscribe((res: any) => {
        this.message.success('User Profile Updated Successfully!');
        this.uploadphotoloading = false;

        this.userService.fetchProfilePhoto();
        this.seaService.triggerPhotoUploaded();
      });
  }

  async gettransactionData() {
    await this.enduserService
      .getTransactionsofUser(this.userId)
      .subscribe((res: any) => {
        console.log(res);
      });
  }

  saveChanges() {
    this.savechangesloading = true;

    this.placeholderColor = this.generateRandomColor();
    console.log(this.adduserform.value);

    // Deep copy the form values
    this.originalFormValues = JSON.parse(
      JSON.stringify(this.adduserform.value)
    );

    this.userService
      .updateUserByUserId(this.userId, this.adduserform.value)
      .subscribe({
        next: async (res: any) => {
          this.message.success('User updated successfully');
          this.savechangesloading = false;
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  closeAccount() {
    this.message.success('Account deactivated');
  }

  cancelChanges() {
    Object.keys(this.adduserform.controls).forEach((controlName) => {
      const control = this.adduserform.get(controlName);
      if (control && (control.dirty || control.touched)) {
        control.setValue(this.originalFormValues[controlName]);
        control.markAsPristine();
        control.markAsUntouched();
      }
    });
    this.adduserform.patchValue(this.originalFormValues);
  }

  changePassword() {
    // this.message.success('Password changed successfully')
    if (this.changePasswordForm.valid) {
      this.userService
        .updatePassword(this.userId, this.changePasswordForm.value)
        .subscribe({
          next: async (res: any) => {
            if (res.success) {
              this.message.success(res.message);
              this.changePasswordForm.reset();
            } else {
              this.message.error(res.message);
              this.changePasswordForm.reset();
            }
          },
          error: (error) => {
            this.message.error('Failed to change Password');
            this.changePasswordForm.reset();
          },
        });
    }
  }

  saveChanges2() {
    console.log('Hello');
    this.message.success('Updated ');
  }

  convertFileToDataUrl(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  calculateFileSizeInKB(sizeInBytes: number): string {
    const sizeInKB = sizeInBytes / 1024; // Convert bytes to kilobytes
    return sizeInKB.toFixed(2) + ' KB';
  }

  dataURLtoBlob(dataURL: string): Blob {
    const byteString = atob(dataURL.split(',')[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }

    return new Blob([arrayBuffer], { type: 'image/jpeg' });
  }

  resetInput() {
    const input = document.getElementById(
      'avatar-input-file'
    ) as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  }

  convertToJPEG(dataUrl: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.src = dataUrl;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, img.width, img.height);

        // Convert the image to a JPEG data URL
        const jpegDataUrl = canvas.toDataURL('image/jpeg');
        resolve(jpegDataUrl);
      };

      img.onerror = reject;
    });
  }
  nationalities = nationalities;
  userdata: any;
  capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  fetchUserByUserId() {
    this.userService.fetchUserByUserId(this.userId).subscribe({
      next: async (res: any) => {
        console.log('userdata', res);
        this.userdata = res;
        this.file = this.userdata.profilePhoto;
        this.isSpinning = false;

        this.adduserform.patchValue(res);
        this.originalFormValues = JSON.parse(
          JSON.stringify(this.adduserform.value)
        );
        res.role = this.capitalizeFirstLetter(res.role);
      },

      error: (err) => {
        console.log(err);
      },
    });
  }

  async ngOnInit(): Promise<void> {
    const currentTheme = this.themeService.getSavedTheme();
    this.themeSubscription = this.themeService
      .isDarkThemeObservable()
      .subscribe((isDark: boolean) => {
        this.isDarkTheme = isDark;
      });
    this.isSpinning = true;
    for (let i = 0; i < 30; i++) {
      this.tabs.push({
        name: `Tab ${i}`,
        disabled: i === 28,
        content: `Content of tab ${i}`,
      });
    }

    this.userId = await this.authService.getIdFromToken();
    this.gettransactionData();
    this.fetchUserByUserId();
  }
}
