// // src/app/pages/vault-management/vault-management.component.ts
// import { Component, inject, signal, computed } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { DataService } from '../../shared/services/data.service';
// import { ToastService } from '../../shared/services/toast.service';
// import { PickupRequest, LAI, DocItem } from '../../shared/models/models';

// type Panel = 'branches' | 'lais' | 'items';
// type TabName = 'track' | 'upload';

// @Component({
//   selector: 'app-vault-management',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   template: `
//     <!-- Tabs -->
//     <div class="tabs">
//       <button class="tab" [class.active]="activeTab() === 'track'" (click)="activeTab.set('track')">Track Pickups</button>
//       <button class="tab" [class.active]="activeTab() === 'upload'" (click)="activeTab.set('upload')">Upload Acknowledgement</button>
//     </div>

//     <!-- ── TRACK PICKUPS ── -->
//     @if (activeTab() === 'track') {
//       <!-- Breadcrumb -->
//       <div class="bc-bar">
//         <span [class]="panel() === 'branches' ? 'bc-current' : 'bc-link'" (click)="goPanel('branches')">All Branches</span>
//         @if (panel() !== 'branches') {
//           <span class="bc-sep">›</span>
//           <span [class]="panel() === 'lais' ? 'bc-current' : 'bc-link'" (click)="goPanel('lais')">{{ curPR()?.branch }}</span>
//         }
//         @if (panel() === 'items') {
//           <span class="bc-sep">›</span>
//           <span class="bc-current">{{ curLAI()?.lai }}</span>
//         }
//       </div>

//       <!-- PANEL 1: Branch list -->
//       @if (panel() === 'branches') {
//         <div class="filter-bar">
//           <input class="search-input" type="text" placeholder="Search branch, LAI, customer…" [(ngModel)]="searchQ" />
//           <select class="filter-select" [(ngModel)]="statusFilter">
//             <option value="">All Statuses</option>
//             <option value="Pending">Pending</option>
//             <option value="Scheduled">Scheduled</option>
//             <option value="Picked Up">Picked Up</option>
//             <option value="Acknowledged">Acknowledged</option>
//           </select>
//           <span style="margin-left:auto;font-size:12px;color:var(--text3);">{{ filteredBranches().length }} requests</span>
//         </div>
//         <div class="card">
//           <div class="card-header">
//             <div><div class="card-title">Pickup Requests — by Branch</div><div class="card-sub">Salesforce Document List · Click any row to see LAIs & documents</div></div>
//             <button class="btn sm">⬇ Export CSV</button>
//           </div>
//           <div style="overflow-x:auto;"><table>
//             <thead><tr><th></th><th>Branch</th><th>Branch Address</th><th>CSM / BM</th><th>Mobile</th><th>LAIs</th><th>Total Docs</th></tr></thead>
//             <tbody>
//               @for (r of filteredBranches(); track r.id) {
//                 <tr class="clickable" (click)="openBranch(r)">
//                   <td style="color:var(--accent);font-size:20px;font-weight:300;padding:0 6px 0 14px;">›</td>
//                   <td style="font-weight:600;white-space:nowrap;">{{ r.branch }}</td>
//                   <td style="font-size:12px;color:var(--text2);max-width:185px;line-height:1.4;">{{ branchAddr(r.branch) }}</td>
//                   <td>{{ r.csm }}</td>
//                   <td class="mono">{{ r.mob }}</td>
//                   <td class="mono" style="font-weight:700;">{{ r.lais.length }}</td>
//                   <td class="mono" style="font-weight:700;color:var(--accent);">{{ totalDocs(r) }}</td>
//                 </tr>
//               }
//             </tbody>
//           </table></div>
//         </div>
//       }

