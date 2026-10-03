// GVD Auto World — TypeScript Type Definitions

export type UserRole = 'CUSTOMER' | 'TECHNICIAN' | 'STAFF' | 'ADMIN'

export type VehicleType = 'TWO_WHEELER' | 'FOUR_WHEELER'

export type JobCardStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'QUALITY_CHECK'
  | 'READY'
  | 'COMPLETED'
  | 'CLOSED'

export type ComponentStatus = 'GOOD' | 'SERVICED' | 'NEED_REPLACE'

export type ItemCategory = 'SPARE' | 'LABOUR' | 'LUBE' | 'DETAILING'

export type DentSeverity = 'NO_DENT' | 'MINOR_SCRATCH' | 'MEDIUM_DENT' | 'MAJOR_DAMAGE'

export interface DentPhoto {
  angleIndex: number
  angleKey: string
  title: string
  description: string
  photoUri: string
  hasDent: boolean
  severity: DentSeverity
  notes: string
}

export interface JobCardItem {
  id: number
  jobCardId: number
  category: ItemCategory
  name: string
  quantity: number
  unitPrice: number
  discount: number
  totalAmount: number
}

export interface JobCard {
  id: number
  jobCardNumber: string
  customerName: string
  customerMobile: string
  customerEmail: string
  vehicleNumber: string
  vehicleType: VehicleType
  make: string
  model: string
  variant: string
  odometerKm: number
  fuelLevelPercent: number
  accessoriesNotes: string
  customerVoice: string
  dentNotes: string
  dentPhotos: DentPhoto[]
  status: JobCardStatus
  totalSpares: number
  totalLabour: number
  totalLubes: number
  totalAmount: number
  advancePaid: number
  balanceAmount: number
  deliveryDateTime: string
  isSmsAlertEnabled: boolean
  isPaidOnline: boolean
  items: JobCardItem[]
  createdAt: string
  updatedAt: string
}

export interface InventoryItem {
  id: number
  partName: string
  partNumber: string
  category: ItemCategory
  compatibleType: VehicleType
  unitPrice: number
  stockQuantity: number
  minThresholdAlert: number
  unit: string
}

export interface ComponentInspection {
  id: number
  vehicleNumber: string
  jobCardId: number
  componentKey: string
  componentName: string
  category: string
  angle: string
  status: ComponentStatus
  technicianNotes: string
  worksTillInfo: string
  recommendedAction: string
  replacementCost: number
  workPhotoUrl: string
  lastServicedDate: string
}

export interface CustomerReview {
  id: number
  customerName: string
  customerMobile: string
  vehicleNumber: string
  vehicleModel: string
  serviceType: string
  rating: number
  aspectPunctuality: number
  aspectCleanliness: number
  aspectPricing: number
  tags: string
  comment: string
  jobCardNumber: string
  adminResponse: string
  isVerifiedClient: boolean
  createdAt: string
}

export interface ServiceAppointment {
  id: number
  customerName: string
  customerPhone: string
  vehicleNumber: string
  vehicleType: VehicleType
  servicePackage: string
  preferredDate: string
  preferredSlot: string
  isDoorstepPickup: boolean
  customerVoice: string
  status: string
  createdAt: string
}

export interface PurchaseOrder {
  id: number
  poNumber: string
  supplierName: string
  supplierAddress: string
  supplierContact: string
  status: string
  totalItemsCount: number
  totalUnitsCount: number
  subtotal: number
  gstAmount: number
  grandTotal: number
  notes: string
  createdAt: string
}

export interface ServiceReminder {
  id: number
  vehicleNumber: string
  customerName: string
  customerMobile: string
  reminderType: string
  dueDate: string
  messageText: string
  status: string
  isWhatsappTriggered: boolean
}

export interface Workshop {
  name: string
  address: string
  coordinates: { latitude: number; longitude: number }
  googleMapsUrl: string
  phone: string
  email: string
}

export interface AuthUser {
  role: UserRole
  name: string
  username: string
}
