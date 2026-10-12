export interface AppointmentDetails {
  timeInterval: string;
  conferenceId: string;
  bookId: string;
  bookStatus: string;
}
export const bookStatusColor = new Map([
  ['RESERVED', '#1578FF'],
  ['RESERVABLE', '#FFFFFF'],
  ['BEING_USED', '#F69703'],
  ['EXPIRE', '#F7F8F9']
])
