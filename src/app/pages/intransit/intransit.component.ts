// // src/app/pages/intransit/intransit.component.ts
// import { Component, inject, computed } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router } from '@angular/router';
// import { DataService } from '../../shared/services/data.service';
// import { ToastService } from '../../shared/services/toast.service';

// @Component({
//   selector: 'app-intransit',
//   standalone: true,
//   imports: [CommonModule],
//   template: `
//     <div class="card">
//       <div class="card-header">
//         <div>
//           <div class="card-title">Intransit</div>
//           <div class="card-sub">Documents picked up — courier en route to vault</div>
//         </div>
//         <span class="badge badge-picked" style="font-size:12px;padding:4px 12px;">{{ intransit().length }} intransit</span>
//       </div>
//       <div style="overflow-x:auto;">
//         <table>
//           <thead>
//             <tr>
//               <th>Branch</th><th>Branch Address</th><th>CSM / BM</th><th>Mobile</th>
//               <th>No. of Files</th><th>No. of Boxes</th><th>Pickup Date</th>
//               <th>POD No.</th><th>Picked Up At</th><th>Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             @for (r of intransit(); track r.id) {
//               <tr>
//                 <td style="font-weight:600;">{{ r.branch }}</td>
//                 <td style="font-size:12px;color:var(--text2);max-width:180px;line-height:1.4;">{{ r.addr }}</td>
//                 <td>{{ r.csm }}</td>
//                 <td class="mono">{{ r.mob }}</td>
//                 <td class="mono">{{ r.files }}</td>
//                 <td class="mono">{{ r.boxes }}</td>
//                 <td class="mono">{{ r.date }}</td>
//                 <td class="mono">{{ r.pod || '—' }}</td>
//                 <td style="font-size:12px;color:var(--text2);">{{ r.pickedAt }}</td>
//                 <td>
//                   <button class="btn sm" style="background:var(--green-bg);color:var(--green);border-color:var(--green-border);"
//                           (click)="markDelivered(r.id, r.branch, r.pod)">
//                     ✓ Delivered to Vault
//                   </button>
//                 </td>
//               </tr>
//             }
//             @empty {
//               <tr><td colspan="10" style="text-align:center;color:var(--text3);padding:32px;">No documents intransit. Mark pickups as collected from Pickup Scheduled.</td></tr>
//             }
//           </tbody>
//         </table>
//       </div>
//     </div>
//   `
// })
// export class IntransitComponent {
//   data   = inject(DataService);
//   toast  = inject(ToastService);
//   router = inject(Router);

//   intransit = computed(() => this.data.kleetoRequests().filter(r => r.state === 'intransit'));

//   markDelivered(id: string, branch: string, pod: string): void {
//     this.data.markDelivered(id);
//     this.toast.show(`${branch} delivered to vault · POD: ${pod}`);
//     this.router.navigate(['/delivered']);
//   }
// }
