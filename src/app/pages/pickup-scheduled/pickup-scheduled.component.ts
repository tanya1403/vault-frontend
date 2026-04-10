// // src/app/pages/pickup-scheduled/pickup-scheduled.component.ts
// import { Component, inject, computed } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { DataService } from '../../shared/services/data.service';
// import { ToastService } from '../../shared/services/toast.service';

// @Component({
//   selector: 'app-pickup-scheduled',
//   standalone: true,
//   imports: [CommonModule],
//   template: `
//     <div class="card">
//       <div class="card-header">
//         <div>
//           <div class="card-title">Pickup Scheduled</div>
//           <div class="card-sub">Confirmed by Kleeto — courier assigned, awaiting actual collection</div>
//         </div>
//         <span class="badge badge-scheduled" style="font-size:12px;padding:4px 12px;">{{ scheduled().length }} scheduled</span>
//       </div>
//       <div style="overflow-x:auto;">
//         <table>
//           <thead>
//             <tr>
//               <th>Branch</th><th>Branch Address</th><th>CSM / BM</th><th>Mobile</th>
//               <th>No. of Files</th><th>No. of Boxes</th><th>Pickup Date</th>
//               <th>POD / Consignment</th><th>Confirmed At</th><th>Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             @for (r of scheduled(); track r.id) {
//               <tr>
//                 <td style="font-weight:600;">{{ r.branch }}</td>
//                 <td style="font-size:12px;color:var(--text2);max-width:180px;line-height:1.4;">{{ r.addr }}</td>
//                 <td>{{ r.csm }}</td>
//                 <td class="mono">{{ r.mob }}</td>
//                 <td class="mono">{{ r.files }}</td>
//                 <td class="mono">{{ r.boxes }}</td>
//                 <td class="mono">{{ r.date }}</td>
//                 <td class="mono">{{ r.pod || '—' }}</td>
//                 <td style="font-size:12px;color:var(--text2);">{{ r.confirmedAt }}</td>
//                 <td>
//                   <button class="btn sm" style="background:var(--purple-bg);color:var(--purple);border-color:var(--purple-border);"
//                           (click)="markIntransit(r.id, r.branch)">
//                     🚚 Mark Intransit
//                   </button>
//                 </td>
//               </tr>
//             }
//             @empty {
//               <tr><td colspan="10" style="text-align:center;color:var(--text3);padding:32px;">No scheduled pickups yet. Confirm requests from Request for Pickup.</td></tr>
//             }
//           </tbody>
//         </table>
//       </div>
//     </div>
//   `
// })
// export class PickupScheduledComponent {
//   data  = inject(DataService);
//   toast = inject(ToastService);

//   scheduled = computed(() => this.data.kleetoRequests().filter(r => r.state === 'scheduled'));

//   markIntransit(id: string, branch: string): void {
//     this.data.markIntransit(id);
//     this.toast.show(`${branch} marked as Intransit`);
//   }
// }