//       <!-- PANEL 2: LAI list -->
//       @if (panel() === 'lais') {
//         <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
//           <button class="btn sm" (click)="goPanel('branches')">← Back to Branches</button>
//           <div style="font-size:12px;color:var(--text3);">
//             Request {{ curPR()?.id }} &nbsp;·&nbsp; POD: {{ curPR()?.pod || 'Pending' }} &nbsp;·&nbsp; {{ curPR()?.req }} &nbsp;·&nbsp;
//             <span class="badge" [ngClass]="badgeClass(curPR()?.status || '')">{{ curPR()?.status }}</span>
//           </div>
//         </div>
//         <div class="addr-banner">
//           <svg viewBox="0 0 16 16" fill="none" stroke="var(--text3)" stroke-width="1.5" style="width:14px;height:14px;flex-shrink:0;margin-top:2px;"><path d="M8 1C5.8 1 4 2.8 4 5c0 3 4 8 4 8s4-5 4-8c0-2.2-1.8-4-4-4z"/><circle cx="8" cy="5" r="1.5"/></svg>
//           <div>
//             <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--text3);margin-bottom:2px;">Branch Pickup Address</div>
//             <div style="font-size:13px;">{{ branchAddr(curPR()?.branch || '') }}</div>
//           </div>
//         </div>
//         <div class="mcards">
//           <div class="mc"><div class="mc-lbl">Total LAIs</div><div class="mc-val">{{ curPR()?.lais.length }}</div></div>
//           <div class="mc"><div class="mc-lbl">Total Documents</div><div class="mc-val" style="color:var(--accent);">{{ totalDocs(curPR()!) }}</div></div>
//           <div class="mc"><div class="mc-lbl">Physical / Original</div><div class="mc-val" style="color:var(--purple);">{{ countType(curPR()!, ['Physical','Original']) }}</div></div>
//           <div class="mc"><div class="mc-lbl">Certified + Photocopy</div><div class="mc-val">{{ countType(curPR()!, ['Certified','Photocopy']) }}</div></div>
//         </div>
//         <div class="card">
//           <div class="card-header">
//             <div><div class="card-title">{{ curPR()?.branch }} — LAI Document Lists</div><div class="card-sub">1 row = 1 customer LAI → 1 Salesforce Document List · Click Acknowledged row to view Document Items</div></div>
//           </div>
//           <div style="overflow-x:auto;"><table>
//             <thead><tr><th></th><th>LAI Number</th><th>Customer Name</th><th>No. of Files</th><th>Sent to Kleeto</th><th>Consignment</th><th>Status</th><th>Action</th><th></th></tr></thead>
//             <tbody>
//               @for (l of curPR()!.lais; track l.lai) {
//                 <tr [class.clickable]="l.status === 'Acknowledged'" (click)="l.status === 'Acknowledged' && openLAI(l)">
//                   <td style="padding:0 6px 0 14px;font-size:20px;font-weight:300;" [style.color]="l.status === 'Acknowledged' ? 'var(--accent)' : 'var(--border2)'">
//                     {{ l.status === 'Acknowledged' ? '›' : '—' }}
//                   </td>
//                   <td class="mono" [style.color]="l.status === 'Acknowledged' ? 'var(--accent)' : 'var(--text2)'" style="font-weight:700;">{{ l.lai }}</td>
//                   <td style="font-weight:500;">{{ l.cust }}</td>
//                   <td class="mono" [style.color]="l.status === 'Acknowledged' ? 'var(--accent)' : 'var(--text2)'" style="font-weight:700;">{{ l.docs.length }}</td>
//                   <td>{{ l.sent }}</td>
//                   <td class="mono">{{ l.cons || '—' }}</td>
//                   <td [id]="'status-' + l.lai"><span class="badge" [ngClass]="badgeClass(l.status)">{{ l.status }}</span></td>
//                   <td (click)="$event.stopPropagation()">
//                     @if (l.status !== 'Acknowledged') {
//                       <button class="btn sm" style="background:var(--green-bg);color:var(--green);border-color:var(--green-border);"
//                               (click)="acknowledge(l.lai)">✓ Acknowledge</button>
//                     } @else {
//                       <button class="btn sm" style="background:var(--yellow-bg);color:var(--yellow);border-color:var(--yellow-border);"
//                               (click)="revert(l.lai)">↩ Mark as Pending</button>
//                     }
//                   </td>
//                   <td (click)="$event.stopPropagation()">
//                     <button class="btn sm" (click)="openTimelineModal()">📋 Timeline</button>
//                   </td>
//                 </tr>
//               }
//             </tbody>
//           </table></div>
//         </div>
//       }

