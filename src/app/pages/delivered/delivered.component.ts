// // src/app/pages/delivered/delivered.component.ts
// import { Component, inject, computed } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { DataService } from '../../shared/services/data.service';

// @Component({
//   selector: 'app-delivered',
//   standalone: true,
//   imports: [CommonModule],
//   template: `
//     <div class="card">
//       <div class="card-header">
//         <div>
//           <div class="card-title">Delivered to Vault</div>
//           <div class="card-sub">Documents successfully delivered — no further action required</div>
//         </div>
//         <span class="badge badge-acked" style="font-size:12px;padding:4px 12px;">{{ delivered().length }} delivered</span>
//       </div>
//       <div style="overflow-x:auto;">
//         <table>
//           <thead>
//             <tr>
//               <th>Branch</th><th>Branch Address</th><th>CSM / BM</th><th>Mobile</th>
//               <th>No. of Files</th><th>No. of Boxes</th><th>Pickup Date</th>
//               <th>POD No.</th><th>Picked Up At</th><th>Delivered At</th>
//             </tr>
//           </thead>
//           <tbody>
//             @for (r of delivered(); track r.id) {
//               <tr>
//                 <td style="font-weight:600;">{{ r.branch }}</td>
//                 <td style="font-size:12px;color:var(--text2);max-width:180px;line-height:1.4;">{{ r.addr }}</td>
//                 <td>{{ r.csm }}</td>
//                 <td class="mono">{{ r.mob }}</td>
//                 <td class="mono">{{ r.files }}</td>
//                 <td class="mono">{{ r.boxes }}</td>
//                 <td class="mono">{{ r.date }}</td>
//                 <td class="mono">{{ r.pod || '—' }}</td>
//                 <td style="font-size:12px;color:var(--text2);">{{ r.pickedAt || '—' }}</td>
//                 <td style="font-size:12px;color:var(--green);font-weight:500;">{{ r.deliveredAt || '—' }}</td>
//               </tr>
//             }
//             @empty {
//               <tr><td colspan="10" style="text-align:center;color:var(--text3);padding:32px;">No deliveries yet.</td></tr>
//             }
//           </tbody>
//         </table>
//       </div>
//     </div>
//   `
// })
// export class DeliveredComponent {
//   data = inject(DataService);
//   delivered = computed(() => this.data.kleetoRequests().filter(r => r.state === 'delivered'));
// }
