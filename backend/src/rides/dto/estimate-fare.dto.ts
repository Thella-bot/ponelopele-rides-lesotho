export class EstimateFareDto {
  pickupLat: number;
  pickupLng: number;
  destLat: number;
  destLng: number;
  // durationMinutes is optional as it might not be available during initial estimation
  durationMinutes?: number;
}