//       <!-- PANEL 3: Document Items -->
//       @if (panel() === 'items') {
//         <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
//           <button class="btn sm" (click)="goPanel('lais')">← Back to LAIs</button>
//           <div style="display:flex;gap:6px;">
//             <span class="badge badge-physical">Physical/Orig: {{ countDocType(curLAI()!, ['Physical','Original']) }}</span>
//             <span class="badge badge-certified">Certified: {{ countDocType(curLAI()!, ['Certified']) }}</span>
//             <span class="badge badge-photocopy">Photocopy: {{ countDocType(curLAI()!, ['Photocopy']) }}</span>
//           </div>
//         </div>
//         <div class="mcards">
//           <div class="mc"><div class="mc-lbl">LAI Number</div><div class="mc-val" style="font-size:14px;">{{ curLAI()?.lai }}</div></div>
//           <div class="mc"><div class="mc-lbl">Customer</div><div class="mc-val" style="font-size:13px;font-weight:500;">{{ curLAI()?.cust }}</div></div>
//           <div class="mc"><div class="mc-lbl">SF Document List ID</div><div class="mc-val" style="font-size:14px;">{{ curLAI()?.sfid }}</div></div>
//           <div class="mc"><div class="mc-lbl">Total Document Items</div><div class="mc-val" style="color:var(--accent);">{{ curLAI()?.docs.length }}</div></div>
//         </div>
//         <div class="card" style="margin-top:16px;">
//           <div class="card-header">
//             <div><div class="card-title">{{ curLAI()?.lai }} — Document Items ({{ curLAI()?.cust }})</div><div class="card-sub">Child records of Salesforce Document List</div></div>
//           </div>
//           <div style="overflow-x:auto;"><table>
//             <thead><tr><th>#</th><th>Category</th><th>Subcategory</th><th>Label</th><th>Doc Type</th><th>Consignment ID</th><th>Sent to Kleeto</th><th>Vault Status</th><th>Vaulted On</th><th>Action</th></tr></thead>
//             <tbody>
//               @for (d of curLAI()!.docs; track $index) {
//                 <tr>
//                   <td class="mono" style="color:var(--text3);">{{ $index + 1 }}</td>
//                   <td style="font-size:12px;">{{ d.cat }}</td>
//                   <td style="font-size:12px;color:var(--text2);">{{ d.subcat }}</td>
//                   <td style="font-weight:500;">{{ d.label }}</td>
//                   <td><span class="badge" [ngClass]="docTypeBadge(d.type)">{{ d.type }}</span></td>
//                   <td class="mono">{{ d.cons || '—' }}</td>
//                   <td>{{ d.sent || '—' }}</td>
//                   <td><span class="badge" [ngClass]="d.vault === 'Vaulted' ? 'badge-acked' : 'badge-vault-pending'">{{ d.vault || 'Vault Pending' }}</span></td>
//                   <td class="mono" style="font-size:12px;color:var(--text2);">{{ d.vaultedAt || '—' }}</td>
//                   <td>
//                     @if (d.vault !== 'Vaulted') {
//                       <button class="btn sm" style="background:var(--green-bg);color:var(--green);border-color:var(--green-border);"
//                               (click)="toggleVault($index)">✓ Mark Vaulted</button>
//                     } @else {
//                       <button class="btn sm" style="background:var(--yellow-bg);color:var(--yellow);border-color:var(--yellow-border);"
//                               (click)="toggleVault($index)">↩ Mark Vault Pending</button>
//                     }
//                   </td>
//                 </tr>
//               }
//             </tbody>
//           </table></div>
//         </div>
//       }
//     }

