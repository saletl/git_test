import type { PageId } from '../coloring/catalog';

/**
 * The seam for a future "email the coloring book" feature.
 *
 * Today the only implementation is `disconnectedDelivery`: it never makes a network request,
 * never stores the address, and never claims a message was sent. When email is set up for real
 * (see docs/EMAIL-INTEGRATION.md), add a second implementation that calls the server endpoint
 * and swap it in below. Nothing else in the app needs to change.
 */

export interface ColoringBookEmailRequest {
  email: string;
  /** Which pages to include. The server rebuilds the PDF from these ids. */
  pages: PageId[];
  /** A separate, optional newsletter opt-in. It must never affect delivery. */
  newsletter: boolean;
}

export type DeliveryResult =
  | { status: 'not_connected' }
  | { status: 'sent'; newsletter: 'not_requested' | 'received' | 'unavailable' }
  | { status: 'error'; message: string; retry: boolean };

export interface ColoringBookDelivery {
  /** False while email is a preview only. */
  readonly connected: boolean;
  send(request: ColoringBookEmailRequest): Promise<DeliveryResult>;
}

export const NOT_CONNECTED_MESSAGE = "Email delivery isn't connected yet. You can download your coloring book now!";

/** The development stand-in. It deliberately ignores the request: nothing is sent, logged or kept. */
export const disconnectedDelivery: ColoringBookDelivery = {
  connected: false,
  async send() {
    return { status: 'not_connected' };
  },
};

/** The delivery the app uses. Replace with a connected implementation after the integration checklist is done. */
export const coloringBookDelivery: ColoringBookDelivery = disconnectedDelivery;

/** Friendly format check, done on the device. A real server must validate again. */
export function isLikelyEmail(value: string): boolean {
  const email = value.trim();
  return email.length >= 6 && email.length <= 254 && /^[^\s@,;<>"]+@[^\s@,;<>"]+\.[A-Za-z]{2,}$/.test(email);
}
