import { Component, OnInit } from '@angular/core';

import { DeviceDetectorService } from 'ngx-device-detector';
import { Device } from '@capacitor/device';
import { SystemInfoService } from 'src/services/system-info.service';
import { NgZone } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

declare const window: any;

@Component({
  selector: 'app-device-info',
  templateUrl: './device-info.component.html',
  styleUrls: ['./device-info.component.css'],
})
export class DeviceInfoComponent {
  capacitorandroidinfo: any;
  capacitorandroidinfo2: any;
  deviceInfo: any;
  systemInfo: any;
  browserData: any;
  systemInformation: any;
  info: any;
  async logDeviceInfo() {
    this.info = await Device.getInfo();
    this.capacitorandroidinfo2 = await Device.getId();

    // Generate UUID if not available from capacitorandroidinfo2
    if (!this.capacitorandroidinfo2.uuid) {
      this.capacitorandroidinfo2.uuid = uuidv4();
    }

    console.log(this.capacitorandroidinfo2);
  }

  constructor(
    private deviceService: DeviceDetectorService,
    private systemInfoService: SystemInfoService,
    private ngZone: NgZone
  ) {
    window.addEventListener('systemInformation', (event: any) => {
      this.ngZone.run(() => {
        this.systemInformation = event.detail; // Update the variable with the system information
      });
    });
  }
  async fetchSystemInfo() {
    this.systemInfo = await this.systemInfoService.getSystemInfo();
    // Optionally, you can log the system information to the console.
  }
  // fetchDeviceInfo() {
  //   window.systeminformation
  //     .getStaticData()
  //     .then((info: any) => {
  //       this.deviceInfo = info;
  //     })
  //     .catch((error: any) => {
  //       console.error('Error fetching device information:', error);
  //     });
  // }
  uuid: any;
  dummy: any;
  uuidmobile: any;
  deviceName: any;
  // async deviceinfo2() {

  //   this.uuidmobile = this.capacitorandroidinfo2.uuid;

  //   this.browserData = this.deviceService.getDeviceInfo();
  //   this.dummy = 2;
  //   this.deviceName = this.systemInfo.os.hostname;
  //   if (this.capacitorandroidinfo.platform === 'web') {
  //     this.uuid = localStorage.getItem('device_uuid') || uuidv4();
  //     localStorage.setItem('device_uuid', this.uuid);
  //   } else {
  //     this.uuid = this.capacitorandroidinfo2.uuid;
  //   }
  //   alert('hie2');
  // }

  async ngOnInit(): Promise<void> {
    this.logDeviceInfo();
    this.fetchSystemInfo();
  }
}