//     <!-- ── UPLOAD ACKNOWLEDGEMENT ── -->
//     @if (activeTab() === 'upload') {
//       <div class="card">
//         <div class="card-header"><div class="card-title">Upload Acknowledgement Sheet</div></div>
//         <div style="padding:18px;">
//           <div style="padding:12px 14px;background:var(--accent-bg);border:1px solid #BFDBFE;border-radius:8px;font-size:12px;color:var(--accent-text);margin-bottom:16px;">
//             ℹ Upload the acknowledgement sheet against the LAIs you have received. HomeFirst will be notified automatically once processed.
//           </div>
//           <div style="border:2px dashed var(--border2);border-radius:10px;padding:32px;text-align:center;cursor:pointer;">
//             <div style="font-size:24px;margin-bottom:8px;">📁</div>
//             <div style="font-size:14px;font-weight:500;margin-bottom:4px;">Drop Acknowledgement Sheet here</div>
//             <div style="font-size:12px;color:var(--text3);">CSV or XLSX · columns: LAI Code, Folder ID, Reference No, Create Date, Document ID</div>
//             <button class="btn pri" style="margin-top:14px;" (click)="toast.show('File uploaded — 2 LAIs processed')">Browse & Upload</button>
//           </div>
//         </div>
//       </div>
//     }

//     <!-- Timeline Modal -->
//     @if (showTimeline()) {
//       <div class="modal-overlay" (click)="showTimeline.set(false)">
//         <div class="modal" (click)="$event.stopPropagation()">
//           <div class="modal-header"><span class="modal-title">Pickup Timeline</span><button class="close-btn" (click)="showTimeline.set(false)">×</button></div>
//           <div class="modal-body">
//             <div style="display:flex;flex-direction:column;gap:0;">
//               @for (step of timelineSteps; track step.title) {
//                 <div style="display:flex;gap:14px;position:relative;" [style.paddingBottom.px]="18">
//                   <div style="width:24px;height:24px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;margin-top:10px;z-index:1;"
//                        [style.background]="step.done ? 'var(--green-bg)' : step.active ? 'var(--accent-bg)' : 'var(--surface2)'"
//                        [style.border]="step.done ? '2px solid var(--green)' : step.active ? '2px solid var(--accent)' : '2px solid var(--border2)'">
//                     @if (step.done) { <span style="font-size:10px;color:var(--green);">✓</span> }
//                   </div>
//                   <div style="padding-top:10px;">
//                     <div style="font-size:13px;font-weight:500;">{{ step.title }}</div>
//                     <div style="font-size:11px;color:var(--text3);margin-top:2px;">{{ step.meta }}</div>
//                   </div>
//                 </div>
//               }
//             </div>
//           </div>
//           <div class="modal-footer"><button class="btn" (click)="showTimeline.set(false)">Close</button></div>
//         </div>
//       </div>
//     }
//   `
// })
// export class VaultManagementComponent {
//   data  = inject(DataService);
//   toast = inject(ToastService);

//   activeTab = signal<TabName>('track');
//   panel     = signal<Panel>('branches');
//   curPR     = signal<PickupRequest | null>(null);
//   curLAI    = signal<LAI | null>(null);
//   searchQ   = '';
//   statusFilter = '';
//   showTimeline = signal(false);

//   timelineSteps = [
//     { title: 'Pickup request created by CSM',              meta: 'Nikshitha Yadav · 08 Oct 2025, 10:30 AM', done: true,  active: false },
//     { title: 'Assigned to Kleeto courier',                 meta: '09 Oct 2025, 9:00 AM',                   done: true,  active: false },
//     { title: 'Documents picked up · POD: 421012927',       meta: '10 Oct 2025, 2:15 PM',                   done: true,  active: false },
//     { title: 'Acknowledgement uploaded · Folder ID: 3049402', meta: '12 Oct 2025',                         done: true,  active: false },
//     { title: 'Awaiting 30-day inventory',                  meta: 'Due 10 Nov 2025',                        done: false, active: true  },
//     { title: 'Reconciliation',                             meta: 'Not started',                            done: false, active: false },
//   ];

//   // filteredBranches = computed(() => {
//   //   const q = this.searchQ.toLowerCase();
//   //   const sf = this.statusFilter;
//   //   return this.data.sfRequests().filter(r => {
//   //     const mq = !q || r.branch.toLowerCase().includes(q) || r.csm.toLowerCase().includes(q) ||
//   //                r.lais.some(l => l.lai.toLowerCase().includes(q) || l.cust.toLowerCase().includes(q));
//   //     return mq && (!sf || r.status === sf);
//   //   });
//   // });

//   // branchAddr(branch: string): string { return this.data.BRANCH_ADDR[branch] || '—'; }
//   totalDocs(r: PickupRequest): number { return r.lais.reduce((s, l) => s + l.docs.length, 0); }
//   countType(r: PickupRequest, types: string[]): number { return r.lais.reduce((s, l) => s + l.docs.filter(d => types.includes(d.type)).length, 0); }
//   countDocType(l: LAI, types: string[]): number { return l.docs.filter(d => types.includes(d.type)).length; }

//   badgeClass(status: string): string {
//     const map: Record<string, string> = { 'Acknowledged': 'badge-acked', 'Picked Up': 'badge-picked', 'Scheduled': 'badge-scheduled', 'Pending': 'badge-pending' };
//     return map[status] || 'badge-pending';
//   }
//   docTypeBadge(type: string): string {
//     if (type === 'Physical' || type === 'Original') return 'badge-physical';
//     if (type === 'Certified') return 'badge-certified';
//     return 'badge-photocopy';
//   }

//   goPanel(p: Panel): void {
//     this.panel.set(p);
//     if (p === 'branches') { this.curPR.set(null); this.curLAI.set(null); }
//     if (p === 'lais') { this.curLAI.set(null); }
//   }

//   openBranch(r: PickupRequest): void { this.curPR.set(r); this.panel.set('lais'); }
//   openLAI(l: LAI): void { this.curLAI.set(l); this.panel.set('items'); }
//   openTimelineModal(): void { this.showTimeline.set(true); }

//   // acknowledge(laiNum: string): void {
//   //   const pr = this.curPR();
//   //   if (!pr) return;
//   //   this.data.acknowledgeLAI(pr.id, laiNum);
//   //   this.curPR.set(this.data.sfRequests().find(r => r.id === pr.id) || null);
//   //   this.toast.show(laiNum + ' marked as Acknowledged');
//   // }

//   // revert(laiNum: string): void {
//   //   const pr = this.curPR();
//   //   if (!pr) return;
//   //   this.data.revertLAI(pr.id, laiNum);
//   //   this.curPR.set(this.data.sfRequests().find(r => r.id === pr.id) || null);
//   //   this.toast.show(laiNum + ' reverted to Picked Up');
//   // }

//   // toggleVault(idx: number): void {
//   //   const pr = this.curPR();
//   //   const l  = this.curLAI();
//   //   if (!pr || !l) return;
//   //   this.data.toggleVault(pr.id, l.lai, idx);
//   //   const updatedPR = this.data.sfRequests().find(r => r.id === pr.id)!;
//   //   const updatedLAI = updatedPR.lais.find(x => x.lai === l.lai)!;
//   //   this.curPR.set(updatedPR);
//   //   this.curLAI.set(updatedLAI);
//   //   const d = updatedLAI.docs[idx];
//   //   this.toast.show(d.vault === 'Vaulted' ? `Vaulted at ${d.vaultedAt}` : 'Reverted to Vault Pending');
//   // }
// }
